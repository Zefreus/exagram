import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Heart, Upload, FileText, MessageCircle, CreditCard, 
    Settings, LogOut, Plus, Clock, ArrowRight, Loader2, X, Check
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, api, logout, refreshUser } = useAuth();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [packages, setPackages] = useState([]);
    const [showPackages, setShowPackages] = useState(false);

    useEffect(() => {
        fetchExams();
        fetchPackages();
        handlePaymentCallback();
    }, []);

    const handlePaymentCallback = async () => {
        const paymentStatus = searchParams.get('payment');
        const sessionId = searchParams.get('session_id');
        
        if (paymentStatus === 'success' && sessionId) {
            toast.loading('Verificando pagamento...');
            try {
                // Poll for payment status
                let attempts = 0;
                const maxAttempts = 5;
                
                while (attempts < maxAttempts) {
                    const response = await api.get(`/payments/status/${sessionId}`);
                    if (response.data.payment_status === 'paid') {
                        toast.dismiss();
                        toast.success('Pagamento confirmado! Créditos adicionados.');
                        await refreshUser();
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    attempts++;
                }
            } catch (error) {
                toast.dismiss();
                toast.error('Erro ao verificar pagamento');
            }
            // Clean URL
            navigate('/dashboard', { replace: true });
        } else if (paymentStatus === 'cancelled') {
            toast.info('Pagamento cancelado');
            navigate('/dashboard', { replace: true });
        }
    };

    const fetchExams = async () => {
        try {
            const response = await api.get('/exams');
            setExams(response.data);
        } catch (error) {
            console.error('Failed to fetch exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPackages = async () => {
        try {
            const response = await api.get('/packages');
            setPackages(response.data.packages);
        } catch (error) {
            console.error('Failed to fetch packages:', error);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    };

    const handleFiles = (files) => {
        const validFiles = files.filter(file => {
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            return validTypes.includes(file.type);
        });
        
        if (validFiles.length !== files.length) {
            toast.warning('Alguns arquivos foram ignorados. Aceitos: PDF, JPG, PNG');
        }
        
        setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error('Selecione pelo menos um arquivo');
            return;
        }
        
        if (user.exam_credits < 1) {
            toast.error('Créditos insuficientes. Adquira mais análises.');
            setShowPackages(true);
            return;
        }
        
        setUploading(true);
        
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });
        formData.append('confirm_same_exam', 'true');
        
        try {
            const response = await api.post('/exams/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success('Exame analisado com sucesso!');
            setSelectedFiles([]);
            await refreshUser();
            navigate(`/exam/${response.data.exam_id}`);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Erro ao processar exame');
        } finally {
            setUploading(false);
        }
    };

    const handleBuyCredits = async (packageId) => {
        try {
            const response = await api.post('/payments/checkout', {
                package_id: packageId,
                origin_url: window.location.origin
            });
            
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            toast.error('Erro ao iniciar pagamento');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-[#F1EFE8]">
            {/* Header */}
            <header className="bg-white border-b border-[#EBE9E1] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#1D9E75] rounded-full flex items-center justify-center">
                                <Heart className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-xl text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                                Exagram
                            </span>
                        </Link>
                        
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 bg-[#1D9E75]/10 rounded-full px-4 py-2">
                                <CreditCard className="w-4 h-4 text-[#1D9E75]" />
                                <span className="text-sm font-medium text-[#1D9E75]" data-testid="credits-display">
                                    {user?.exam_credits || 0} crédito{user?.exam_credits !== 1 ? 's' : ''}
                                </span>
                            </div>
                            
                            <Link to="/settings">
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Settings className="w-5 h-5 text-[#444441]" />
                                </Button>
                            </Link>
                            
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-full"
                                onClick={handleLogout}
                                data-testid="logout-btn"
                            >
                                <LogOut className="w-5 h-5 text-[#444441]" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Welcome */}
                        <div className="animate-fadeIn">
                            <h1 className="text-3xl font-semibold text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                                Olá, {user?.name || 'usuário'}
                            </h1>
                            <p className="text-[#787875] mt-1">
                                Envie seu exame para análise ou veja seus resultados anteriores
                            </p>
                        </div>

                        {/* Upload Area */}
                        <Card className="bg-white rounded-3xl border border-[#EBE9E1] shadow-sm animate-fadeIn stagger-1">
                            <CardHeader>
                                <CardTitle className="text-xl text-[#085041] flex items-center gap-2" style={{ fontFamily: 'Fraunces, serif' }}>
                                    <Upload className="w-5 h-5 text-[#1D9E75]" />
                                    Analisar novo exame
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`upload-zone ${dragOver ? 'drag-over' : ''} cursor-pointer`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('file-input').click()}
                                    data-testid="upload-zone"
                                >
                                    <input
                                        id="file-input"
                                        type="file"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-[#1D9E75]/10 rounded-2xl flex items-center justify-center">
                                            <FileText className="w-8 h-8 text-[#1D9E75]" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[#085041] font-medium">
                                                Arraste seu exame aqui ou clique para selecionar
                                            </p>
                                            <p className="text-sm text-[#787875] mt-1">
                                                PDF ou imagens (JPG, PNG)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Selected Files */}
                                {selectedFiles.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <p className="text-sm text-[#787875]">Arquivos selecionados:</p>
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-[#F1EFE8] rounded-xl px-4 py-2">
                                                <span className="text-sm text-[#444441] truncate">{file.name}</span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                                    className="text-[#787875] hover:text-red-500"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        
                                        <Button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="w-full bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full py-6 mt-4"
                                            data-testid="upload-submit-btn"
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Analisando exame...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Analisar exame (1 crédito)
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Exam History */}
                        <Card className="bg-white rounded-3xl border border-[#EBE9E1] shadow-sm animate-fadeIn stagger-2">
                            <CardHeader>
                                <CardTitle className="text-xl text-[#085041] flex items-center gap-2" style={{ fontFamily: 'Fraunces, serif' }}>
                                    <Clock className="w-5 h-5 text-[#1D9E75]" />
                                    Histórico de exames
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-[#1D9E75]" />
                                    </div>
                                ) : exams.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-[#787875]">Nenhum exame analisado ainda</p>
                                        <p className="text-sm text-[#787875] mt-1">
                                            Envie seu primeiro hemograma acima
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {exams.map((exam) => (
                                            <Link key={exam.id} to={`/exam/${exam.id}`}>
                                                <div 
                                                    className="flex items-center justify-between p-4 bg-[#F1EFE8] rounded-2xl hover:bg-[#EBE9E1] transition-colors group"
                                                    data-testid={`exam-item-${exam.id}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center">
                                                            <FileText className="w-5 h-5 text-[#1D9E75]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-[#787875]">
                                                                {formatDate(exam.created_at)}
                                                            </p>
                                                            <p className="text-[#444441] line-clamp-1 text-sm mt-1">
                                                                {exam.summary || 'Hemograma analisado'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-[#787875] group-hover:text-[#1D9E75] transition-colors" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Credits Card */}
                        <Card className="bg-[#1D9E75] text-white rounded-3xl border-0 shadow-xl animate-fadeIn stagger-3">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-white/80">Seus créditos</span>
                                    <CreditCard className="w-5 h-5 text-white/80" />
                                </div>
                                <p className="text-4xl font-bold" data-testid="sidebar-credits">
                                    {user?.exam_credits || 0}
                                </p>
                                <p className="text-sm text-white/80 mt-1">
                                    análise{user?.exam_credits !== 1 ? 's' : ''} disponíve{user?.exam_credits !== 1 ? 'is' : 'l'}
                                </p>
                                <Button
                                    onClick={() => setShowPackages(true)}
                                    className="w-full mt-6 bg-white text-[#1D9E75] hover:bg-white/90 rounded-full"
                                    data-testid="buy-credits-btn"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Comprar créditos
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Quick Links */}
                        <Card className="bg-white rounded-3xl border border-[#EBE9E1] shadow-sm animate-fadeIn stagger-4">
                            <CardContent className="p-6 space-y-3">
                                <Link to="/especialistas">
                                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F1EFE8] transition-colors">
                                        <span className="text-[#444441]">Buscar especialistas</span>
                                        <ArrowRight className="w-4 h-4 text-[#787875]" />
                                    </div>
                                </Link>
                                <Link to="/settings">
                                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F1EFE8] transition-colors">
                                        <span className="text-[#444441]">Configurações</span>
                                        <ArrowRight className="w-4 h-4 text-[#787875]" />
                                    </div>
                                </Link>
                                <Link to="/termos">
                                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F1EFE8] transition-colors">
                                        <span className="text-[#444441]">Termos de uso</span>
                                        <ArrowRight className="w-4 h-4 text-[#787875]" />
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Disclaimer */}
                        <div className="p-4 bg-[#F1EFE8] rounded-2xl">
                            <p className="text-xs text-[#787875] text-center">
                                Este serviço é apenas informativo. Não substitui consulta médica.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Packages Modal */}
            {showPackages && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="bg-white rounded-3xl max-w-lg w-full animate-fadeIn">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-xl text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                                Comprar créditos
                            </CardTitle>
                            <button onClick={() => setShowPackages(false)} className="text-[#787875] hover:text-[#444441]">
                                <X className="w-5 h-5" />
                            </button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {packages.map((pkg) => (
                                <div 
                                    key={pkg.id}
                                    className="flex items-center justify-between p-4 bg-[#F1EFE8] rounded-2xl"
                                >
                                    <div>
                                        <p className="font-medium text-[#085041]">{pkg.name}</p>
                                        <p className="text-sm text-[#787875]">{pkg.credits} análise{pkg.credits > 1 ? 's' : ''}</p>
                                    </div>
                                    <Button
                                        onClick={() => handleBuyCredits(pkg.id)}
                                        className="bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full"
                                        data-testid={`buy-package-${pkg.id}`}
                                    >
                                        R$ {pkg.amount.toFixed(2).replace('.', ',')}
                                    </Button>
                                </div>
                            ))}
                            <p className="text-xs text-center text-[#787875] mt-4">
                                Pagamento seguro via Stripe
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
