# Exagram - PRD (Product Requirements Document)

## Original Problem Statement
Build a single-purpose multi-tenant SaaS web application called "Exagram" for analyzing blood count exams (hemograma) in the Brazilian market.

## AI Strategy - Fallback System ✅

### Priority Order:
1. **Claude** (ANTHROPIC_API_KEY) - Primary
2. **ChatGPT** (OPENAI_API_KEY) - Secondary fallback
3. **Emergent** (EMERGENT_LLM_KEY) - Final fallback

### Extraction (Vision):
1. **Gemini Direct** (GEMINI_API_KEY) - Primary
2. **Emergent Gemini** (EMERGENT_LLM_KEY) - Fallback

### Current Status:
- Claude: ❌ (sem créditos)
- ChatGPT: ❌ (quota excedida)
- Emergent: ✅ (funcionando)
- Gemini Direct: ✅ (funcionando)

## What's Been Implemented ✅

### Core Features (100% Working)

#### 1. Exam Analysis Flow
- **Upload**: Drag & drop PDF/images on dashboard
- **AI Extraction (Gemini 2.5 Flash)**: Extracts 13 hemogram parameters with fallback
- **AI Analysis (Claude/GPT/Emergent)**: Generates warm summary with fallback
- **Classification**: Values flagged as normal/borderline/attention
- **Credit Deduction**: 1 credit consumed per analysis

#### 2. Chat Interface
- Conversational AI with exam context
- AI fallback: Claude → ChatGPT → Emergent
- Message persistence in database
- Quick reply suggestions

#### 3. Payment System (Mercado Pago)
- **Checkout Pro**: Redirect-based payment
- **Credit Packages**: R$9.90 (1), R$19.90 (3), R$49.90 (10)
- **Coupon System**: Local database with percent/fixed discounts
- **Webhook**: Automatic credit addition on payment approval

#### 4. Admin Dashboard
- Overview statistics
- Tenant management (CRUD)
- Specialist management (CRUD)
- Coupon management (CRUD)
- Audit log

#### 5. Authentication & LGPD
- JWT-based auth for users and admins
- 2-step consent flow
- Data export and account deletion
- Multi-tenant data isolation

## Tech Stack
- **Frontend**: React 18.3, Tailwind CSS, Shadcn/UI, **Vite** (migrado de CRA)
- **Backend**: FastAPI, Python 3.11
- **Database**: MySQL (external)
- **AI**: 
  - Gemini 2.5 Flash (extraction) - GEMINI_API_KEY → EMERGENT_LLM_KEY
  - Claude 4 Sonnet (analysis/chat) - ANTHROPIC_API_KEY → OPENAI_API_KEY → EMERGENT_LLM_KEY
- **Payments**: Mercado Pago Checkout Pro

## Vercel Deployment - READY ✅
Frontend was migrated from Create React App (CRA) to **Vite** to solve persistent `ajv` dependency conflicts on Vercel builds.

### Migration Changes (March 13, 2026):
- Replaced `react-scripts` with `vite` and `@vitejs/plugin-react`
- Renamed all JSX files from `.js` to `.jsx`
- Changed environment variables from `REACT_APP_*` to `VITE_*`
- Updated `index.html` to root directory (Vite convention)
- Created `vite.config.js` with alias support
- Build output remains in `/build` directory for compatibility

## Environment Variables
```
# Database
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_MYSQL_NAME

# AI Keys (with fallback priority)
ANTHROPIC_API_KEY=sk-ant-api03-...  # Claude (1st choice)
OPENAI_API_KEY=sk-proj-...          # ChatGPT (2nd choice)
EMERGENT_LLM_KEY=sk-emergent-...    # Emergent (3rd choice/fallback)
GEMINI_API_KEY=AIzaSy...            # Gemini Direct (extraction)

# Mercado Pago
MP_ACCESS_TOKEN, MP_PUBLIC_KEY, MP_WEBHOOK_SECRET

# App Config
NEXTAUTH_SECRET
ADMIN_EMAIL, ADMIN_PASSWORD
DPO_NAME, DPO_EMAIL
```

## Test Credentials
- **Admin**: admin@exagram.com.br / Exagram@Admin2024
- **Coupons**: TESTE10 (10%), BEMVINDO20 (20%)

## API Response - AI Providers
The API now returns which AI provider was used:

```json
// Exam Upload Response
{
  "exam_id": "...",
  "_ai_providers": {
    "extraction": "gemini_direct",
    "analysis": "emergent"
  }
}

// Chat Response
{
  "ai_response": {...},
  "_ai_provider": "emergent"
}
```

## Remaining Backlog

### P1 (High Priority)
- [ ] Credit expiration after 365 days
- [ ] Email notifications (payment confirmation)
- [ ] Automatic data retention cron job

### P2 (Medium Priority)
- [ ] Coupon usage reports
- [ ] Export exam results as PDF
- [ ] Specialist rating/reviews

### P3 (Nice to Have)
- [ ] Mobile app
- [ ] WhatsApp integration
- [ ] PIX direct payment
