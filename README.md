# Exagram

Sistema SaaS para análise de hemogramas (exames de sangue) com Inteligência Artificial.

## Funcionalidades

- Upload de exames (PDF ou imagem) com análise automática via IA
- Chat inteligente para tirar dúvidas sobre os resultados
- Sistema de créditos com compra via Mercado Pago
- Cupons de desconto
- Dashboard admin (gerenciamento de tenants, especialistas e cupons)
- Conformidade LGPD (consentimento, exportação e exclusão de dados)

## Tech Stack

- **Frontend**: React 19 + Vite, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI (Python 3.11), aiomysql
- **Database**: MySQL externo
- **IA**: Gemini 2.5 Flash (extração OCR) + Claude/GPT (análise humanizada)
- **Pagamentos**: Mercado Pago Checkout Pro

## Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/Zefreus/exagram.git
cd exagram
```

### 2. Configure o Backend
```bash
cd backend
cp .env.example .env
# Edite .env com suas credenciais
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### 3. Configure o Frontend
```bash
cd frontend
cp .env.example .env
# Edite .env com a URL do backend
yarn install
yarn dev
```

## Variáveis de Ambiente

### backend/.env
```env
DB_HOST=seu_host_mysql
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_MYSQL_NAME=nome_do_banco

ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIza...
EMERGENT_LLM_KEY=sk-emergent-...

MP_ACCESS_TOKEN=APP_USR-...
MP_PUBLIC_KEY=APP_USR-...
MP_WEBHOOK_SECRET=...

NEXTAUTH_SECRET=string_secreta_aleatoria
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=SenhaForte@123
DPO_NAME=Nome do DPO
DPO_EMAIL=dpo@seudominio.com
RETENTION_DAYS=90
CONSENT_VERSION=1.0
CREDIT_EXPIRY_DAYS=365
```

### frontend/.env
```env
VITE_BACKEND_URL=http://localhost:8001
```

> O frontend usa **Vite**. A variável deve ter prefixo `VITE_`.
> No código: `import.meta.env.VITE_BACKEND_URL`

## Credenciais de Teste

- **Usuário**: `teste@exagram.com.br` / `Teste123!`
- **Admin**: `admin@exagram.com.br` / `Exagram@Admin2024` (rota `/admin/login`)

## Licença

Este projeto é proprietário. Todos os direitos reservados.
