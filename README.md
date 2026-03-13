# Exagram 🩸

Sistema SaaS para análise de hemogramas (exames de sangue) com Inteligência Artificial.

## 🎯 Funcionalidades

- **Upload de Exames**: PDF ou imagens de hemogramas
- **Análise com IA**: Extração automática de valores (Gemini) + análise humanizada (Claude/GPT)
- **Chat Inteligente**: Tire dúvidas sobre seus resultados
- **Sistema de Créditos**: Compra via Mercado Pago
- **Cupons de Desconto**: Sistema completo de cupons
- **Dashboard Admin**: Gerenciamento de tenants, especialistas e cupons
- **LGPD Compliance**: Consentimento, exportação e exclusão de dados

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI (Python 3.11)
- **Database**: MySQL
- **AI**: Gemini 2.5 Flash (extração) + Claude/ChatGPT (análise)
- **Pagamentos**: Mercado Pago Checkout Pro

## 📦 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/Zefreus/exagram.git
cd exagram
```

### 2. Configure o Backend
```bash
cd backend
cp .env .env.local  # Crie seu arquivo de configuração
# Edite .env.local com suas credenciais
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### 3. Configure o Frontend
```bash
cd frontend
cp .env.example .env  # Crie seu arquivo de configuração
yarn install
yarn start
```

## ⚙️ Variáveis de Ambiente

### Backend (.env)
```env
# Database MySQL
DB_HOST=seu_host_mysql
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_MYSQL_NAME=nome_do_banco

# AI API Keys
ANTHROPIC_API_KEY=sua_chave_anthropic
OPENAI_API_KEY=sua_chave_openai
GEMINI_API_KEY=sua_chave_gemini

# Mercado Pago
MP_ACCESS_TOKEN=seu_access_token
MP_PUBLIC_KEY=sua_public_key
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🔐 Credenciais de Teste

- **Admin**: admin@exagram.com.br
- **Cupons**: TESTE10 (10%), BEMVINDO20 (20%)

## 📝 Licença

Este projeto é proprietário. Todos os direitos reservados.

## 👨‍💻 Autor

Desenvolvido com ❤️ para o mercado brasileiro.
