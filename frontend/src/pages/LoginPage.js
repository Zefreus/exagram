import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const user = await login(formData.email, formData.password);
            toast.success('Login realizado com sucesso!');
            
            if (!user.consent_granted) {
                navigate('/consent');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F1EFE8] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <Link to="/" className="inline-flex items-center gap-2 text-[#787875] hover:text-[#1D9E75] mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao início
                </Link>
                
                <Card className="bg-white rounded-3xl border border-[#EBE9E1] shadow-xl">
                    <CardHeader className="text-center pb-2">
                        <Link to="/" className="inline-flex items-center justify-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-[#1D9E75] rounded-full flex items-center justify-center">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                        </Link>
                        <CardTitle className="text-2xl font-semibold text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                            Bem-vindo de volta
                        </CardTitle>
                        <CardDescription className="text-[#787875]">
                            Entre para acessar suas análises
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[#444441]">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="rounded-xl border-[#EBE9E1] focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]"
                                    data-testid="login-email-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-[#444441]">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="rounded-xl border-[#EBE9E1] focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]"
                                    data-testid="login-password-input"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full py-6 mt-6"
                                data-testid="login-submit-btn"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>
                        </form>
                        
                        <div className="mt-6 text-center">
                            <p className="text-[#787875]">
                                Não tem conta?{' '}
                                <Link to="/register" className="text-[#1D9E75] hover:underline font-medium">
                                    Criar conta
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
                
                <p className="text-center text-xs text-[#787875] mt-6">
                    Ao entrar, você concorda com nossos{' '}
                    <Link to="/termos" className="underline">Termos</Link> e{' '}
                    <Link to="/privacidade" className="underline">Privacidade</Link>
                </p>
            </div>
        </div>
    );
}
