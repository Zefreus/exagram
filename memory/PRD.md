# Exagram - PRD (Product Requirements Document)

## Original Problem Statement
Build a single-purpose multi-tenant SaaS web application called "Exagram" for analyzing blood count exams (hemograma) in the Brazilian market. Domain: exagram.com.br

The target user is someone who recently received blood exam results, does not yet have a doctor's appointment scheduled or is waiting for a follow-up, and wants to understand their results before or between consultations.

## User Personas

### Primary User: Patient/Consumer
- Brazilian adults (18+) who recently received blood exam results
- Anxious about their health, seeking clarity and reassurance
- Not looking for diagnosis, wants to understand results in simple language
- May be waiting for doctor's appointment

### Admin User: Platform Administrator
- Manages tenants, specialists, and system configurations
- Access to aggregate metrics (no PII)
- Manages coupon codes and billing operations

## Core Requirements (Static)

### Authentication & Authorization
- [x] Separate auth for users and admins
- [x] JWT-based authentication
- [x] Multi-tenant data isolation
- [x] LGPD consent flow (2-step)

### Exam Analysis
- [x] PDF/Image upload (drag & drop)
- [x] AI extraction via Gemini Vision
- [x] AI analysis via Claude Sonnet
- [x] Conversational chat interface
- [x] Color-coded results (normal/borderline/attention)
- [x] Specialist recommendations

### Billing (Stripe)
- [x] Credit packages (R$9.90, R$19.90, R$49.90)
- [x] 1 free credit for new users
- [x] Stripe Checkout integration
- [x] Payment status polling

### Admin Dashboard
- [x] Overview statistics
- [x] Tenant management (CRUD) - FIXED cascade delete
- [x] Specialist management (CRUD)
- [x] Audit log

### LGPD Compliance
- [x] Consent wall (terms, privacy, sensitive data)
- [x] Data export functionality
- [x] Account deletion - FIXED cascade delete
- [x] DPO contact information
- [x] Terms of Use page
- [x] Privacy Policy page

## What's Been Implemented

### December 2025 - Bug Fixes & Route Standardization

**Route Fixes Applied:**
- Standardized all API routes from `exa_*` prefix to clean names:
  - `/exa_exams/*` → `/exams/*`
  - `/exa_specialists/*` → `/specialists/*`
  - `/admin/exa_tenants/*` → `/admin/tenants/*`
  - `/admin/exa_specialists/*` → `/admin/specialists/*`

**Critical Bug Fixes:**
- Fixed cascade delete for tenant deletion (admin endpoint)
- Fixed cascade delete for user account deletion (LGPD endpoint)
- Fixed admin tenant creation to include slug field
- Added EMERGENT_LLM_KEY for Gemini Vision integration

**AI Integration:**
- Gemini 2.5 Flash for exam file extraction
- Claude 4 Sonnet for exam analysis and chat

### Previous Implementation (Backend FastAPI + MySQL)
- User registration with automatic tenant creation
- User login with JWT tokens
- Admin login with separate credentials
- LGPD consent grant/status APIs
- Exam upload with AI processing (Gemini + Claude)
- Chat conversation per exam
- Specialist CRUD operations
- Stripe checkout integration
- Payment status verification
- User data export/deletion APIs

**Frontend (React + Tailwind)**
- Landing page with features, pricing, CTA sections
- User registration and login pages
- LGPD consent flow (2-step modal)
- Dashboard with exam history, credits, upload zone
- Exam results page with chat interface
- Admin login and dashboard
- Specialists search page
- Terms of Use and Privacy Policy pages
- Settings page with LGPD data rights

**Database (MySQL External)**
- Tables: exa_admins, exa_tenants, exa_users, exa_exams, exa_chat_messages, exa_specialists, exa_usage_tracking, exa_consents, exa_audit_log, exa_payment_transactions

## Test Results (December 2025)
- Backend: 94% → 100% (after fixes)
- Frontend: 100%
- All critical bugs resolved

## Prioritized Backlog

### P0 (Critical) - Completed
- ✅ User authentication flow
- ✅ LGPD consent mechanism
- ✅ Exam upload and AI analysis
- ✅ Chat interface
- ✅ Admin dashboard
- ✅ Cascade delete for tenants/users

### P1 (High Priority) - Next Phase
- [ ] Stripe subscription model (Pro plan)
- [ ] Stripe webhook handling (invoice.payment_failed)
- [ ] Credit expiration after 365 days
- [ ] Automatic data retention (90 days cron job)
- [ ] Email notifications

### P2 (Medium Priority)
- [ ] Coupon management in admin (Stripe coupons)
- [ ] Monthly credit rollover for Pro subscribers
- [ ] Specialist rating/reviews
- [ ] Export exam results as PDF

### P3 (Nice to Have)
- [ ] Mobile app (React Native)
- [ ] WhatsApp integration for results
- [ ] Family account management
- [ ] Multiple language support

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, React Router
- **Backend**: FastAPI, Python 3.11
- **Database**: MySQL (external)
- **AI**: 
  - Gemini 2.5 Flash (extraction) - uses EMERGENT_LLM_KEY
  - Claude 4 Sonnet (analysis) - uses ANTHROPIC_API_KEY
- **Payments**: Stripe
- **Auth**: JWT with bcrypt

## Environment Variables Required
```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_MYSQL_NAME
ANTHROPIC_API_KEY
EMERGENT_LLM_KEY
STRIPE_SECRET_KEY
NEXTAUTH_SECRET
ADMIN_EMAIL, ADMIN_PASSWORD
DPO_NAME, DPO_EMAIL
RETENTION_DAYS, CONSENT_VERSION, CREDIT_EXPIRY_DAYS
```

## API Endpoints Summary

### Auth
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/admin/login - Admin login
- GET /api/auth/me - Get current user

### Consent (LGPD)
- POST /api/consent/grant - Grant consent
- GET /api/consent/status - Check consent status
- GET /api/consent/config - Get DPO info

### Exams
- POST /api/exams/upload - Upload exam files
- GET /api/exams - List user exams
- GET /api/exams/{id} - Get exam details
- POST /api/exams/{id}/chat - Chat about exam

### Specialists
- GET /api/specialists - List specialists

### Payments
- GET /api/packages - Get credit packages
- POST /api/payments/checkout - Create checkout session
- GET /api/payments/status/{session_id} - Check payment status

### Admin
- GET /api/admin/overview - Dashboard stats
- GET /api/admin/tenants - List tenants
- POST /api/admin/tenants - Create tenant
- PATCH /api/admin/tenants/{id} - Toggle tenant active
- DELETE /api/admin/tenants/{id} - Delete tenant (cascade)
- POST /api/admin/specialists - Create specialist
- PATCH /api/admin/specialists/{id} - Update specialist
- DELETE /api/admin/specialists/{id} - Delete specialist
- GET /api/admin/audit-log - View audit log

### User Data (LGPD)
- GET /api/user/data - Export all user data
- DELETE /api/user/account - Delete account (cascade)

## Test Credentials
- **Admin**: admin@exagram.com.br / Exagram@Admin2024
- **User**: Register through /register page (1 free credit)

## Next Action Items
1. Implement Stripe webhooks for subscription lifecycle
2. Add credit expiration logic
3. Create automated data retention cron job
4. Add email notifications for payment failures
5. Test exam upload with real hemogram PDF/images
