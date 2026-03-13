import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Heart, ArrowLeft, Send, User, Bot, AlertTriangle, 
    Phone, Globe, Mail, MapPin, Loader2, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function ExamResultPage() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { api } = useAuth();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const quickReplies = [
        'O que significa esse valor?',
        'Devo me preocupar?',
        'Que médico devo procurar?',
        'O que pode ter causado isso?'
    ];

    useEffect(() => {
        fetchExam();
    }, [examId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchExam = async () => {
        try {
            const response = await api.get(`/exams/${examId}`);
            setExam(response.data);
            setMessages(response.data.messages || []);
        } catch (error) {
            toast.error('Erro ao carregar exame');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (message) => {
        if (!message.trim()) return;
        
        setSending(true);
        setInputMessage('');
        
        // Optimistic update
        const tempUserMsg = { id: 'temp', role: 'user', content: message };
        setMessages(prev => [...prev, tempUserMsg]);
        
        try {
            const response = await api.post(`/exams/${examId}/chat`, { content: message });
            
            // Replace temp message and add AI response
            setMessages(prev => [
                ...prev.filter(m => m.id !== 'temp'),
                response.data.user_message,
                response.data.ai_response
            ]);
        } catch (error) {
            toast.error('Erro ao enviar mensagem');
            setMessages(prev => prev.filter(m => m.id !== 'temp'));
        } finally {
            setSending(false);
        }
    };

    const getStatusColor = (flag) => {
        switch (flag) {
            case 'normal': return 'status-normal';
            case 'borderline': return 'status-borderline';
            case 'attention': return 'status-attention';
            default: return 'status-normal';
        }
    };

    const getStatusLabel = (flag) => {
        switch (flag) {
            case 'normal': return 'Normal';
            case 'borderline': return 'Atenção';
            case 'attention': return 'Fora do normal';
            default: return 'Normal';
        }
    };

    const formatParameterName = (key) => {
        const names = {
            hemoglobina: 'Hemoglobina',
            hematocrito: 'Hematócrito',
            eritrocitos: 'Eritrócitos',
            leucocitos: 'Leucócitos',
            plaquetas: 'Plaquetas',
            vcm: 'VCM',
            hcm: 'HCM',
            chcm: 'CHCM',
            neutrofilos: 'Neutrófilos',
            linfocitos: 'Linfócitos',
            eosinofilos: 'Eosinófilos',
            basofilos: 'Basófilos',
            monocitos: 'Monócitos'
        };
        return names[key] || key;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F1EFE8] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#1D9E75]" />
            </div>
        );
    }

    const extractedData = exam?.extracted_data?.valores || {};
    const flags = exam?.flags || {};

    return (
        <div className="min-h-screen bg-[#F1EFE8]">
            {/* Header */}
            <header className="bg-white border-b border-[#EBE9E1] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/dashboard" className="flex items-center gap-2 text-[#787875] hover:text-[#1D9E75]">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Voltar ao dashboard</span>
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Disclaimer */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                        <strong>Aviso importante:</strong> Este resultado é apenas informativo. Não substitui consulta médica. 
                        Consulte um médico para diagnóstico e tratamento adequado.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Results Column */}
                    <div className="space-y-6">
                        {/* Summary */}
                        <Card className="bg-white rounded-3xl border border-[#EBE9E1] shadow-sm animate-fadeIn">
                            <CardHeader>
                                <CardTitle className="text-xl text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                                    Resumo do seu exame
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-[#444441] leading-relaxed">
                                    {exam?.summary || 'Seus resultados foram analisados. Confira os valores abaixo.'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Values Table */}
                        <Card className="bg-white rounded-3xl border border-[#EBE9E1] shadow-sm animate-fadeIn stagger-1">
                            <CardHeader>
                                <CardTitle className="text-xl text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                                    Valores do hemograma
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(extractedData).map(([key, data]) => (
                                        <div 
                                            key={key}
                                            className="flex items-center justify-between p-4 bg-[#F1EFE8] rounded-xl"
                                            data-testid={`value-${key}`}
                                        >
                                            <div>
                                                <p className="font-medium text-[#085041]">
                                                    {formatParameterName(key)}
                                                </p>
                                                <p className="text-sm text-[#787875]">
                                                    Ref: {data?.referencia_min || '-'} - {data?.referencia_max || '-'} {data?.unidade || ''}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-[#085041]">
                                                    {data?.valor || '-'} {data?.unidade || ''}
                                                </p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(flags[key])}`}>
                                                    {getStatusLabel(flags[key])}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {Object.keys(extractedData).length === 0 && (
                                        <p className="text-center text-[#787875] py-4">
                                            Nenhum valor extraído do exame
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Specialists */}
                        {exam?.specialists?.length > 0 && (
                            <Card className="bg-white rounded-3xl border border-[#EBE9E1] shadow-sm animate-fadeIn stagger-2">
                                <CardHeader>
                                    <CardTitle className="text-xl text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                                        Especialistas sugeridos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-[#787875] mb-4">
                                        Baseado nos seus resultados, pode ser interessante consultar:
                                    </p>
                                    <div className="space-y-4">
                                        {exam.specialists.map((specialist) => (
                                            <div 
                                                key={specialist.id}
                                                className="p-4 bg-[#F1EFE8] rounded-xl"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-[#085041]">{specialist.name}</p>
                                                        <p className="text-sm text-[#1D9E75]">{specialist.specialty}</p>
                                                    </div>
                                                    <span className="text-xs bg-white px-2 py-1 rounded-full text-[#787875]">
                                                        {specialist.type}
                                                    </span>
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#787875]">
                                                    {specialist.city && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {specialist.city}, {specialist.state}
                                                        </span>
                                                    )}
                                                    {specialist.phone && (
                                                        <a href={`tel:${specialist.phone}`} className="flex items-center gap-1 hover:text-[#1D9E75]">
                                                            <Phone className="w-3 h-3" />
                                                            {specialist.phone}
                                                        </a>
                                                    )}
                                                    {specialist.website && (
                                                        <a href={specialist.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#1D9E75]">
                                                            <Globe className="w-3 h-3" />
                                                            Site
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Chat Column */}
                    <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
                        <Card className="bg-white rounded-3xl border border-[#EBE9E1] shadow-sm h-full flex flex-col animate-fadeIn stagger-3">
                            <CardHeader className="border-b border-[#EBE9E1]">
                                <CardTitle className="text-xl text-[#085041] flex items-center gap-2" style={{ fontFamily: 'Fraunces, serif' }}>
                                    <div className="w-8 h-8 bg-[#1D9E75]/10 rounded-full flex items-center justify-center">
                                        <Heart className="w-4 h-4 text-[#1D9E75]" />
                                    </div>
                                    Converse sobre seu exame
                                </CardTitle>
                            </CardHeader>
                            
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                    {messages.map((msg, index) => (
                                        <div 
                                            key={msg.id || index}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    msg.role === 'user' ? 'bg-[#1D9E75]' : 'bg-[#F1EFE8]'
                                                }`}>
                                                    {msg.role === 'user' ? (
                                                        <User className="w-4 h-4 text-white" />
                                                    ) : (
                                                        <Heart className="w-4 h-4 text-[#1D9E75]" />
                                                    )}
                                                </div>
                                                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {sending && (
                                        <div className="flex justify-start">
                                            <div className="flex items-end gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[#F1EFE8] flex items-center justify-center">
                                                    <Heart className="w-4 h-4 text-[#1D9E75]" />
                                                </div>
                                                <div className="chat-bubble-ai">
                                                    <div className="flex gap-1">
                                                        <span className="w-2 h-2 bg-[#1D9E75] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                        <span className="w-2 h-2 bg-[#1D9E75] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                        <span className="w-2 h-2 bg-[#1D9E75] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>

                            {/* Quick Replies */}
                            {messages.length <= 1 && (
                                <div className="px-4 pb-2">
                                    <p className="text-xs text-[#787875] mb-2">Sugestões:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {quickReplies.map((reply, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSendMessage(reply)}
                                                disabled={sending}
                                                className="text-xs bg-[#1D9E75]/10 text-[#1D9E75] px-3 py-2 rounded-full hover:bg-[#1D9E75]/20 transition-colors"
                                                data-testid={`quick-reply-${index}`}
                                            >
                                                {reply}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Input */}
                            <div className="p-4 border-t border-[#EBE9E1]">
                                <form 
                                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMessage); }}
                                    className="flex gap-2"
                                >
                                    <Input
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder="Digite sua dúvida..."
                                        disabled={sending}
                                        className="rounded-full border-[#EBE9E1] focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]"
                                        data-testid="chat-input"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={sending || !inputMessage.trim()}
                                        className="bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full px-4"
                                        data-testid="chat-send-btn"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
