import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/consent');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }
        
        if (formData.password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres');
            return;
        }
        
        setLoading(true);
        
        try {
            await register(formData.email, formData.password, formData.name);
            toast.success('Conta criada com sucesso!');
            navigate('/consent');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F1EFE8] flex items-center justify-center px-4 py-8">
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
                            Criar conta
                        </CardTitle>
                        <CardDescription className="text-[#787875]">
                            Comece com uma análise grátis
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[#444441]">Nome</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Seu nome"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="rounded-xl border-[#EBE9E1] focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]"
                                    data-testid="register-name-input"
                                />
                            </div>
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
                                    data-testid="register-email-input"
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
                                    data-testid="register-password-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-[#444441]">Confirmar senha</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    className="rounded-xl border-[#EBE9E1] focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]"
                                    data-testid="register-confirm-password-input"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full py-6 mt-6"
                                data-testid="register-submit-btn"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Criando conta...
                                    </>
                                ) : (
                                    'Criar conta'
                                )}
                            </Button>
                        </form>
                        
                        <div className="mt-6 text-center">
                            <p className="text-[#787875]">
                                Já tem conta?{' '}
                                <Link to="/login" className="text-[#1D9E75] hover:underline font-medium">
                                    Entrar
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
                
                <p className="text-center text-xs text-[#787875] mt-6">
                    Ao criar conta, você concorda com nossos{' '}
                    <Link to="/termos" className="underline">Termos</Link> e{' '}
                    <Link to="/privacidade" className="underline">Privacidade</Link>
                </p>
            </div>
        </div>
    );
}
