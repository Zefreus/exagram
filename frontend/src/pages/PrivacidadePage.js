import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

export default function PrivacidadePage() {
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
                        Política de Privacidade
                    </h1>
                    <p className="text-[#787875] mb-8">Última atualização: Janeiro de 2025</p>

                    <div className="prose prose-lg max-w-none text-[#444441]">
                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            1. Controlador dos Dados
                        </h2>
                        <p>
                            <strong>Exagram</strong><br />
                            Encarregado de Dados (DPO): Tiago Leal<br />
                            E-mail: zefreus@gmail.com
                        </p>
                        <p className="mt-4">
                            Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos 
                            seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                        </p>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            2. Dados Coletados
                        </h2>
                        <p><strong>Dados de cadastro:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Nome completo</li>
                            <li>Endereço de e-mail</li>
                            <li>Senha (armazenada de forma criptografada)</li>
                        </ul>
                        
                        <p className="mt-4"><strong>Dados sensíveis de saúde (Art. 11, LGPD):</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Valores extraídos de exames de hemograma</li>
                            <li>Análises e interpretações geradas</li>
                            <li>Histórico de conversas sobre exames</li>
                        </ul>
                        
                        <p className="mt-4"><strong>Dados de uso:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Data e hora de acesso</li>
                            <li>Páginas visitadas</li>
                            <li>Interações com o serviço</li>
                        </ul>
                        
                        <p className="mt-4"><strong>Dados de pagamento:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Processados diretamente pelo Stripe</li>
                            <li>Não armazenamos dados de cartão de crédito</li>
                        </ul>
                        
                        <p className="mt-4"><strong>Dados técnicos:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Endereço IP (para registro de consentimento)</li>
                            <li>User Agent do navegador</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            3. Finalidade e Base Legal
                        </h2>
                        <table className="w-full border-collapse mt-4">
                            <thead>
                                <tr className="bg-[#F1EFE8]">
                                    <th className="p-3 text-left border border-[#EBE9E1]">Finalidade</th>
                                    <th className="p-3 text-left border border-[#EBE9E1]">Base Legal</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 border border-[#EBE9E1]">Processamento de dados de saúde</td>
                                    <td className="p-3 border border-[#EBE9E1]">Consentimento específico (Art. 11, II, a)</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border border-[#EBE9E1]">Criação e gestão de conta</td>
                                    <td className="p-3 border border-[#EBE9E1]">Execução de contrato (Art. 7, V)</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border border-[#EBE9E1]">Processamento de pagamentos</td>
                                    <td className="p-3 border border-[#EBE9E1]">Execução de contrato (Art. 7, V)</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border border-[#EBE9E1]">Comunicações sobre o serviço</td>
                                    <td className="p-3 border border-[#EBE9E1]">Legítimo interesse (Art. 7, IX)</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border border-[#EBE9E1]">Melhoria do serviço</td>
                                    <td className="p-3 border border-[#EBE9E1]">Legítimo interesse (Art. 7, IX)</td>
                                </tr>
                            </tbody>
                        </table>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            4. Operadores (Processadores)
                        </h2>
                        <p>Compartilhamos dados com os seguintes operadores:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                            <li>
                                <strong>Anthropic (Claude AI):</strong> Processamento de exames via IA. 
                                Os dados são enviados apenas para análise e não são retidos pela Anthropic 
                                além do necessário para gerar a resposta.
                            </li>
                            <li>
                                <strong>Stripe:</strong> Processamento de pagamentos. Stripe atua como 
                                controlador independente para dados de pagamento.
                            </li>
                        </ul>
                        <p className="mt-4">
                            Não compartilhamos dados de saúde com nenhum outro terceiro.
                        </p>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            5. Retenção de Dados
                        </h2>
                        <table className="w-full border-collapse mt-4">
                            <thead>
                                <tr className="bg-[#F1EFE8]">
                                    <th className="p-3 text-left border border-[#EBE9E1]">Tipo de Dado</th>
                                    <th className="p-3 text-left border border-[#EBE9E1]">Período de Retenção</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 border border-[#EBE9E1]">Arquivos de exames (PDF/imagens)</td>
                                    <td className="p-3 border border-[#EBE9E1]"><strong>Deletados imediatamente</strong> após extração</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border border-[#EBE9E1]">Dados extraídos e análises</td>
                                    <td className="p-3 border border-[#EBE9E1]">90 dias (configurável)</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border border-[#EBE9E1]">Dados de cadastro</td>
                                    <td className="p-3 border border-[#EBE9E1]">Enquanto a conta estiver ativa</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border border-[#EBE9E1]">Registros de consentimento</td>
                                    <td className="p-3 border border-[#EBE9E1]">5 anos (obrigação legal)</td>
                                </tr>
                            </tbody>
                        </table>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            6. Seus Direitos (Art. 18, LGPD)
                        </h2>
                        <p>Você tem direito a:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                            <li><strong>Confirmação e acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
                            <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
                            <li><strong>Anonimização, bloqueio ou eliminação:</strong> Solicitar quando aplicável</li>
                            <li><strong>Portabilidade:</strong> Exportar seus dados em formato estruturado</li>
                            <li><strong>Eliminação:</strong> Solicitar exclusão de dados tratados com consentimento</li>
                            <li><strong>Revogação do consentimento:</strong> A qualquer momento, de forma fácil</li>
                        </ul>
                        <p className="mt-4">
                            <strong>Prazo de resposta:</strong> 15 dias úteis
                        </p>
                        <p className="mt-2">
                            Para exercer seus direitos, acesse Configurações {'>'}  Meus Dados ou entre em contato 
                            com nosso DPO.
                        </p>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            7. Segurança
                        </h2>
                        <p>Implementamos medidas de segurança incluindo:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                            <li>Conexões HTTPS/TLS para todo o tráfego</li>
                            <li>Senhas criptografadas com bcrypt (fator de custo mínimo 12)</li>
                            <li>Validação de propriedade de recursos em todas as APIs</li>
                            <li>Dados de saúde não são incluídos em logs da aplicação</li>
                            <li>Arquivos originais de exames são deletados após processamento</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            8. Cookies
                        </h2>
                        <p>
                            Utilizamos apenas cookies essenciais para autenticação e funcionamento do serviço. 
                            Não utilizamos cookies de rastreamento ou publicidade.
                        </p>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            9. Contato e ANPD
                        </h2>
                        <p>
                            <strong>Encarregado de Dados (DPO):</strong><br />
                            Tiago Leal<br />
                            E-mail: zefreus@gmail.com
                        </p>
                        <p className="mt-4">
                            <strong>Autoridade Nacional de Proteção de Dados (ANPD):</strong><br />
                            <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-[#1D9E75] underline">
                                www.gov.br/anpd
                            </a>
                        </p>
                        <p className="mt-4">
                            Caso não esteja satisfeito com nossa resposta, você pode apresentar reclamação à ANPD.
                        </p>

                        <h2 className="text-xl font-semibold text-[#085041] mt-8 mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                            10. Versão e Vigência
                        </h2>
                        <p>
                            <strong>Versão:</strong> 1.0<br />
                            <strong>Data de vigência:</strong> Janeiro de 2025
                        </p>
                        <p className="mt-4">
                            Alterações nesta política serão comunicadas por email e através do aplicativo. 
                            Alterações significativas podem requerer novo consentimento.
                        </p>

                        <div className="mt-12 p-6 bg-[#F1EFE8] rounded-2xl">
                            <p className="text-sm text-[#787875]">
                                <strong>Dúvidas?</strong><br />
                                Entre em contato com nosso Encarregado de Dados:<br />
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
