# Exagram - PRD (Product Requirements Document)

## Original Problem Statement
Build a single-purpose multi-tenant SaaS web application called "Exagram" for analyzing blood count exams (hemograma) in the Brazilian market.

## What's Been Implemented ✅

### Core Features (100% Working)

#### 1. Exam Analysis Flow
- **Upload**: Drag & drop PDF/images on dashboard
- **AI Extraction (Gemini 2.5 Flash)**: Extracts 13 hemogram parameters
  - Hemoglobina, Hematócrito, Eritrócitos, Leucócitos, Plaquetas
  - VCM, HCM, CHCM
  - Neutrófilos, Linfócitos, Monócitos, Eosinófilos, Basófilos
- **AI Analysis (Claude 4 Sonnet)**: Generates warm summary in Portuguese
- **Classification**: Values flagged as normal/borderline/attention
- **Credit Deduction**: 1 credit consumed per analysis

#### 2. Chat Interface
- Conversational AI with exam context
- Contextual answers about user's specific values
- Message persistence in database
- Quick reply suggestions

#### 3. Payment System (Mercado Pago)
- **Checkout Pro**: Redirect-based payment
- **Credit Packages**: R$9.90 (1), R$19.90 (3), R$49.90 (10)
- **Coupon System**: Local database with percent/fixed discounts
- **Webhook**: Automatic credit addition on payment approval
- **HMAC Validation**: Secure webhook signature verification

#### 4. Admin Dashboard
- Overview statistics
- Tenant management (CRUD)
- Specialist management (CRUD)
- Coupon management (CRUD)
- Audit log

#### 5. Authentication & LGPD
- JWT-based auth for users and admins
- 2-step consent flow (terms/privacy + sensitive data)
- Data export and account deletion
- Multi-tenant data isolation

### Test Results (March 2026)
- **Backend**: 100% (26/26 tests passed)
- **Frontend**: 100% (all features working)

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI, Python 3.11
- **Database**: MySQL (external)
- **AI**: 
  - Gemini 2.5 Flash (extraction) - EMERGENT_LLM_KEY
  - Claude 4 Sonnet (analysis/chat) - EMERGENT_LLM_KEY
- **Payments**: Mercado Pago Checkout Pro

## Environment Variables
```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_MYSQL_NAME
EMERGENT_LLM_KEY
MP_ACCESS_TOKEN, MP_PUBLIC_KEY, MP_WEBHOOK_SECRET
NEXTAUTH_SECRET
ADMIN_EMAIL, ADMIN_PASSWORD
DPO_NAME, DPO_EMAIL
RETENTION_DAYS, CONSENT_VERSION, CREDIT_EXPIRY_DAYS
```

## Test Credentials
- **Admin**: admin@exagram.com.br / Exagram@Admin2024
- **Test User**: final_test_1773422756@exagram.com / Test123!
- **Coupons**: TESTE10 (10%), BEMVINDO20 (20%)

## Remaining Backlog

### P1 (High Priority)
- [ ] Credit expiration after 365 days
- [ ] Email notifications (payment confirmation, welcome)
- [ ] Automatic data retention cron job (90 days)

### P2 (Medium Priority)
- [ ] Coupon usage reports
- [ ] Export exam results as PDF
- [ ] Specialist rating/reviews

### P3 (Nice to Have)
- [ ] Mobile app (React Native)
- [ ] WhatsApp integration for results
- [ ] PIX direct payment

## API Endpoints (Complete)

### Auth
- POST /api/auth/register, /api/auth/login, /api/admin/login
- GET /api/auth/me

### Exams
- POST /api/exams/upload
- GET /api/exams, /api/exams/{id}
- POST /api/exams/{id}/chat

### Payments
- GET /api/packages
- POST /api/payments/checkout, /api/payments/validate-coupon
- GET /api/payments/status/{id}
- POST /api/webhooks/mercadopago

### Admin
- GET /api/admin/overview, /api/admin/tenants, /api/admin/coupons, /api/admin/audit-log
- POST /api/admin/tenants, /api/admin/coupons, /api/admin/specialists
- PATCH /api/admin/tenants/{id}, /api/admin/coupons/{id}, /api/admin/specialists/{id}
- DELETE /api/admin/tenants/{id}, /api/admin/coupons/{id}, /api/admin/specialists/{id}

### LGPD
- POST /api/consent/grant
- GET /api/consent/status, /api/consent/config
- GET /api/user/data
- DELETE /api/user/account
