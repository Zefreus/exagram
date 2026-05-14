# Exagram — Contexto do Projeto para Claude Code

## Visão Geral
SaaS multi-tenant para análise de hemogramas com IA, voltado ao mercado brasileiro.
Usuário faz upload de exame (PDF/imagem) → consome 1 crédito → IA extrai os dados → IA gera análise humanizada → chat de perguntas abertas.

## Tech Stack
- **Frontend**: React 19 + Vite, Tailwind CSS, Shadcn/UI, React Router
- **Backend**: FastAPI (Python 3.11), aiomysql
- **Database**: MySQL externo (aiomysql)
- **Auth**: JWT (python-jose)
- **Pagamentos**: Mercado Pago Checkout Pro
- **IA**: Gemini 2.5 Flash (extração OCR) + Claude/GPT (análise humanizada), via `emergentintegrations`

## Estrutura de Diretórios
```
/
├── backend/
│   ├── server.py          # API monolítica (~1600 linhas) — TODO: modularizar
│   ├── requirements.txt
│   ├── .env               # Variáveis reais (não commitar)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Roteamento principal
│   │   ├── pages/             # Páginas
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ExamResultPage.jsx
│   │   │   ├── SpecialistsPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── ConsentPage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminLoginPage.jsx
│   │   │       └── AdminDashboardPage.jsx
│   │   ├── components/ui/     # Shadcn/UI components
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   └── lib/utils.js
│   ├── vite.config.js
│   ├── package.json
│   └── .env
└── CLAUDE.md
```

## Comandos Essenciais

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # apenas na primeira vez
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
yarn install   # SEMPRE yarn, nunca npm
yarn dev       # roda na porta 3000
```

## Variáveis de Ambiente

### backend/.env (obrigatórias)
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

NEXTAUTH_SECRET=string_aleatoria_longa
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=SenhaForte@123
DPO_NAME=Nome DPO
DPO_EMAIL=dpo@seudominio.com
RETENTION_DAYS=90
CONSENT_VERSION=1.0
CREDIT_EXPIRY_DAYS=365
```

### frontend/.env (obrigatória)
```env
VITE_BACKEND_URL=http://localhost:8001
```

> IMPORTANTE: Frontend usa Vite. Variáveis devem ter prefixo `VITE_`.
> No código: `import.meta.env.VITE_BACKEND_URL` (NUNCA `process.env.REACT_APP_...`)

## Credenciais de Teste
- **Usuário regular**: `teste@exagram.com.br` / `Teste123!`
- **Admin**: `admin@exagram.com.br` / `Exagram@Admin2024` → acessa via `/admin/login`

## Rotas da API (todas prefixadas com `/api`)

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro + cria tenant |
| POST | `/api/auth/login` | Login usuário |
| GET | `/api/auth/me` | Dados do usuário logado |
| POST | `/api/admin/login` | Login admin |

### Exames
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/exams/upload` | Upload + análise (consome 1 crédito) |
| GET | `/api/exams` | Lista exames do usuário |
| GET | `/api/exams/{exam_id}` | Detalhes do exame |
| POST | `/api/exams/{exam_id}/chat` | Chat de acompanhamento |

### Pagamentos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/payments/checkout` | Cria preferência Mercado Pago |
| POST | `/api/payments/validate-coupon` | Valida cupom |
| GET | `/api/payments/status/{preference_id}` | Status do pagamento |
| GET | `/api/packages` | Lista pacotes disponíveis |
| POST | `/api/webhooks/mercadopago` | Webhook Mercado Pago |

### Admin
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/admin/overview` | Estatísticas gerais |
| GET/POST | `/api/admin/tenants` | Listar/criar tenants |
| PATCH/DELETE | `/api/admin/tenants/{id}` | Editar/excluir tenant |
| POST/PATCH/DELETE | `/api/admin/specialists` | CRUD especialistas |
| GET/POST/PATCH/DELETE | `/api/admin/coupons` | CRUD cupons |
| GET | `/api/admin/audit-log` | Log de auditoria |

### Usuário / LGPD
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/consent/grant` | Registrar consentimento |
| GET | `/api/consent/status` | Status do consentimento |
| GET | `/api/user/data` | Exportar dados (LGPD) |
| DELETE | `/api/user/account` | Excluir conta (LGPD) |

## Schema do Banco de Dados (MySQL)

```sql
exa_tenants          -- organização (1 por usuário neste modelo)
  id, name, slug, mp_customer_id, plan, exam_credits, active, created_at

exa_users            -- usuários finais
  id, tenant_id, email, password_hash, name, consent_granted, created_at

exa_admins           -- superadmins da plataforma
  id, email, password_hash

exa_exams            -- exames enviados
  id, user_id, tenant_id, file_name, file_type, extracted_data (JSON),
  ai_analysis, flags (JSON), status, created_at

exa_chat_messages    -- histórico de chat por exame
  id, exam_id, user_id, role, content, created_at

exa_specialists      -- especialistas médicos cadastrados
  id, specialty, name, description, crm, city, state, active

exa_payment_transactions
  id, tenant_id, user_id, package_id, mp_payment_id, mp_preference_id,
  amount, credits_added, status, created_at

exa_coupons
  id, code, discount_percentage, max_uses, uses, expires_at, active

exa_consents         -- log de consentimento LGPD
  id, user_id, consent_version, ip_address, user_agent, action, type

exa_audit_log
  id, user_id, action, details (JSON), created_at

exa_usage_tracking
  id, tenant_id, user_id, action_type, details (JSON), created_at
```

## Padrões de Código

### Backend
- Todas as queries MySQL usam `execute_query()` — helper assíncrono em `server.py`
- Sempre excluir `_id` do MongoDB (não se aplica aqui — DB é MySQL)
- Rotas registradas em `api_router`, montado em `/api`
- Auth via `Depends(get_current_user)` para usuários, `Depends(get_admin_user)` para admins
- Senhas: `bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()`
- Tokens: `create_token(user_id, role, tenant_id, email)` → JWT

### Frontend
- Variáveis de env: `import.meta.env.VITE_BACKEND_URL`
- Chamadas API: `axios` com header `Authorization: Bearer <token>`
- Estado global de auth: `AuthContext.jsx` (useContext)
- Componentes UI: Shadcn em `src/components/ui/`
- Toasts: `sonner` via `src/components/ui/sonner.jsx`
- Ícones: `lucide-react`
- Estilo: Tailwind CSS (sem classes arbitrárias desnecessárias)

## Tarefas Pendentes (Backlog)

### P0 — Alta Prioridade
- [ ] Refatorar `backend/server.py` em módulos (`routes/`, `models/`, `services/`)

### P1 — Média Prioridade
- [ ] Implementar "Specialist Matching" — sugerir especialistas com base em flags do exame
- [ ] Hospedar backend em servidor permanente (Railway, Render ou VPS)

### P2 — Baixa Prioridade
- [ ] Admin Dashboard: CRUD completo para especialistas com interface melhorada
- [ ] Integração WhatsApp (Twilio ou Evolution API)

## Observações Importantes
- O banco de dados MySQL é **externo** — não precisa de Docker/instância local
- Frontend foi migrado de Create React App para **Vite** — não usar `REACT_APP_*`
- `emergentintegrations` é uma biblioteca interna da Emergent para chamadas de IA com fallback
- Mercado Pago: o webhook em produção precisa de URL pública acessível
