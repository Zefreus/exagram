import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, MessageCircle, Shield, Heart, Users, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#F1EFE8]">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#EBE9E1]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#1D9E75] rounded-full flex items-center justify-center">
                                <Heart className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-xl text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                                Exagram
                            </span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link to="/especialistas" className="text-[#444441] hover:text-[#1D9E75] transition-colors">
                                Especialistas
                            </Link>
                            <Link to="/termos" className="text-[#444441] hover:text-[#1D9E75] transition-colors">
                                Termos
                            </Link>
                            <Link to="/privacidade" className="text-[#444441] hover:text-[#1D9E75] transition-colors">
                                Privacidade
                            </Link>
                        </nav>
                        <div className="flex items-center gap-3">
                            <Link to="/login">
                                <Button variant="ghost" className="text-[#444441] hover:text-[#1D9E75] hover:bg-[#1D9E75]/10 rounded-full">
                                    Entrar
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button data-testid="get-started-btn" className="bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full px-6">
                                    Começar grátis
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="animate-fadeIn">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#085041] leading-tight tracking-tight mb-6" style={{ fontFamily: 'Fraunces, serif' }}>
                                Entenda seu exame de sangue com clareza
                            </h1>
                            <p className="text-lg text-[#444441] leading-relaxed mb-8 max-w-xl">
                                Recebeu seus resultados e está ansioso? O Exagram analisa seu hemograma e explica 
                                tudo de forma simples, como um amigo bem-informado faria. Sem jargões, sem alarmes.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/register">
                                    <Button data-testid="hero-cta-btn" className="bg-[#1D9E75] hover:bg-[#168561] text-white rounded-full px-8 py-6 text-lg w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow">
                                        Analisar meu exame
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <span className="text-sm text-[#787875] self-center">
                                    Primeira análise grátis
                                </span>
                            </div>
                        </div>
                        <div className="relative animate-fadeIn stagger-2">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                <img 
                                    src="https://images.unsplash.com/photo-1679661379426-7542c2ddf84b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHw0fHxoYXBweSUyMHBlcnNvbiUyMG91dGRvb3JzJTIwc3VubGlnaHR8ZW58MHx8fHwxNzczNDExNDE0fDA&ixlib=rb-4.1.0&q=85"
                                    alt="Pessoa relaxada ao ar livre"
                                    className="w-full h-[400px] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#085041]/20 to-transparent" />
                            </div>
                            {/* Floating card */}
                            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-[#EBE9E1] animate-slideIn stagger-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#1D9E75]/10 rounded-full flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-[#1D9E75]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#085041] font-medium">Chat inteligente</p>
                                        <p className="text-xs text-[#787875]">Tire suas dúvidas</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 animate-fadeIn">
                        <h2 className="text-3xl sm:text-4xl font-medium text-[#085041] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            Como funciona
                        </h2>
                        <p className="text-[#444441] max-w-2xl mx-auto">
                            Três passos simples para entender seu hemograma
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: FileText,
                                title: 'Envie seu exame',
                                description: 'Faça upload do PDF ou foto do seu hemograma. Aceitamos vários formatos.',
                                step: '01'
                            },
                            {
                                icon: Heart,
                                title: 'Análise inteligente',
                                description: 'Nossa IA analisa cada valor e prepara um resumo personalizado e acolhedor.',
                                step: '02'
                            },
                            {
                                icon: MessageCircle,
                                title: 'Converse conosco',
                                description: 'Tire suas dúvidas no chat. Pergunte o que quiser sobre seus resultados.',
                                step: '03'
                            }
                        ].map((feature, index) => (
                            <Card key={index} className={`bg-[#F1EFE8] border-0 rounded-3xl hover:-translate-y-2 transition-transform duration-300 animate-fadeIn stagger-${index + 1}`}>
                                <CardContent className="p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-14 h-14 bg-[#1D9E75] rounded-2xl flex items-center justify-center">
                                            <feature.icon className="w-7 h-7 text-white" />
                                        </div>
                                        <span className="text-5xl font-bold text-[#1D9E75]/10" style={{ fontFamily: 'Fraunces, serif' }}>
                                            {feature.step}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-[#085041] mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
                                        {feature.title}
                                    </h3>
                                    <p className="text-[#444441]">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="animate-fadeIn">
                            <div className="inline-flex items-center gap-2 bg-[#1D9E75]/10 rounded-full px-4 py-2 mb-6">
                                <Shield className="w-4 h-4 text-[#1D9E75]" />
                                <span className="text-sm text-[#1D9E75] font-medium">LGPD Compliant</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-medium text-[#085041] mb-6" style={{ fontFamily: 'Fraunces, serif' }}>
                                Seus dados estão seguros
                            </h2>
                            <p className="text-[#444441] mb-6 leading-relaxed">
                                O Exagram foi desenvolvido com a privacidade em primeiro lugar. Seguimos todas 
                                as diretrizes da LGPD para dados sensíveis de saúde. Seus exames são processados 
                                e imediatamente deletados — nunca armazenamos os arquivos originais.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    'Arquivos deletados após processamento',
                                    'Dados criptografados em trânsito',
                                    'Você pode exportar ou deletar seus dados a qualquer momento',
                                    'Encarregado de dados (DPO) disponível'
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center gap-3 text-[#444441]">
                                        <div className="w-5 h-5 rounded-full bg-[#1D9E75] flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="animate-fadeIn stagger-2">
                            <Card className="bg-white rounded-3xl border border-[#EBE9E1] shadow-xl">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#EBE9E1]">
                                        <div className="w-12 h-12 bg-[#1D9E75] rounded-full flex items-center justify-center">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#085041]">Encontre especialistas</p>
                                            <p className="text-sm text-[#787875]">Se necessário, indicamos profissionais</p>
                                        </div>
                                    </div>
                                    <p className="text-[#444441] mb-6">
                                        Quando seus resultados sugerem a necessidade de acompanhamento, 
                                        conectamos você com especialistas da nossa rede.
                                    </p>
                                    <Link to="/especialistas">
                                        <Button variant="outline" className="w-full rounded-full border-[#1D9E75] text-[#1D9E75] hover:bg-[#1D9E75] hover:text-white">
                                            Ver especialistas
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 animate-fadeIn">
                        <h2 className="text-3xl sm:text-4xl font-medium text-[#085041] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            Preços simples e justos
                        </h2>
                        <p className="text-[#444441]">
                            Pague apenas quando precisar. Sem assinaturas obrigatórias.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            { name: '1 análise', price: 'R$ 9,90', desc: 'Para uso eventual', highlight: false },
                            { name: '3 análises', price: 'R$ 19,90', desc: 'Mais popular', highlight: true },
                            { name: '10 análises', price: 'R$ 49,90', desc: 'Melhor custo-benefício', highlight: false }
                        ].map((plan, index) => (
                            <Card key={index} className={`rounded-3xl transition-transform duration-300 hover:-translate-y-2 ${plan.highlight ? 'bg-[#1D9E75] text-white border-0 scale-105' : 'bg-[#F1EFE8] border-0'}`}>
                                <CardContent className="p-8 text-center">
                                    {plan.highlight && (
                                        <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full mb-4">
                                            Mais popular
                                        </span>
                                    )}
                                    <h3 className={`text-xl font-semibold mb-2 ${plan.highlight ? 'text-white' : 'text-[#085041]'}`} style={{ fontFamily: 'Fraunces, serif' }}>
                                        {plan.name}
                                    </h3>
                                    <p className={`text-3xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-[#1D9E75]'}`}>
                                        {plan.price}
                                    </p>
                                    <p className={`text-sm mb-6 ${plan.highlight ? 'text-white/80' : 'text-[#787875]'}`}>
                                        {plan.desc}
                                    </p>
                                    <Link to="/register">
                                        <Button className={`w-full rounded-full ${plan.highlight ? 'bg-white text-[#1D9E75] hover:bg-white/90' : 'bg-[#1D9E75] text-white hover:bg-[#168561]'}`}>
                                            Começar
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    
                    <p className="text-center text-[#787875] mt-8">
                        Primeira análise grátis para novos usuários
                    </p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-[#1D9E75] rounded-3xl p-12 shadow-xl">
                        <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            Pronto para entender seu exame?
                        </h2>
                        <p className="text-white/80 mb-8 max-w-xl mx-auto">
                            Comece agora com uma análise gratuita. Sem cartão de crédito necessário.
                        </p>
                        <Link to="/register">
                            <Button data-testid="cta-bottom-btn" className="bg-white text-[#1D9E75] hover:bg-white/90 rounded-full px-8 py-6 text-lg shadow-lg">
                                Criar conta grátis
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-[#EBE9E1]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <Link to="/" className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-[#1D9E75] rounded-full flex items-center justify-center">
                                    <Heart className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-semibold text-xl text-[#085041]" style={{ fontFamily: 'Fraunces, serif' }}>
                                    Exagram
                                </span>
                            </Link>
                            <p className="text-sm text-[#787875]">
                                Análise de hemograma com inteligência artificial.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#085041] mb-4">Produto</h4>
                            <ul className="space-y-2 text-sm text-[#787875]">
                                <li><Link to="/register" className="hover:text-[#1D9E75]">Criar conta</Link></li>
                                <li><Link to="/login" className="hover:text-[#1D9E75]">Entrar</Link></li>
                                <li><Link to="/especialistas" className="hover:text-[#1D9E75]">Especialistas</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#085041] mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-[#787875]">
                                <li><Link to="/termos" className="hover:text-[#1D9E75]">Termos de Uso</Link></li>
                                <li><Link to="/privacidade" className="hover:text-[#1D9E75]">Política de Privacidade</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#085041] mb-4">Contato DPO</h4>
                            <p className="text-sm text-[#787875]">Tiago Leal</p>
                            <p className="text-sm text-[#787875]">zefreus@gmail.com</p>
                        </div>
                    </div>
                    <div className="border-t border-[#EBE9E1] mt-8 pt-8 text-center text-sm text-[#787875]">
                        <p>© {new Date().getFullYear()} Exagram. Todos os direitos reservados.</p>
                        <p className="mt-2">
                            Este serviço é apenas informativo e não substitui consulta médica.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
