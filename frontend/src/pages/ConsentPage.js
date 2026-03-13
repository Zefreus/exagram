import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Heart, Shield, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ConsentPage() {
    const navigate = useNavigate();
    const { user, grantConsent, getConsentStatus, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [consents, setConsents] = useState({
        terms: false,
        privacy: false,
        sensitive_data: false
    });
    const [consentConfig, setConsentConfig] = useState(null);

    useEffect(() => {
        if (user?.consent_granted) {
            navigate('/dashboard');
        }
        fetchConsentConfig();
    }, [user, navigate]);

    const fetchConsentConfig = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/consent/config`);
            const data = await response.json();
            setConsentConfig(data);
        } catch (error) {
            console.error('Failed to fetch consent config:', error);
        }
    };

    const handleConsentGrant = async (type) => {
        try {
            await grantConsent(type, null, navigator.userAgent);
            setConsents(prev => ({ ...prev, [type]: true }));
            return true;
        } catch (error) {
            toast.error('Erro ao registrar consentimento');
            return false;
        }
    };

    const handleStep1Submit = async () => {
        if (!consents.terms || !consents.privacy) {
            toast.error('Por favor, aceite os termos e a política de privacidade');
            return;
        }
        
        setLoading(true);
        const termsGranted = await handleConsentGrant('terms');
        const privacyGranted = await handleConsentGrant('privacy');
        
        if (termsGranted && privacyGranted) {
            setStep(2);
        }
        setLoading(false);
    };

    const handleStep2Submit = async () => {
        if (!consents.sensitive_data) {
            toast.error('Por favor, autorize o processamento de dados de saúde');
            return;
        }
        
        setLoading(true);
        const granted = await handleConsentGrant('sensitive_data');
        
        if (granted) {
            toast.success('Consentimento registrado com sucesso!');
            navigate('/dashboard');
        }
        setLoading(false);
    };

    const handleDecline = () => {
        if (window.confirm('Ao não autorizar, sua conta será excluída. Deseja continuar?')) {
            logout();
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-[#F1EFE8] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-[#1D9E75] rounded-full flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-semibold text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                        Bem-vindo ao Exagram
                    </h1>
                    <p className="text-[#787875] mt-2">
                        Antes de começar, precisamos do seu consentimento
                    </p>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#1D9E75] text-white' : 'bg-[#EBE9E1] text-[#787875]'}`}>
                        1
                    </div>
                    <div className={`w-16 h-1 rounded ${step >= 2 ? 'bg-[#1D9E75]' : 'bg-[#EBE9E1]'}`} />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#1D9E75] text-white' : 'bg-[#EBE9E1] text-[#787875]'}`}>
                        2
                    </div>
                </div>

                {step === 1 && (
                    <Card className="bg-white rounded-3xl border border-[#EBE9E1] shadow-xl animate-fadeIn">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-[#1D9E75]" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                                        Termos e Privacidade
                                    </CardTitle>
                                    <CardDescription>Passo 1 de 2</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-[#444441]">
                                Para usar o Exagram, você precisa aceitar nossos termos de uso e política de privacidade.
                            </p>
                            
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 bg-[#F1EFE8] rounded-xl">
                                    <Checkbox
                                        id="terms"
                                        checked={consents.terms}
                                        onCheckedChange={(checked) => setConsents(prev => ({ ...prev, terms: checked }))}
                                        className="mt-1"
                                        data-testid="consent-terms-checkbox"
                                    />
                                    <label htmlFor="terms" className="text-[#444441] cursor-pointer">
                                        Li e aceito os{' '}
                                        <Link to="/termos" target="_blank" className="text-[#1D9E75] underline">
                                            Termos de Uso
                                        </Link>
                                    </label>
                                </div>
                                
                                <div className="flex items-start gap-3 p-4 bg-[#F1EFE8] rounded-xl">
                                    <Checkbox
                                        id="privacy"
                                        checked={consents.privacy}
                                        onCheckedChange={(checked) => setConsents(prev => ({ ...prev, privacy: checked }))}
                                        className="mt-1"
                                        data-testid="consent-privacy-checkbox"
                                    />
                                    <label htmlFor="privacy" className="text-[#444441] cursor-pointer">
                                        Li e aceito a{' '}
                                        <Link to="/privacidade" target="_blank" className="text-[#1D9E75] underline">
                                            Política de Privacidade
                                        </Link>
                                    </label>
                                </div>
                            </div>

                            {consentConfig && (
                                <div className="p-4 bg-[#1D9E75]/5 rounded-xl border border-[#1D9E75]/10">
                                    <p className="text-sm text-[#444441]">
                                        <strong>Encarregado de Dados (DPO):</strong><br />
                                        {consentConfig.dpo_name} - {consentConfig.dpo_email}
                                    </p>
                                </div>
                            )}

                            <Button
                                onClick={handleStep1Submit}
                                disabled={loading || !consents.terms || !consents.privacy}
                                className="w-full bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full py-6"
                                data-testid="consent-step1-btn"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    'Continuar'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="bg-white rounded-3xl border border-[#EBE9E1] shadow-xl animate-fadeIn">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-[#1D9E75]" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                                        Dados Sensíveis de Saúde
                                    </CardTitle>
                                    <CardDescription>Passo 2 de 2 - LGPD Art. 11</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-amber-800">
                                        De acordo com a Lei Geral de Proteção de Dados (LGPD), dados de saúde são considerados 
                                        dados pessoais sensíveis e requerem seu consentimento específico para processamento.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3 p-4 bg-[#F1EFE8] rounded-xl">
                                <Checkbox
                                    id="sensitive_data"
                                    checked={consents.sensitive_data}
                                    onCheckedChange={(checked) => setConsents(prev => ({ ...prev, sensitive_data: checked }))}
                                    className="mt-1"
                                    data-testid="consent-sensitive-checkbox"
                                />
                                <label htmlFor="sensitive_data" className="text-[#444441] cursor-pointer">
                                    <strong>Autorizo o processamento dos meus dados de saúde</strong> para análise 
                                    de exames conforme descrito na Política de Privacidade. Entendo que:
                                    <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                                        <li>Meus exames serão analisados por inteligência artificial</li>
                                        <li>Os arquivos originais serão deletados após processamento</li>
                                        <li>Posso revogar este consentimento a qualquer momento</li>
                                    </ul>
                                </label>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={handleStep2Submit}
                                    disabled={loading || !consents.sensitive_data}
                                    className="w-full bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full py-6"
                                    data-testid="consent-step2-btn"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processando...
                                        </>
                                    ) : (
                                        'Autorizar e continuar'
                                    )}
                                </Button>
                                
                                <button
                                    onClick={handleDecline}
                                    className="w-full text-sm text-[#787875] hover:text-red-500 transition-colors"
                                    data-testid="consent-decline-btn"
                                >
                                    Não autorizar (sua conta será excluída)
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <p className="text-center text-xs text-[#787875] mt-6">
                    Versão do consentimento: {consentConfig?.consent_version || '1.0'}
                </p>
            </div>
        </div>
    );
}
