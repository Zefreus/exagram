# EXAGRAM — Contexto Completo do Projeto para Claude Code

## O que é o Exagram

SaaS multi-tenant para análise de hemogramas com IA, voltado ao mercado brasileiro.

**Fluxo principal:**
1. Usuário faz cadastro (ganha 1 crédito grátis)
2. Faz upload do exame (PDF ou imagem)
3. Consome 1 crédito
4. Gemini extrai os valores do exame via visão computacional
5. Claude (ou GPT-4o como fallback) gera análise humanizada
6. Interface de chat abre para perguntas de acompanhamento
7. Especialistas médicos são sugeridos com base nos resultados

---

## Stack Original (Python + React — versão Emergent)

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS + Shadcn/UI |
| Backend | FastAPI (Python 3.11) |
| Banco | MySQL externo |
| Auth | JWT (python-jose) + bcrypt |
| IA | emergentintegrations (Claude → GPT-4o → fallback) |
| Pagamentos | Mercado Pago Checkout Pro |

## Stack Migrada (.NET Framework 4.8)

| Camada | Tecnologia |
|--------|-----------|
| Frontend | ASP.NET MVC 5 + Razor Views + Bootstrap 5 |
| Backend | Web API 2 (System.Web.Http) |
| Banco | MySQL — `MySql.Data` 8.4 |
| Auth | JWT — `System.IdentityModel.Tokens.Jwt` 6.35 + BCrypt.Net-Next 4.0 |
| IA | HttpClient direto → Gemini 2.5 Flash / Claude Sonnet / GPT-4o |
| Pagamentos | Mercado Pago REST API via HttpClient |

---

## Credenciais e Chaves de API

### Banco de Dados MySQL (externo)
```
Host:     mysql.zefreus.com.br
Porta:    3306
Usuário:  zefreus11
Senha:    tricolor83
Database: zefreus11
```

### APIs de Inteligência Artificial
```
ANTHROPIC_API_KEY=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

OPENAI_API_KEY=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

GEMINI_API_KEY=AIzaSyCFpS3zwYMTj7Yy2A7s5qpYahxeaEEu8Ds
```

### Mercado Pago
```
MP_PUBLIC_KEY=APP_USR-eb86231f-38b0-468a-a19e-275161a7cc21
MP_ACCESS_TOKEN=APP_USR-529163586612841-031311-91c984c7414747d9c095ccf672600372-3265388826
MP_WEBHOOK_SECRET=c70a0526e1ef9308b77b6f40e694278cfe4aa641f891ce20fdbe92a96c5333ec
```

### Auth / Sistema
```
NEXTAUTH_SECRET=exagram_super_secret_key_2024_lgpd_compliant
ADMIN_EMAIL=admin@exagram.com.br
ADMIN_PASSWORD=Exagram@Admin2024
```

### LGPD
```
DPO_NAME=Tiago Leal
DPO_EMAIL=zefreus@gmail.com
RETENTION_DAYS=90
CONSENT_VERSION=1.0
CREDIT_EXPIRY_DAYS=365
```

---

## Credenciais de Teste

| Tipo | Email | Senha | Rota de login |
|------|-------|-------|--------------|
| Usuário | teste@exagram.com.br | Teste123! | /login |
| Admin | admin@exagram.com.br | Exagram@Admin2024 | /admin/login |

---

## Schema do Banco de Dados (MySQL)

```sql
-- Organização/conta de cada usuário
CREATE TABLE exa_tenants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    plan ENUM('free','pro') DEFAULT 'free',
    exam_credits INT DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuários finais (1 por tenant neste modelo)
CREATE TABLE exa_users (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    consent_granted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES exa_tenants(id) ON DELETE CASCADE
);

-- Superadmins da plataforma
CREATE TABLE exa_admins (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exames enviados
CREATE TABLE exa_exams (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36) NOT NULL,
    extracted_data LONGTEXT,   -- JSON com valores do hemograma (Gemini)
    ai_analysis LONGTEXT,      -- JSON com análise + flags + especialistas sugeridos
    flags LONGTEXT,            -- JSON: {"hemoglobina": "normal", "leucocitos": "attention", ...}
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de chat por exame
CREATE TABLE exa_chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    exam_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('user','assistant') NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Especialistas médicos cadastrados pelo admin
CREATE TABLE exa_specialists (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    type ENUM('medico','clinica','hospital') NOT NULL,
    city VARCHAR(255),
    state VARCHAR(50),
    phone VARCHAR(50),
    website VARCHAR(255),
    email VARCHAR(255),
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tracking de uso por mês
CREATE TABLE exa_usage_tracking (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    month_year VARCHAR(7) NOT NULL,   -- formato: "2025-01"
    exam_count INT DEFAULT 0,
    UNIQUE KEY unique_tenant_month (tenant_id, month_year)
);

-- Consentimento LGPD
CREATE TABLE exa_consents (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    consent_version VARCHAR(20) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    action ENUM('granted','revoked') NOT NULL,
    type ENUM('terms','privacy','sensitive_data') NOT NULL
);

-- Auditoria
CREATE TABLE exa_audit_log (
    id VARCHAR(36) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    affected_count INT DEFAULT 0,
    tenant_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transações de pagamento
CREATE TABLE exa_payment_transactions (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(255) UNIQUE,         -- preference_id do Mercado Pago
    amount DECIMAL(10,2),
    currency VARCHAR(10),
    credits_purchased INT,
    payment_status VARCHAR(50) DEFAULT 'pending',  -- pending | completed
    package_id VARCHAR(50),
    coupon_code VARCHAR(50),
    original_amount DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    mp_payment_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cupons de desconto
CREATE TABLE exa_coupons (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type ENUM('percent','fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    max_redemptions INT DEFAULT NULL,
    times_redeemed INT DEFAULT 0,
    expires_at DATETIME DEFAULT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Rotas da API

### Autenticação
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/auth/register | — | Cadastro + cria tenant |
| POST | /api/auth/login | — | Login usuário |
| GET | /api/auth/me | User | Dados do usuário logado |
| POST | /api/admin/login | — | Login admin |

### Exames
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/exams/upload | User | Upload + análise (consome 1 crédito) |
| GET | /api/exams | User | Lista exames do usuário |
| GET | /api/exams/{id} | User | Detalhes + chat + especialistas |
| POST | /api/exams/{id}/chat | User | Enviar mensagem ao chat |

### Pagamentos
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/payments/checkout | User | Cria preferência Mercado Pago |
| POST | /api/payments/validate-coupon | User | Valida cupom |
| GET | /api/payments/status/{id} | User | Status do pagamento |
| GET | /api/packages | — | Lista pacotes disponíveis |
| POST | /api/webhooks/mercadopago | — | Webhook Mercado Pago |

### Usuário / LGPD
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/consent/grant | User | Registrar consentimento |
| GET | /api/consent/status | User | Status do consentimento |
| GET | /api/user/data | User | Exportar dados (LGPD) |
| DELETE | /api/user/account | User | Excluir conta e dados |

### Admin
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/admin/overview | Admin | Estatísticas gerais |
| GET | /api/admin/tenants | Admin | Listar usuários/tenants |
| POST | /api/admin/tenants | Admin | Criar tenant manualmente |
| PATCH | /api/admin/tenants/{id} | Admin | Ativar/desativar |
| DELETE | /api/admin/tenants/{id} | Admin | Excluir tenant e dados |
| POST | /api/admin/specialists | Admin | Criar especialista |
| PATCH | /api/admin/specialists/{id} | Admin | Atualizar especialista |
| DELETE | /api/admin/specialists/{id} | Admin | Excluir especialista |
| GET | /api/admin/coupons | Admin | Listar cupons |
| POST | /api/admin/coupons | Admin | Criar cupom |
| PATCH | /api/admin/coupons/{id} | Admin | Ativar/desativar cupom |
| DELETE | /api/admin/coupons/{id} | Admin | Excluir cupom |
| GET | /api/admin/audit-log | Admin | Log de auditoria |

---

## Pacotes de Créditos

| ID | Nome | Créditos | Preço |
|----|------|----------|-------|
| single | 1 análise | 1 | R$ 9,90 |
| pack3 | Pacote 3 análises | 3 | R$ 19,90 |
| pack10 | Pacote 10 análises | 10 | R$ 49,90 |

---

## Lógica de IA

### Extração (Gemini 2.5 Flash)
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- Recebe o arquivo em base64 como `inline_data`
- Retorna JSON com os valores do hemograma: hemoglobina, hematócrito, eritrócitos, leucócitos, plaquetas, VCM, HCM, CHCM, neutrófilos, linfócitos, eosinófilos, basófilos, monócitos

### Análise (Claude Sonnet → GPT-4o como fallback)
- Claude: `https://api.anthropic.com/v1/messages` — modelo `claude-sonnet-4-5`
- OpenAI: `https://api.openai.com/v1/chat/completions` — modelo `gpt-4o`
- Retorna JSON com `summary`, `flags` (normal/borderline/attention por parâmetro) e `suggested_specialists`

### Chat
- Usa o mesmo fallback Claude → GPT-4o
- Contexto inclui os valores extraídos e a análise anterior
- Histórico das últimas 50 mensagens

---

## Estrutura do Projeto .NET Framework 4.8

```
Exagram.sln
Exagram/
├── Exagram.csproj          — ASP.NET Web Application (.NET 4.8)
├── packages.config         — NuGet: MySql.Data, BCrypt.Net-Next, JWT, MVC5, WebAPI2
├── Web.config              — Todas as configurações e chaves
├── Global.asax / .cs       — Startup: registra rotas, inicializa banco
├── App_Start/
│   ├── WebApiConfig.cs     — CORS, rotas API (/api/...)
│   └── RouteConfig.cs      — Rotas MVC (páginas)
├── Models/
│   ├── AuthModels.cs
│   ├── ExamModels.cs
│   ├── PaymentModels.cs
│   ├── AdminModels.cs
│   └── SpecialistModels.cs
├── Services/
│   ├── DatabaseService.cs  — MySQL helper (QueryAsync, ExecuteAsync)
│   ├── AuthService.cs      — JWT CreateToken/ValidateToken + bcrypt
│   ├── AiService.cs        — Gemini, Claude, OpenAI via HttpClient
│   └── MercadoPagoService.cs
├── Filters/
│   └── JwtAuthAttribute.cs — [JwtUserAuth] e [JwtAdminAuth] para proteger endpoints
├── Controllers/
│   ├── HomeController.cs   — MVC: renderiza as Views Razor
│   └── Api/
│       ├── AuthController.cs
│       ├── ExamsController.cs
│       ├── PaymentsController.cs
│       ├── AdminController.cs
│       ├── SpecialistsController.cs
│       ├── ConsentController.cs
│       ├── UserController.cs
│       └── WebhooksController.cs
├── Views/
│   ├── Shared/_Layout.cshtml
│   ├── Home/Index.cshtml       — Landing page
│   ├── Auth/Login.cshtml
│   ├── Auth/Register.cshtml
│   ├── Dashboard/Index.cshtml  — Upload + lista de exames + comprar créditos
│   ├── Exam/Result.cshtml      — Resultado + chat + especialistas
│   └── Admin/
│       ├── Login.cshtml
│       └── Index.cshtml        — Gestão de usuários, especialistas, cupons
└── Content/site.css
```

---

## Padrões de Código

### Backend C#
- Todas as queries MySQL passam por `DatabaseService.QueryAsync()` ou `ExecuteAsync()`
- JWT injetado nas actions via parâmetro `Dictionary<string, string> currentUser` pelo `[JwtUserAuth]`
- Senhas: `BCrypt.Net.BCrypt.HashPassword(password)` / `BCrypt.Net.BCrypt.Verify(password, hash)`
- IDs: sempre `Guid.NewGuid().ToString()` (UUID v4 como string)
- Retorno dos endpoints: `IHttpActionResult` com `Ok()`, `BadRequest()`, `Content(StatusCode, obj)`

### Frontend Razor + JS
- Token JWT armazenado em `localStorage` como `token` (usuário) ou `adminToken` (admin)
- Todas as chamadas de API usam `fetch()` com header `Authorization: Bearer <token>`
- Se API retorna 401, redireciona para `/login` ou `/admin/login`
- Sem framework JS — vanilla JavaScript puro

---

## Tarefas Pendentes (Backlog)

### P0 — Alta Prioridade
- [ ] Testar projeto .NET no Visual Studio e corrigir eventuais erros de compilação
- [ ] Validar fluxo completo: cadastro → upload → análise → chat → pagamento

### P1 — Média Prioridade
- [ ] Implementar "Specialist Matching" automático — sugerir especialistas cadastrados com base nos flags do exame
- [ ] Hospedar backend em servidor permanente (Railway, Azure, VPS Windows)
- [ ] Adicionar tela de Consentimento LGPD no fluxo de cadastro

### P2 — Baixa Prioridade
- [ ] Melhorar UI das Views Razor (adicionar mais animações e polish)
- [ ] Validação server-side com DataAnnotations nos formulários
- [ ] Integração WhatsApp (Twilio ou Evolution API)

---

## Como Iniciar no Claude Code / Cursor

1. Abrir `Exagram.sln` no Visual Studio 2019/2022
2. `Tools → NuGet Package Manager → Restore Packages`
3. Pressionar F5 para rodar com IIS Express
4. Todas as chaves já estão em `Exagram/Web.config`

### Comandos úteis (Package Manager Console)
```powershell
# Restaurar pacotes
nuget restore Exagram.sln

# Build
msbuild Exagram.sln /p:Configuration=Release

# Publicar
msbuild Exagram.sln /p:Configuration=Release /p:DeployOnBuild=true /p:PublishProfile=FolderProfile
```
