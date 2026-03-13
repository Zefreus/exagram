import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

export default function TermosPage() {
    return (
        <div className="min-h-screen bg-[#F1EFE8]">
            {/* Header */}
            <header className="bg-white border-b border-[#EBE9E1]">
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
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link to="/" className="inline-flex items-center gap-2 text-[#787875] hover:text-[#1D9E75] mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao início
                </Link>

                <div className="bg-white rounded-3xl border border-[#EBE9E1] shadow-sm p-8 md:p-12">
                    <h1 className="text-3xl font-semibold text-[#085041] mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
                        Termos de Uso
                    </h1>
                    <p className="text-[#787875] mb-8">Última atualização: Janeiro de 2025</p>

                    <div className="prose prose-lg max-w-none text-[#444441]">
                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            1. Identificação do Serviço
                        </h2>
                        <p>
                            O Exagram é um serviço de análise informativa de exames de hemograma desenvolvido e operado 
                            no Brasil. O serviço utiliza inteligência artificial para auxiliar na compreensão de 
                            resultados de exames de sangue, tendo natureza exclusivamente informativa.
                        </p>
                        <p>
                            <strong>Importante:</strong> O Exagram NÃO realiza diagnósticos médicos, NÃO prescreve 
                            medicamentos e NÃO substitui a consulta com profissionais de saúde habilitados.
                        </p>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            2. Aceitação dos Termos
                        </h2>
                        <p>
                            Ao criar uma conta ou utilizar o Exagram, você declara ter lido, compreendido e concordado 
                            com estes Termos de Uso e nossa Política de Privacidade. Se você não concordar com qualquer 
                            disposição, não utilize o serviço.
                        </p>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            3. Descrição do Serviço
                        </h2>
                        <p>O Exagram oferece:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Análise automatizada de valores de hemograma via inteligência artificial</li>
                            <li>Resumos informativos em linguagem acessível</li>
                            <li>Chat para esclarecimento de dúvidas sobre os resultados</li>
                            <li>Sugestões de especialistas quando apropriado</li>
                        </ul>
                        <p className="mt-4">
                            <strong>O serviço NÃO fornece:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Diagnósticos médicos definitivos</li>
                            <li>Prescrições de medicamentos</li>
                            <li>Orientações de tratamento</li>
                            <li>Atendimento médico profissional</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            4. Responsabilidades do Usuário
                        </h2>
                        <p>Ao utilizar o Exagram, você se compromete a:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Ser maior de 18 anos ou estar acompanhado de responsável legal</li>
                            <li>Fornecer informações verdadeiras em seu cadastro</li>
                            <li>Manter suas credenciais de acesso em sigilo</li>
                            <li>Não utilizar o serviço para fins ilegais ou não autorizados</li>
                            <li>Consultar um médico para qualquer decisão relacionada à sua saúde</li>
                            <li>Não considerar os resultados como diagnóstico médico definitivo</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            5. Limitações do Exagram
                        </h2>
                        <p>
                            O Exagram utiliza inteligência artificial para análise de exames. Embora nos esforcemos 
                            para fornecer informações precisas, não garantimos:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Precisão absoluta na extração de valores dos documentos</li>
                            <li>Que todas as condições médicas serão identificadas</li>
                            <li>Que as interpretações serão aplicáveis ao seu caso específico</li>
                            <li>Disponibilidade ininterrupta do serviço</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            6. Dados e Privacidade
                        </h2>
                        <p>
                            A coleta, uso e proteção de seus dados pessoais são regidos por nossa{' '}
                            <Link to="/privacidade" className="text-[#1D9E75] underline">Política de Privacidade</Link>, 
                            que integra estes Termos.
                        </p>
                        <p className="mt-4">
                            <strong>Encarregado de Dados (DPO):</strong><br />
                            Tiago Leal - zefreus@gmail.com
                        </p>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            7. Planos e Pagamentos
                        </h2>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>O Exagram oferece créditos para análise de exames</li>
                            <li>Novos usuários recebem 1 crédito gratuito</li>
                            <li>Créditos adquiridos expiram em 365 dias</li>
                            <li>Pagamentos são processados via Mercado Pago de forma segura</li>
                            <li>Não há reembolso proporcional de créditos não utilizados</li>
                            <li>Assinaturas podem ser canceladas a qualquer momento</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            8. Propriedade Intelectual
                        </h2>
                        <p>
                            Todo o conteúdo, marca, design e tecnologia do Exagram são de propriedade exclusiva 
                            de seus desenvolvedores e estão protegidos pela legislação brasileira de propriedade 
                            intelectual. É vedada a reprodução, distribuição ou modificação sem autorização prévia.
                        </p>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            9. Rescisão
                        </h2>
                        <p>
                            O Exagram pode suspender ou encerrar sua conta a qualquer momento em caso de violação 
                            destes Termos. Você pode solicitar o encerramento de sua conta a qualquer momento através 
                            das configurações ou entrando em contato com nosso DPO.
                        </p>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            10. Alterações nos Termos
                        </h2>
                        <p>
                            Podemos atualizar estes Termos periodicamente. Alterações significativas serão 
                            comunicadas por email. O uso continuado do serviço após as alterações constitui 
                            aceitação dos novos termos.
                        </p>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            11. Foro e Legislação Aplicável
                        </h2>
                        <p>
                            Estes Termos são regidos pela legislação brasileira. Fica eleito o foro do domicílio 
                            do consumidor, conforme previsto no Código de Defesa do Consumidor (CDC), para dirimir 
                            quaisquer controvérsias.
                        </p>

                        <div className="mt-12 p-6 bg-[#F1EFE8] rounded-2xl">
                            <p className="text-sm text-[#787875]">
                                <strong>Contato:</strong><br />
                                Para dúvidas sobre estes Termos, entre em contato com nosso Encarregado de Dados:<br />
                                Tiago Leal - zefreus@gmail.com
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-[#EBE9E1] mt-12">
                <div className="max-w-7xl mx-auto text-center text-sm text-[#787875]">
                    <p>© {new Date().getFullYear()} Exagram. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
