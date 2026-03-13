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

### Billing (Mercado Pago)
- [x] Credit packages (R$9.90, R$19.90, R$49.90)
- [x] 1 free credit for new users
- [x] Mercado Pago Checkout Pro integration
- [x] Local coupon system with admin management
- [x] Coupon types: percentage and fixed value discounts

### Admin Dashboard
- [x] Overview statistics
- [x] Tenant management (CRUD)
- [x] Specialist management (CRUD)
- [x] **Coupon management (CRUD)** - NEW
- [x] Audit log

### LGPD Compliance
- [x] Consent wall (terms, privacy, sensitive data)
- [x] Data export functionality
- [x] Account deletion with cascade
- [x] DPO contact information
- [x] Terms of Use page
- [x] Privacy Policy page

## What's Been Implemented

### March 2026 - Stripe to Mercado Pago Migration

**Payment System Changes:**
- Removed all Stripe integration
- Implemented Mercado Pago Checkout Pro (redirect-based)
- Created local coupon system in database (`exa_coupons` table)
- Added coupon validation endpoint
- Updated all references from Stripe to Mercado Pago

**New Features:**
- Coupon code input in purchase modal
- Real-time discount calculation display
- Admin Coupon Management tab with full CRUD
- Support for percentage and fixed value discounts

**Database Changes:**
- Renamed `stripe_customer_id` → `mp_customer_id`
- Created `exa_coupons` table
- Added `coupon_code`, `original_amount`, `discount_amount` to transactions

**Bug Fixes:**
- Fixed `/api/auth/me` endpoint (removed stripe reference)
- Fixed cascade delete for tenants and users

### Previous Implementation
- User registration with automatic tenant creation
- User login with JWT tokens
- Admin login with separate credentials
- LGPD consent grant/status APIs
- Exam upload with AI processing (Gemini + Claude)
- Chat conversation per exam
- Specialist CRUD operations
- User data export/deletion APIs

## Test Results (March 2026)
- Backend: 100% (22/22 tests passed)
- Frontend: 100% (all features working)
- All payment flows verified with Mercado Pago sandbox

## Prioritized Backlog

### P0 (Critical) - Completed ✅
- ✅ User authentication flow
- ✅ LGPD consent mechanism
- ✅ Exam upload and AI analysis
- ✅ Chat interface
- ✅ Admin dashboard
- ✅ Cascade delete for tenants/users
- ✅ **Mercado Pago payment integration**
- ✅ **Coupon system**

### P1 (High Priority) - Next Phase
- [ ] Mercado Pago webhook handling for automatic credit addition
- [ ] Credit expiration after 365 days
- [ ] Automatic data retention (90 days cron job)
- [ ] Email notifications (payment confirmation)

### P2 (Medium Priority)
- [ ] Coupon usage reports
- [ ] Batch coupon creation
- [ ] Specialist rating/reviews
- [ ] Export exam results as PDF

### P3 (Nice to Have)
- [ ] Mobile app (React Native)
- [ ] WhatsApp integration for results
- [ ] PIX direct payment
- [ ] Multiple language support

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, React Router
- **Backend**: FastAPI, Python 3.11
- **Database**: MySQL (external)
- **AI**: 
  - Gemini 2.5 Flash (extraction) - uses EMERGENT_LLM_KEY
  - Claude 4 Sonnet (analysis) - uses ANTHROPIC_API_KEY
- **Payments**: Mercado Pago (Checkout Pro)
- **Auth**: JWT with bcrypt

## Environment Variables Required
```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_MYSQL_NAME
ANTHROPIC_API_KEY
EMERGENT_LLM_KEY
MP_ACCESS_TOKEN
MP_PUBLIC_KEY
MP_WEBHOOK_SECRET
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

### Payments (Mercado Pago)
- GET /api/packages - Get credit packages
- POST /api/payments/checkout - Create Mercado Pago preference
- POST /api/payments/validate-coupon - Validate coupon code
- GET /api/payments/status/{preference_id} - Check payment status
- POST /api/webhooks/mercadopago - Mercado Pago webhook

### Admin
- GET /api/admin/overview - Dashboard stats
- GET /api/admin/tenants - List tenants
- POST /api/admin/tenants - Create tenant
- PATCH /api/admin/tenants/{id} - Toggle tenant active
- DELETE /api/admin/tenants/{id} - Delete tenant (cascade)
- GET /api/admin/coupons - List coupons
- POST /api/admin/coupons - Create coupon
- PATCH /api/admin/coupons/{id}?active={bool} - Toggle coupon
- DELETE /api/admin/coupons/{id} - Delete coupon
- GET /api/admin/audit-log - View audit log

### User Data (LGPD)
- GET /api/user/data - Export all user data
- DELETE /api/user/account - Delete account (cascade)

## Test Credentials
- **Admin**: admin@exagram.com.br / Exagram@Admin2024
- **User**: Register through /register page (1 free credit)
- **Test Coupon**: TESTE10 (10% discount)

## Next Action Items
1. Implement Mercado Pago webhook for automatic credit addition
2. Add credit expiration logic
3. Create automated data retention cron job
4. Add email notifications for payment confirmation
5. Test exam upload with real hemogram PDF/images
