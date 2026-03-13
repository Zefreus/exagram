import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const { adminLogin, isAdmin } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    React.useEffect(() => {
        if (isAdmin) {
            navigate('/admin');
        }
    }, [isAdmin, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await adminLogin(formData.email, formData.password);
            toast.success('Login realizado com sucesso!');
            navigate('/admin');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Credenciais inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#085041] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <Card className="bg-white rounded-3xl border-0 shadow-2xl">
                    <CardHeader className="text-center pb-2">
                        <div className="inline-flex items-center justify-center gap-2 mb-4">
                            <div className="w-12 h-12 bg-[#1D9E75] rounded-full flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-semibold text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                            Área Administrativa
                        </CardTitle>
                        <CardDescription className="text-[#787875]">
                            Acesso restrito a administradores
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[#444441]">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@exagram.com.br"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="rounded-xl border-[#EBE9E1] focus:ring-[#1D9E75]/20 focus:border-[#1D9E75]"
                                    data-testid="admin-email-input"
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
                                    data-testid="admin-password-input"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#085041] hover:bg-[#064030] text-white rounded-full py-6 mt-6"
                                data-testid="admin-login-btn"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    'Acessar painel'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                
                <div className="mt-6 text-center">
                    <Link to="/" className="text-white/70 hover:text-white text-sm">
                        ← Voltar ao site
                    </Link>
                </div>
            </div>
        </div>
    );
}
