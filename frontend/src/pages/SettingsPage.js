import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    Heart, ArrowLeft, Download, Trash2, Shield, 
    Settings as SettingsIcon, User, AlertTriangle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const navigate = useNavigate();
    const { user, api, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleExportData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/user/data');
            const dataStr = JSON.stringify(response.data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `exagram_dados_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Dados exportados com sucesso!');
        } catch (error) {
            toast.error('Erro ao exportar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await api.delete('/user/account');
            toast.success('Conta excluída com sucesso');
            logout();
            navigate('/');
        } catch (error) {
            toast.error('Erro ao excluir conta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F1EFE8]">
            {/* Header */}
            <header className="bg-white border-b border-[#EBE9E1]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/dashboard" className="flex items-center gap-2 text-[#787875] hover:text-[#1D9E75]">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Voltar</span>
                        </Link>
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#1D9E75] rounded-full flex items-center justify-center">
                                <Heart className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-xl text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                                Exagram
                            </span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                        Configurações
                    </h1>
                    <p className="text-[#787875] mt-2">
                        Gerencie sua conta e dados pessoais
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Account Info */}
                    <Card className="bg-white rounded-3xl border border-[#EBE9E1] shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg text-[#085041] flex items-center gap-2" style={{ fontFamily: 'Fraunces, serif' }}>
                                <User className="w-5 h-5 text-[#1D9E75]" />
                                Minha Conta
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-[#F1EFE8] rounded-xl">
                                <div>
                                    <p className="text-sm text-[#787875]">Nome</p>
                                    <p className="text-[#085041] font-medium">{user?.name}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-[#F1EFE8] rounded-xl">
                                <div>
                                    <p className="text-sm text-[#787875]">Email</p>
                                    <p className="text-[#085041] font-medium">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-[#F1EFE8] rounded-xl">
                                <div>
                                    <p className="text-sm text-[#787875]">Plano</p>
                                    <p className="text-[#085041] font-medium capitalize">{user?.plan || 'Free'}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-[#F1EFE8] rounded-xl">
                                <div>
                                    <p className="text-sm text-[#787875]">Créditos disponíveis</p>
                                    <p className="text-[#085041] font-medium">{user?.exam_credits || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* LGPD Rights */}
                    <Card className="bg-white rounded-3xl border border-[#EBE9E1] shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg text-[#085041] flex items-center gap-2" style={{ fontFamily: 'Fraunces, serif' }}>
                                <Shield className="w-5 h-5 text-[#1D9E75]" />
                                Meus Dados (LGPD)
                            </CardTitle>
                            <CardDescription>
                                Seus direitos de acordo com a Lei Geral de Proteção de Dados
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-[#444441]">
                                Conforme a LGPD (Lei nº 13.709/2018), você tem direito a acessar, 
                                exportar e solicitar a exclusão dos seus dados pessoais a qualquer momento.
                            </p>
                            
                            <div className="space-y-3">
                                <Button
                                    onClick={handleExportData}
                                    disabled={loading}
                                    variant="outline"
                                    className="w-full rounded-full border-[#1D9E75] text-[#1D9E75] hover:bg-[#1D9E75] hover:text-white"
                                    data-testid="export-data-btn"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4 mr-2" />
                                    )}
                                    Exportar meus dados
                                </Button>
                                
                                <Button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    variant="outline"
                                    className="w-full rounded-full border-red-400 text-red-500 hover:bg-red-500 hover:text-white"
                                    data-testid="delete-account-btn"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir minha conta
                                </Button>
                            </div>
                            
                            <div className="mt-4 p-4 bg-[#F1EFE8] rounded-xl">
                                <p className="text-sm text-[#787875]">
                                    <strong>Encarregado de Dados (DPO):</strong><br />
                                    Tiago Leal - zefreus@gmail.com
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Links */}
                    <Card className="bg-white rounded-3xl border border-[#EBE9E1] shadow-sm">
                        <CardContent className="p-6 space-y-3">
                            <Link to="/termos">
                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F1EFE8] transition-colors">
                                    <span className="text-[#444441]">Termos de Uso</span>
                                    <ArrowLeft className="w-4 h-4 text-[#787875] rotate-180" />
                                </div>
                            </Link>
                            <Link to="/privacidade">
                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F1EFE8] transition-colors">
                                    <span className="text-[#444441]">Política de Privacidade</span>
                                    <ArrowLeft className="w-4 h-4 text-[#787875] rotate-180" />
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="bg-white rounded-3xl max-w-md w-full animate-fadeIn">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-[#085041]">
                                        Excluir conta
                                    </CardTitle>
                                    <CardDescription>
                                        Esta ação é irreversível
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-[#444441]">
                                Ao excluir sua conta, todos os seus dados serão permanentemente removidos:
                            </p>
                            <ul className="list-disc list-inside text-sm text-[#787875] space-y-1">
                                <li>Todos os exames analisados</li>
                                <li>Histórico de conversas</li>
                                <li>Créditos não utilizados</li>
                                <li>Dados de cadastro</li>
                            </ul>
                            
                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    variant="outline"
                                    className="flex-1 rounded-full"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleDeleteAccount}
                                    disabled={loading}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                                    data-testid="confirm-delete-btn"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        'Excluir conta'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
