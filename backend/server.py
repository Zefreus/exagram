from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Header, Request, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import json
import base64
import aiomysql
import asyncio
from contextlib import asynccontextmanager

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MySQL Configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST'),
    'port': int(os.environ.get('DB_PORT', 3306)),
    'user': os.environ.get('DB_USER'),
    'password': os.environ.get('DB_PASSWORD'),
    'db': os.environ.get('DB_MYSQL_NAME'),
    'autocommit': True
}

# JWT Configuration
JWT_SECRET = os.environ.get('NEXTAUTH_SECRET', 'fallback_secret')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Admin credentials
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@exagram.com.br')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Exagram@Admin2024')

# LGPD Configuration
DPO_NAME = os.environ.get('DPO_NAME', 'Tiago Leal')
DPO_EMAIL = os.environ.get('DPO_EMAIL', 'zefreus@gmail.com')
CONSENT_VERSION = os.environ.get('CONSENT_VERSION', '1.0')
RETENTION_DAYS = int(os.environ.get('RETENTION_DAYS', 90))
CREDIT_EXPIRY_DAYS = int(os.environ.get('CREDIT_EXPIRY_DAYS', 365))

# Anthropic Configuration
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')

# Emergent LLM Key (universal key for all providers)
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', ANTHROPIC_API_KEY)

# Mercado Pago Configuration
MP_ACCESS_TOKEN = os.environ.get('MP_ACCESS_TOKEN')
MP_PUBLIC_KEY = os.environ.get('MP_PUBLIC_KEY')
MP_WEBHOOK_SECRET = os.environ.get('MP_WEBHOOK_SECRET', '')

# Database pool
db_pool = None

async def get_db_pool():
    global db_pool
    if db_pool is None:
        db_pool = await aiomysql.create_pool(**DB_CONFIG, minsize=1, maxsize=10)
    return db_pool

async def execute_query(query: str, params: tuple = None, fetch: bool = False, fetchone: bool = False):
    pool = await get_db_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            await cursor.execute(query, params)
            if fetchone:
                return await cursor.fetchone()
            if fetch:
                return await cursor.fetchall()
            return cursor.lastrowid

# Initialize database tables
async def init_database():
    queries = [
        """CREATE TABLE IF NOT EXISTS exa_admins (
            id VARCHAR(36) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""",
        """CREATE TABLE IF NOT EXISTS exa_tenants (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            stripe_customer_id VARCHAR(255),
            plan ENUM('free', 'pro') DEFAULT 'free',
            exam_credits INT DEFAULT 1,
            active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""",
        """CREATE TABLE IF NOT EXISTS exa_users (
            id VARCHAR(36) PRIMARY KEY,
            tenant_id VARCHAR(36) UNIQUE,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            consent_granted BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tenant_id) REFERENCES exa_tenants(id) ON DELETE CASCADE
        )""",
        """CREATE TABLE IF NOT EXISTS exa_exams (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            tenant_id VARCHAR(36) NOT NULL,
            extracted_data LONGTEXT,
            ai_analysis LONGTEXT,
            flags LONGTEXT,
            summary TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_tenant_id (tenant_id)
        )""",
        """CREATE TABLE IF NOT EXISTS exa_chat_messages (
            id VARCHAR(36) PRIMARY KEY,
            exam_id VARCHAR(36) NOT NULL,
            user_id VARCHAR(36) NOT NULL,
            role ENUM('user', 'assistant') NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_exam_id (exam_id)
        )""",
        """CREATE TABLE IF NOT EXISTS exa_specialists (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            specialty VARCHAR(255) NOT NULL,
            type ENUM('medico', 'clinica', 'hospital') NOT NULL,
            city VARCHAR(255),
            state VARCHAR(50),
            phone VARCHAR(50),
            website VARCHAR(255),
            email VARCHAR(255),
            description TEXT,
            active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""",
        """CREATE TABLE IF NOT EXISTS exa_usage_tracking (
            id VARCHAR(36) PRIMARY KEY,
            tenant_id VARCHAR(36) NOT NULL,
            month_year VARCHAR(7) NOT NULL,
            exam_count INT DEFAULT 0,
            FOREIGN KEY (tenant_id) REFERENCES exa_tenants(id) ON DELETE CASCADE,
            UNIQUE KEY unique_tenant_month (tenant_id, month_year)
        )""",
        """CREATE TABLE IF NOT EXISTS exa_consents (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            consent_version VARCHAR(20) NOT NULL,
            ip_address VARCHAR(50),
            user_agent TEXT,
            action ENUM('granted', 'revoked') NOT NULL,
            type ENUM('terms', 'privacy', 'sensitive_data') NOT NULL,
            FOREIGN KEY (user_id) REFERENCES exa_users(id) ON DELETE CASCADE
        )""",
        """CREATE TABLE IF NOT EXISTS exa_audit_log (
            id VARCHAR(36) PRIMARY KEY,
            event_type VARCHAR(100) NOT NULL,
            affected_count INT DEFAULT 0,
            tenant_id VARCHAR(36),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""",
        """CREATE TABLE IF NOT EXISTS exa_payment_transactions (
            id VARCHAR(36) PRIMARY KEY,
            tenant_id VARCHAR(36) NOT NULL,
            session_id VARCHAR(255) UNIQUE,
            amount DECIMAL(10,2),
            currency VARCHAR(10),
            credits INT,
            payment_status VARCHAR(50) DEFAULT 'pending',
            metadata LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_tenant_id (tenant_id)
        )""",
        """CREATE TABLE IF NOT EXISTS exa_coupons (
            id VARCHAR(36) PRIMARY KEY,
            code VARCHAR(50) UNIQUE NOT NULL,
            discount_type ENUM('percent', 'fixed') NOT NULL,
            discount_value DECIMAL(10,2) NOT NULL,
            max_redemptions INT DEFAULT NULL,
            times_redeemed INT DEFAULT 0,
            expires_at DATETIME DEFAULT NULL,
            active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )"""
    ]
    for query in queries:
        try:
            await execute_query(query)
        except Exception as e:
            logging.error(f"Error creating table: {e}")
    
    # Create default admin if not exists
    admin_exists = await execute_query(
        "SELECT id FROM exa_admins WHERE email = %s",
        (ADMIN_EMAIL,),
        fetchone=True
    )
    if not admin_exists:
        password_hash = bcrypt.hashpw(ADMIN_PASSWORD.encode(), bcrypt.gensalt()).decode()
        await execute_query(
            "INSERT INTO exa_admins (id, email, password_hash) VALUES (%s, %s, %s)",
            (str(uuid.uuid4()), ADMIN_EMAIL, password_hash)
        )
        logging.info(f"Default admin created: {ADMIN_EMAIL}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_database()
    yield
    if db_pool:
        db_pool.close()
        await db_pool.wait_closed()

app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# ============== MODELS ==============

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class ConsentGrant(BaseModel):
    type: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class TenantCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class SpecialistCreate(BaseModel):
    name: str
    specialty: str
    type: str
    city: Optional[str] = None
    state: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None

class SpecialistUpdate(BaseModel):
    name: Optional[str] = None
    specialty: Optional[str] = None
    type: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None
    active: Optional[bool] = None

class ChatMessage(BaseModel):
    content: str

class CheckoutRequest(BaseModel):
    package_id: str
    origin_url: str
    coupon_code: Optional[str] = None

class CouponCreate(BaseModel):
    code: str
    discount_type: str  # 'percent' or 'fixed'
    discount_value: float
    max_redemptions: Optional[int] = None
    expires_at: Optional[str] = None

class CouponValidate(BaseModel):
    code: str

# ============== AUTH HELPERS ==============

def create_token(user_id: str, user_type: str, tenant_id: str = None, email: str = None):
    payload = {
        'user_id': user_id,
        'user_type': user_type,
        'tenant_id': tenant_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Não autenticado")
    payload = decode_token(credentials.credentials)
    if payload['user_type'] != 'user':
        raise HTTPException(status_code=403, detail="Acesso negado")
    return payload

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Não autenticado")
    payload = decode_token(credentials.credentials)
    if payload['user_type'] != 'admin':
        raise HTTPException(status_code=403, detail="Acesso negado - apenas administradores")
    return payload

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register")
async def register_user(data: UserRegister):
    # Check if user exists
    existing = await execute_query(
        "SELECT id FROM exa_users WHERE email = %s",
        (data.email,),
        fetchone=True
    )
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Create tenant first
    tenant_id = str(uuid.uuid4())
    slug = data.email.split('@')[0] + '_' + tenant_id[:8]
    await execute_query(
        "INSERT INTO exa_tenants (id, name, slug, plan, exam_credits, active, created_at) VALUES (%s, %s, %s, 'free', 1, TRUE, NOW())",
        (tenant_id, data.name, slug)
    )
    
    # Create user
    user_id = str(uuid.uuid4())
    password_hash = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    await execute_query(
        "INSERT INTO exa_users (id, tenant_id, email, password_hash, name, created_at) VALUES (%s, %s, %s, %s, %s, NOW())",
        (user_id, tenant_id, data.email, password_hash, data.name)
    )
    
    token = create_token(user_id, 'user', tenant_id, data.email)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": data.email,
            "tenant_id": tenant_id,
            "name": data.name,
            "consent_granted": False
        }
    }

@api_router.post("/auth/login")
async def login_user(data: UserLogin):
    user = await execute_query(
        """SELECT u.*, t.name as tenant_name, t.exam_credits, t.plan 
           FROM exa_users u 
           JOIN exa_tenants t ON u.tenant_id = t.id 
           WHERE u.email = %s AND t.active = TRUE""",
        (data.email,),
        fetchone=True
    )
    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    if not bcrypt.checkpw(data.password.encode(), user['password_hash'].encode()):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    token = create_token(user['id'], 'user', user['tenant_id'], data.email)
    return {
        "token": token,
        "user": {
            "id": user['id'],
            "email": user['email'],
            "tenant_id": user['tenant_id'],
            "name": user['tenant_name'],
            "exam_credits": user['exam_credits'],
            "plan": user['plan'],
            "consent_granted": bool(user['consent_granted'])
        }
    }

@api_router.post("/admin/login")
async def login_admin(data: AdminLogin):
    admin = await execute_query(
        "SELECT * FROM exa_admins WHERE email = %s",
        (data.email,),
        fetchone=True
    )
    if not admin:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    if not bcrypt.checkpw(data.password.encode(), admin['password_hash'].encode()):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    token = create_token(admin['id'], 'admin', email=data.email)
    return {
        "token": token,
        "admin": {
            "id": admin['id'],
            "email": admin['email']
        }
    }

@api_router.get("/auth/me")
async def get_me(user = Depends(get_current_user)):
    user_data = await execute_query(
        """SELECT u.*, t.name as tenant_name, t.exam_credits, t.plan
           FROM exa_users u 
           JOIN exa_tenants t ON u.tenant_id = t.id 
           WHERE u.id = %s""",
        (user['user_id'],),
        fetchone=True
    )
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {
        "id": user_data['id'],
        "email": user_data['email'],
        "tenant_id": user_data['tenant_id'],
        "name": user_data['tenant_name'],
        "exam_credits": user_data['exam_credits'],
        "plan": user_data['plan'],
        "consent_granted": bool(user_data['consent_granted'])
    }

# ============== CONSENT ROUTES ==============

@api_router.post("/consent/grant")
async def grant_consent(data: ConsentGrant, request: Request, user = Depends(get_current_user)):
    consent_id = str(uuid.uuid4())
    await execute_query(
        """INSERT INTO exa_consents (id, user_id, consent_version, ip_address, user_agent, action, type)
           VALUES (%s, %s, %s, %s, %s, 'granted', %s)""",
        (consent_id, user['user_id'], CONSENT_VERSION, 
         data.ip_address or request.client.host,
         data.user_agent or request.headers.get('user-agent', ''),
         data.type)
    )
    
    # Check if all exa_consents are granted
    exa_consents = await execute_query(
        "SELECT DISTINCT type FROM exa_consents WHERE user_id = %s AND action = 'granted'",
        (user['user_id'],),
        fetch=True
    )
    consent_types = [c['type'] for c in exa_consents]
    
    if all(t in consent_types for t in ['terms', 'privacy', 'sensitive_data']):
        await execute_query(
            "UPDATE exa_users SET consent_granted = TRUE WHERE id = %s",
            (user['user_id'],)
        )
    
    return {"success": True, "type": data.type}

@api_router.get("/consent/status")
async def get_consent_status(user = Depends(get_current_user)):
    exa_consents = await execute_query(
        """SELECT type, action, timestamp FROM exa_consents 
           WHERE user_id = %s 
           ORDER BY timestamp DESC""",
        (user['user_id'],),
        fetch=True
    )
    
    # Get latest status for each type
    status = {}
    for consent in exa_consents:
        if consent['type'] not in status:
            status[consent['type']] = {
                'granted': consent['action'] == 'granted',
                'timestamp': consent['timestamp'].isoformat() if consent['timestamp'] else None
            }
    
    user_data = await execute_query(
        "SELECT consent_granted FROM exa_users WHERE id = %s",
        (user['user_id'],),
        fetchone=True
    )
    
    return {
        "all_granted": bool(user_data['consent_granted']),
        "consent_version": CONSENT_VERSION,
        "exa_consents": status
    }

@api_router.get("/consent/config")
async def get_consent_config():
    return {
        "dpo_name": DPO_NAME,
        "dpo_email": DPO_EMAIL,
        "consent_version": CONSENT_VERSION,
        "retention_days": RETENTION_DAYS
    }

# ============== EXAM ROUTES ==============

@api_router.post("/exams/upload")
async def upload_exam(
    files: List[UploadFile] = File(...),
    confirm_same_exam: bool = Form(True),
    user = Depends(get_current_user)
):
    # Check credits
    tenant = await execute_query(
        "SELECT exam_credits FROM exa_tenants WHERE id = %s",
        (user['tenant_id'],),
        fetchone=True
    )
    if not tenant or tenant['exam_credits'] < 1:
        raise HTTPException(status_code=402, detail="Créditos insuficientes. Por favor, adquira mais análises.")
    
    # Process files with Claude Vision
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType
        import tempfile
        import aiofiles
        
        # Save files temporarily
        temp_files = []
        for file in files:
            content = await file.read()
            suffix = Path(file.filename).suffix
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(content)
                temp_files.append({
                    'path': tmp.name,
                    'mime': file.content_type,
                    'name': file.filename
                })
        
        # Use Gemini for file analysis (supports file attachments)
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"exam_{str(uuid.uuid4())}",
            system_message="""Você é um especialista em análise de hemogramas. 
Extraia TODOS os valores do exame de sangue da imagem/PDF fornecido.
Retorne um JSON com a estrutura:
{
    "valores": {
        "hemoglobina": {"valor": number, "unidade": string, "referencia_min": number, "referencia_max": number},
        "hematocrito": {"valor": number, "unidade": string, "referencia_min": number, "referencia_max": number},
        "eritrocitos": {"valor": number, "unidade": string, "referencia_min": number, "referencia_max": number},
        "leucocitos": {"valor": number, "unidade": string, "referencia_min": number, "referencia_max": number},
        "plaquetas": {"valor": number, "unidade": string, "referencia_min": number, "referencia_max": number},
        "vcm": {"valor": number, "unidade": string, "referencia_min": number, "referencia_max": number},
        "hcm": {"valor": number, "unidade": string, "referencia_min": number, "referencia_max": number},
        "chcm": {"valor": number, "unidade": string, "referencia_min": number, "referencia_max": number},
        "neutrofilos": {"valor": number, "unidade": string, "referencia_min": number, "referencia_max": number},
        "linfocitos": {"valor": number, "unidade": string, "referencia_min": number, "referencia_max": number},
        "eosinofilos": {"valor": number, "unidade": string, "referencia_min": number, "referencia_max": number},
        "basofilos": {"valor": number, "unidade": string, "referencia_min": number, "referencia_max": number},
        "monocitos": {"valor": number, "unidade": string, "referencia_min": number, "referencia_max": number}
    },
    "laboratorio": string,
    "data_exame": string
}
Retorne APENAS o JSON, sem markdown ou explicações."""
        ).with_model("gemini", "gemini-2.5-flash")
        
        # Create file contents
        file_contents = [
            FileContentWithMimeType(file_path=f['path'], mime_type=f['mime'])
            for f in temp_files
        ]
        
        # Extract data
        extraction_response = await chat.send_message(UserMessage(
            text="Extraia todos os valores deste hemograma. Retorne apenas JSON.",
            file_contents=file_contents
        ))
        
        # Clean up temp files
        for f in temp_files:
            try:
                os.unlink(f['path'])
            except:
                pass
        
        # Parse extracted data
        try:
            # Clean response - remove markdown code blocks if present
            clean_response = extraction_response.strip()
            if clean_response.startswith('```'):
                clean_response = clean_response.split('\n', 1)[1]
                if clean_response.endswith('```'):
                    clean_response = clean_response[:-3]
            extracted_data = json.loads(clean_response)
        except json.JSONDecodeError:
            extracted_data = {"raw_text": extraction_response, "valores": {}}
        
        # Analyze with Claude for summary and flags
        analysis_chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"analysis_{str(uuid.uuid4())}",
            system_message="""Você é um assistente de saúde empático e acolhedor. Analise os valores do hemograma e forneça:
1. Um resumo caloroso e tranquilizador em português brasileiro (como um amigo bem-informado falaria)
2. Flags para cada valor: "normal", "borderline" ou "attention"
3. Lista de especialistas sugeridos baseado em valores alterados

Retorne JSON:
{
    "summary": "texto do resumo acolhedor",
    "flags": {"hemoglobina": "normal", ...},
    "suggested_exa_specialists": ["Hematologista", ...]
}"""
        ).with_model("anthropic", "claude-4-sonnet-20250514")
        
        analysis_response = await analysis_chat.send_message(UserMessage(
            text=f"Analise este hemograma: {json.dumps(extracted_data)}"
        ))
        
        # Parse analysis
        try:
            clean_analysis = analysis_response.strip()
            if clean_analysis.startswith('```'):
                clean_analysis = clean_analysis.split('\n', 1)[1]
                if clean_analysis.endswith('```'):
                    clean_analysis = clean_analysis[:-3]
            analysis_data = json.loads(clean_analysis)
        except json.JSONDecodeError:
            analysis_data = {
                "summary": "Seus exames foram processados. Consulte os valores abaixo.",
                "flags": {},
                "suggested_exa_specialists": []
            }
        
        # Deduct credit
        await execute_query(
            "UPDATE exa_tenants SET exam_credits = exam_credits - 1 WHERE id = %s",
            (user['tenant_id'],)
        )
        
        # Track usage
        month_year = datetime.now(timezone.utc).strftime('%Y-%m')
        await execute_query(
            """INSERT INTO exa_usage_tracking (id, tenant_id, month_year, exam_count)
               VALUES (%s, %s, %s, 1)
               ON DUPLICATE KEY UPDATE exam_count = exam_count + 1""",
            (str(uuid.uuid4()), user['tenant_id'], month_year)
        )
        
        # Save exam
        exam_id = str(uuid.uuid4())
        await execute_query(
            """INSERT INTO exa_exams (id, user_id, tenant_id, extracted_data, ai_analysis, flags, summary)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (exam_id, user['user_id'], user['tenant_id'],
             json.dumps(extracted_data),
             json.dumps(analysis_data),
             json.dumps(analysis_data.get('flags', {})),
             analysis_data.get('summary', ''))
        )
        
        # Create initial AI message
        initial_message = "Analisei seu exame. Ficou alguma dúvida sobre algum valor específico? Pode me perguntar à vontade."
        msg_id = str(uuid.uuid4())
        await execute_query(
            """INSERT INTO exa_chat_messages (id, exam_id, user_id, role, content)
               VALUES (%s, %s, %s, 'assistant', %s)""",
            (msg_id, exam_id, user['user_id'], initial_message)
        )
        
        return {
            "exam_id": exam_id,
            "extracted_data": extracted_data,
            "analysis": analysis_data,
            "credits_remaining": tenant['exam_credits'] - 1
        }
        
    except Exception as e:
        logging.error(f"Error processing exam: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar exame: {str(e)}")

@api_router.get("/exams")
async def get_exams(user = Depends(get_current_user)):
    exa_exams = await execute_query(
        """SELECT id, summary, created_at FROM exa_exams 
           WHERE user_id = %s 
           ORDER BY created_at DESC""",
        (user['user_id'],),
        fetch=True
    )
    return [{
        "id": e['id'],
        "summary": e['summary'][:150] + '...' if e['summary'] and len(e['summary']) > 150 else e['summary'],
        "created_at": e['created_at'].isoformat() if e['created_at'] else None
    } for e in exa_exams]

@api_router.get("/exams/{exam_id}")
async def get_exam(exam_id: str, user = Depends(get_current_user)):
    exam = await execute_query(
        """SELECT * FROM exa_exams WHERE id = %s AND user_id = %s""",
        (exam_id, user['user_id']),
        fetchone=True
    )
    if not exam:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    
    # Get chat messages
    messages = await execute_query(
        """SELECT id, role, content, created_at FROM exa_chat_messages 
           WHERE exam_id = %s ORDER BY created_at ASC""",
        (exam_id,),
        fetch=True
    )
    
    # Get suggested exa_specialists
    analysis = json.loads(exam['ai_analysis']) if exam['ai_analysis'] else {}
    suggested_specialties = analysis.get('suggested_exa_specialists', [])
    
    exa_specialists = []
    if suggested_specialties:
        placeholders = ','.join(['%s'] * len(suggested_specialties))
        exa_specialists = await execute_query(
            f"""SELECT id, name, specialty, type, city, state, phone, website, email, description
                FROM exa_specialists 
                WHERE specialty IN ({placeholders}) AND active = TRUE
                LIMIT 10""",
            tuple(suggested_specialties),
            fetch=True
        )
    
    return {
        "id": exam['id'],
        "extracted_data": json.loads(exam['extracted_data']) if exam['extracted_data'] else {},
        "analysis": analysis,
        "flags": json.loads(exam['flags']) if exam['flags'] else {},
        "summary": exam['summary'],
        "created_at": exam['created_at'].isoformat() if exam['created_at'] else None,
        "messages": [{
            "id": m['id'],
            "role": m['role'],
            "content": m['content'],
            "created_at": m['created_at'].isoformat() if m['created_at'] else None
        } for m in messages],
        "exa_specialists": [dict(s) for s in exa_specialists]
    }

@api_router.post("/exams/{exam_id}/chat")
async def chat_with_exam(exam_id: str, message: ChatMessage, user = Depends(get_current_user)):
    # Get exam
    exam = await execute_query(
        "SELECT * FROM exa_exams WHERE id = %s AND user_id = %s",
        (exam_id, user['user_id']),
        fetchone=True
    )
    if not exam:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    
    # Get chat history
    history = await execute_query(
        "SELECT role, content FROM exa_chat_messages WHERE exam_id = %s ORDER BY created_at ASC",
        (exam_id,),
        fetch=True
    )
    
    # Save user message
    user_msg_id = str(uuid.uuid4())
    await execute_query(
        "INSERT INTO exa_chat_messages (id, exam_id, user_id, role, content) VALUES (%s, %s, %s, 'user', %s)",
        (user_msg_id, exam_id, user['user_id'], message.content)
    )
    
    # Prepare context
    extracted_data = json.loads(exam['extracted_data']) if exam['extracted_data'] else {}
    analysis = json.loads(exam['ai_analysis']) if exam['ai_analysis'] else {}
    
    system_prompt = f"""Você é um assistente de saúde empático e acolhedor. O usuário acabou de receber resultados de um hemograma e pode estar ansioso ou confuso. Seu papel é ajudá-lo a entender os resultados de forma clara e tranquila, como um amigo bem-informado faria.

Regras absolutas:
- Nunca recomende medicamentos específicos
- Nunca faça diagnósticos definitivos
- Sempre que algo merecer atenção médica, sugira consultar um médico de forma calma, nunca alarmista
- Use linguagem simples, evite jargão médico sem explicação
- Seja breve e direto — o usuário está ansioso, não sobrecarregue
- Quando o assunto ultrapassar o exame, admita com naturalidade e redirecione para um profissional

Contexto do exame do usuário:
Valores: {json.dumps(extracted_data, ensure_ascii=False)}
Análise: {json.dumps(analysis, ensure_ascii=False)}"""

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=ANTHROPIC_API_KEY,
            session_id=f"chat_{exam_id}",
            system_message=system_prompt
        ).with_model("anthropic", "claude-4-sonnet-20250514")
        
        # Build conversation context
        context = "\n".join([f"{'Usuário' if h['role'] == 'user' else 'Assistente'}: {h['content']}" for h in history])
        
        response = await chat.send_message(UserMessage(
            text=f"Histórico da conversa:\n{context}\n\nNova mensagem do usuário: {message.content}"
        ))
        
        # Save AI response
        ai_msg_id = str(uuid.uuid4())
        await execute_query(
            "INSERT INTO exa_chat_messages (id, exam_id, user_id, role, content) VALUES (%s, %s, %s, 'assistant', %s)",
            (ai_msg_id, exam_id, user['user_id'], response)
        )
        
        return {
            "user_message": {"id": user_msg_id, "content": message.content},
            "ai_response": {"id": ai_msg_id, "content": response}
        }
        
    except Exception as e:
        logging.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Erro ao processar mensagem")

# ============== SPECIALISTS ROUTES ==============

@api_router.get("/specialists")
async def get_specialists(
    specialty: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None
):
    query = "SELECT * FROM exa_specialists WHERE active = TRUE"
    params = []
    
    if specialty:
        query += " AND specialty LIKE %s"
        params.append(f"%{specialty}%")
    if city:
        query += " AND city LIKE %s"
        params.append(f"%{city}%")
    if state:
        query += " AND state = %s"
        params.append(state)
    
    query += " ORDER BY name ASC LIMIT 50"
    
    exa_specialists = await execute_query(query, tuple(params) if params else None, fetch=True)
    return [dict(s) for s in exa_specialists]

@api_router.get("/specialists/{specialist_id}")
async def get_specialist(specialist_id: str):
    specialist = await execute_query(
        "SELECT * FROM exa_specialists WHERE id = %s AND active = TRUE",
        (specialist_id,),
        fetchone=True
    )
    if not specialist:
        raise HTTPException(status_code=404, detail="Especialista não encontrado")
    return dict(specialist)

# ============== ADMIN ROUTES ==============

@api_router.get("/admin/overview")
async def admin_overview(admin = Depends(get_current_admin)):
    total_exa_tenants = await execute_query("SELECT COUNT(*) as count FROM exa_tenants", fetchone=True)
    active_subs = await execute_query("SELECT COUNT(*) as count FROM exa_tenants WHERE plan = 'pro'", fetchone=True)
    
    month_year = datetime.now(timezone.utc).strftime('%Y-%m')
    exa_exams_this_month = await execute_query(
        "SELECT COALESCE(SUM(exam_count), 0) as count FROM exa_usage_tracking WHERE month_year = %s",
        (month_year,),
        fetchone=True
    )
    
    return {
        "total_exa_tenants": total_exa_tenants['count'],
        "active_subscriptions": active_subs['count'],
        "exa_exams_this_month": exa_exams_this_month['count']
    }

@api_router.get("/admin/tenants")
async def admin_get_tenants(admin = Depends(get_current_admin)):
    exa_tenants = await execute_query(
        """SELECT t.*, u.email as user_email, 
           (SELECT COUNT(*) FROM exa_exams WHERE tenant_id = t.id) as exam_count
           FROM exa_tenants t
           LEFT JOIN exa_users u ON t.id = u.tenant_id
           ORDER BY t.created_at DESC""",
        fetch=True
    )
    return [dict(t) for t in exa_tenants]

@api_router.post("/admin/tenants")
async def admin_create_tenant(data: TenantCreate, admin = Depends(get_current_admin)):
    # Check if email exists
    existing = await execute_query(
        "SELECT id FROM exa_users WHERE email = %s",
        (data.email,),
        fetchone=True
    )
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Create tenant
    tenant_id = str(uuid.uuid4())
    slug = data.email.split('@')[0] + '_' + tenant_id[:8]
    await execute_query(
        "INSERT INTO exa_tenants (id, name, slug, plan, exam_credits, active, created_at) VALUES (%s, %s, %s, 'free', 1, TRUE, NOW())",
        (tenant_id, data.name, slug)
    )
    
    # Create user
    user_id = str(uuid.uuid4())
    password_hash = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    await execute_query(
        "INSERT INTO exa_users (id, tenant_id, email, password_hash, name, created_at) VALUES (%s, %s, %s, %s, %s, NOW())",
        (user_id, tenant_id, data.email, password_hash, data.name)
    )
    
    return {"tenant_id": tenant_id, "user_id": user_id, "email": data.email}

@api_router.patch("/admin/tenants/{tenant_id}")
async def admin_update_tenant(tenant_id: str, active: bool, admin = Depends(get_current_admin)):
    await execute_query(
        "UPDATE exa_tenants SET active = %s WHERE id = %s",
        (active, tenant_id)
    )
    return {"success": True}

@api_router.delete("/admin/tenants/{tenant_id}")
async def admin_delete_tenant(tenant_id: str, admin = Depends(get_current_admin)):
    # Log deletion
    exam_count = await execute_query(
        "SELECT COUNT(*) as count FROM exa_exams WHERE tenant_id = %s",
        (tenant_id,),
        fetchone=True
    )
    
    await execute_query(
        "INSERT INTO exa_audit_log (id, event_type, affected_count, tenant_id) VALUES (%s, 'tenant_deletion', %s, %s)",
        (str(uuid.uuid4()), exam_count['count'], tenant_id)
    )
    
    # Get user_id for this tenant
    user = await execute_query(
        "SELECT id FROM exa_users WHERE tenant_id = %s",
        (tenant_id,),
        fetchone=True
    )
    
    if user:
        user_id = user['id']
        # Delete in order to respect foreign key constraints
        # 1. Delete chat messages (references exam_id)
        await execute_query("DELETE FROM exa_chat_messages WHERE user_id = %s", (user_id,))
        # 2. Delete exams (references user_id and tenant_id)
        await execute_query("DELETE FROM exa_exams WHERE user_id = %s", (user_id,))
        # 3. Delete consents (references user_id)
        await execute_query("DELETE FROM exa_consents WHERE user_id = %s", (user_id,))
        # 4. Delete users (references tenant_id)
        await execute_query("DELETE FROM exa_users WHERE tenant_id = %s", (tenant_id,))
    
    # 5. Delete usage tracking
    await execute_query("DELETE FROM exa_usage_tracking WHERE tenant_id = %s", (tenant_id,))
    # 6. Delete payment transactions
    await execute_query("DELETE FROM exa_payment_transactions WHERE tenant_id = %s", (tenant_id,))
    # 7. Finally delete tenant
    await execute_query("DELETE FROM exa_tenants WHERE id = %s", (tenant_id,))
    return {"success": True}

# Admin Specialists CRUD
@api_router.post("/admin/specialists")
async def admin_create_specialist(data: SpecialistCreate, admin = Depends(get_current_admin)):
    specialist_id = str(uuid.uuid4())
    await execute_query(
        """INSERT INTO exa_specialists (id, name, specialty, type, city, state, phone, website, email, description)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (specialist_id, data.name, data.specialty, data.type, data.city, data.state,
         data.phone, data.website, data.email, data.description)
    )
    return {"id": specialist_id}

@api_router.patch("/admin/specialists/{specialist_id}")
async def admin_update_specialist(specialist_id: str, data: SpecialistUpdate, admin = Depends(get_current_admin)):
    updates = []
    params = []
    for field, value in data.model_dump(exclude_unset=True).items():
        updates.append(f"{field} = %s")
        params.append(value)
    
    if updates:
        params.append(specialist_id)
        await execute_query(
            f"UPDATE exa_specialists SET {', '.join(updates)} WHERE id = %s",
            tuple(params)
        )
    return {"success": True}

@api_router.delete("/admin/specialists/{specialist_id}")
async def admin_delete_specialist(specialist_id: str, admin = Depends(get_current_admin)):
    await execute_query("DELETE FROM exa_specialists WHERE id = %s", (specialist_id,))
    return {"success": True}

@api_router.get("/admin/audit-log")
async def admin_get_audit_log(admin = Depends(get_current_admin)):
    logs = await execute_query(
        "SELECT * FROM exa_audit_log ORDER BY created_at DESC LIMIT 100",
        fetch=True
    )
    return [dict(l) for l in logs]

# ============== MERCADO PAGO ROUTES ==============

CREDIT_PACKAGES = {
    "single": {"credits": 1, "amount": 9.90, "name": "1 análise"},
    "pack3": {"credits": 3, "amount": 19.90, "name": "Pacote 3 análises"},
    "pack10": {"credits": 10, "amount": 49.90, "name": "Pacote 10 análises"}
}

@api_router.post("/payments/checkout")
async def create_checkout(data: CheckoutRequest, user = Depends(get_current_user)):
    if data.package_id not in CREDIT_PACKAGES:
        raise HTTPException(status_code=400, detail="Pacote inválido")
    
    package = CREDIT_PACKAGES[data.package_id]
    final_price = float(package['amount'])
    coupon_applied = None
    
    # Apply coupon if provided
    if data.coupon_code:
        coupon = await execute_query(
            """SELECT * FROM exa_coupons 
               WHERE code = %s AND active = TRUE
               AND (expires_at IS NULL OR expires_at > NOW())
               AND (max_redemptions IS NULL OR times_redeemed < max_redemptions)""",
            (data.coupon_code,),
            fetchone=True
        )
        if coupon:
            if coupon['discount_type'] == 'percent':
                final_price = final_price * (1 - float(coupon['discount_value']) / 100)
            else:
                final_price = final_price - float(coupon['discount_value'])
            final_price = max(final_price, 0)
            coupon_applied = data.coupon_code
    
    try:
        import mercadopago
        
        sdk = mercadopago.SDK(MP_ACCESS_TOKEN)
        
        # Get user email
        user_data = await execute_query(
            "SELECT email FROM exa_users WHERE id = %s",
            (user['user_id'],),
            fetchone=True
        )
        
        preference_data = {
            "items": [{
                "title": f"{package['name']} — Exagram",
                "quantity": 1,
                "unit_price": round(final_price, 2),
                "currency_id": "BRL"
            }],
            "payer": {
                "email": user_data['email'] if user_data else user['email']
            },
            "payment_methods": {
                "installments": 3
            },
            "back_urls": {
                "success": f"{data.origin_url}/dashboard?payment=success",
                "failure": f"{data.origin_url}/dashboard?payment=failure",
                "pending": f"{data.origin_url}/dashboard?payment=pending"
            },
            "auto_return": "approved",
            "external_reference": json.dumps({
                "tenant_id": user['tenant_id'],
                "credits": package['credits'],
                "coupon_code": coupon_applied,
                "package_id": data.package_id
            }),
            "notification_url": f"{data.origin_url}/api/webhooks/mercadopago"
        }
        
        preference_response = sdk.preference().create(preference_data)
        preference = preference_response.get("response", {})
        
        if not preference.get("id"):
            logging.error(f"MP Preference error: {preference_response}")
            raise HTTPException(status_code=500, detail="Erro ao criar preferência de pagamento")
        
        # Create payment record
        await execute_query(
            """INSERT INTO exa_payment_transactions 
               (id, tenant_id, session_id, amount, currency, credits_purchased, payment_status, package_id, coupon_code, original_amount, discount_amount, created_at)
               VALUES (%s, %s, %s, %s, 'BRL', %s, 'pending', %s, %s, %s, %s, NOW())""",
            (str(uuid.uuid4()), user['tenant_id'], preference['id'], 
             final_price, package['credits'], data.package_id, coupon_applied,
             package['amount'], package['amount'] - final_price if coupon_applied else 0)
        )
        
        return {
            "url": preference.get("init_point"),
            "session_id": preference.get("id"),
            "original_price": package['amount'],
            "final_price": final_price,
            "coupon_applied": coupon_applied
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Mercado Pago checkout error: {e}")
        raise HTTPException(status_code=500, detail="Erro ao criar sessão de pagamento")

@api_router.post("/payments/validate-coupon")
async def validate_coupon(data: CouponValidate, user = Depends(get_current_user)):
    coupon = await execute_query(
        """SELECT code, discount_type, discount_value FROM exa_coupons 
           WHERE code = %s AND active = TRUE
           AND (expires_at IS NULL OR expires_at > NOW())
           AND (max_redemptions IS NULL OR times_redeemed < max_redemptions)""",
        (data.code,),
        fetchone=True
    )
    if not coupon:
        return {"valid": False, "message": "Cupom inválido ou expirado"}
    
    return {
        "valid": True,
        "discount_type": coupon['discount_type'],
        "discount_value": float(coupon['discount_value'])
    }

@api_router.get("/payments/status/{preference_id}")
async def get_payment_status(preference_id: str, user = Depends(get_current_user)):
    """Check payment status by preference ID"""
    try:
        import mercadopago
        
        sdk = mercadopago.SDK(MP_ACCESS_TOKEN)
        
        # Search for payments with this preference
        search_result = sdk.payment().search({
            "external_reference": preference_id
        })
        
        payments = search_result.get("response", {}).get("results", [])
        
        # Check transaction in our database
        transaction = await execute_query(
            "SELECT payment_status, credits_purchased, coupon_code FROM exa_payment_transactions WHERE session_id = %s AND tenant_id = %s",
            (preference_id, user['tenant_id']),
            fetchone=True
        )
        
        # Find approved payment
        for payment in payments:
            if payment.get("status") == "approved":
                if transaction and transaction['payment_status'] != 'completed':
                    # Add credits
                    credits = int(transaction['credits_purchased']) if transaction['credits_purchased'] else 0
                    await execute_query(
                        "UPDATE exa_tenants SET exam_credits = exam_credits + %s WHERE id = %s",
                        (credits, user['tenant_id'])
                    )
                    # Update transaction status
                    await execute_query(
                        "UPDATE exa_payment_transactions SET payment_status = 'completed' WHERE session_id = %s",
                        (preference_id,)
                    )
                    # Increment coupon usage if applied
                    if transaction.get('coupon_code'):
                        await execute_query(
                            "UPDATE exa_coupons SET times_redeemed = times_redeemed + 1 WHERE code = %s",
                            (transaction['coupon_code'],)
                        )
                
                return {
                    "status": "complete",
                    "payment_status": "paid",
                    "amount": payment.get("transaction_amount", 0),
                    "currency": "BRL"
                }
        
        # No approved payment found
        return {
            "status": "pending",
            "payment_status": "pending",
            "amount": 0,
            "currency": "BRL"
        }
        
    except Exception as e:
        logging.error(f"Payment status error: {e}")
        raise HTTPException(status_code=500, detail="Erro ao verificar pagamento")

@api_router.post("/webhooks/mercadopago")
async def mercadopago_webhook(request: Request):
    """Handle Mercado Pago webhook notifications (IPN)"""
    try:
        # Get query parameters (MP sends data via query params too)
        query_params = dict(request.query_params)
        topic = query_params.get("topic") or query_params.get("type")
        resource_id = query_params.get("id") or query_params.get("data.id")
        
        # Try to get body (may be empty for some notification types)
        try:
            body = await request.json()
        except:
            body = {}
        
        # Get webhook headers for validation
        x_signature = request.headers.get("x-signature", "")
        x_request_id = request.headers.get("x-request-id", "")
        
        logging.info(f"MP Webhook received: topic={topic}, id={resource_id}, body_type={body.get('type')}, body_action={body.get('action')}")
        
        # Validate HMAC signature if secret is configured
        if MP_WEBHOOK_SECRET and x_signature:
            import hmac
            import hashlib
            # MP signature format: ts=XXX,v1=YYY
            try:
                parts = dict(p.split("=") for p in x_signature.split(","))
                ts = parts.get("ts", "")
                v1 = parts.get("v1", "")
                
                # Build manifest for validation
                manifest = f"id:{resource_id};request-id:{x_request_id};ts:{ts};"
                expected_signature = hmac.new(
                    MP_WEBHOOK_SECRET.encode(),
                    manifest.encode(),
                    hashlib.sha256
                ).hexdigest()
                
                if not hmac.compare_digest(expected_signature, v1):
                    logging.warning(f"Invalid webhook signature")
                    # Continue anyway for sandbox mode
            except Exception as sig_error:
                logging.warning(f"Signature validation error: {sig_error}")
        
        # Determine payment ID from various sources
        payment_id = None
        if body.get("type") == "payment" and body.get("data", {}).get("id"):
            payment_id = body["data"]["id"]
        elif topic == "payment" and resource_id:
            payment_id = resource_id
        elif body.get("action") == "payment.created" or body.get("action") == "payment.updated":
            payment_id = body.get("data", {}).get("id")
        
        if payment_id:
            import mercadopago
            sdk = mercadopago.SDK(MP_ACCESS_TOKEN)
            
            payment_response = sdk.payment().get(payment_id)
            payment = payment_response.get("response", {})
            
            logging.info(f"MP Payment {payment_id}: status={payment.get('status')}, external_ref={payment.get('external_reference')}")
            
            if payment.get("status") == "approved":
                external_reference = payment.get("external_reference")
                preference_id = payment.get("preference_id")
                
                if external_reference:
                    try:
                        ref_data = json.loads(external_reference)
                        tenant_id = ref_data.get("tenant_id")
                        credits = ref_data.get("credits")
                        coupon_code = ref_data.get("coupon_code")
                        
                        if tenant_id and credits:
                            # Find transaction by preference_id or by tenant's latest pending
                            transaction = None
                            if preference_id:
                                transaction = await execute_query(
                                    "SELECT id, payment_status, credits_purchased FROM exa_payment_transactions WHERE session_id = %s",
                                    (preference_id,),
                                    fetchone=True
                                )
                            
                            if not transaction:
                                transaction = await execute_query(
                                    "SELECT id, payment_status, credits_purchased FROM exa_payment_transactions WHERE tenant_id = %s AND payment_status = 'pending' ORDER BY created_at DESC LIMIT 1",
                                    (tenant_id,),
                                    fetchone=True
                                )
                            
                            if transaction and transaction['payment_status'] != 'completed':
                                # Add credits
                                await execute_query(
                                    "UPDATE exa_tenants SET exam_credits = exam_credits + %s WHERE id = %s",
                                    (credits, tenant_id)
                                )
                                
                                # Update transaction with MP payment_id
                                await execute_query(
                                    "UPDATE exa_payment_transactions SET payment_status = 'completed', mp_payment_id = %s WHERE id = %s",
                                    (str(payment_id), transaction['id'])
                                )
                                
                                # Increment coupon usage
                                if coupon_code:
                                    await execute_query(
                                        "UPDATE exa_coupons SET times_redeemed = times_redeemed + 1 WHERE code = %s",
                                        (coupon_code,)
                                    )
                                
                                # Log to audit
                                await execute_query(
                                    "INSERT INTO exa_audit_log (id, event_type, affected_count, tenant_id) VALUES (%s, 'payment_completed', %s, %s)",
                                    (str(uuid.uuid4()), credits, tenant_id)
                                )
                                
                                logging.info(f"✅ Payment processed: {credits} credits added to tenant {tenant_id}")
                            else:
                                logging.info(f"Payment already processed or no pending transaction for tenant {tenant_id}")
                                
                    except json.JSONDecodeError:
                        logging.error(f"Invalid external_reference JSON: {external_reference}")
        
        return {"received": True}
        
    except Exception as e:
        logging.error(f"Webhook error: {e}", exc_info=True)
        return {"received": True, "error": str(e)}

@api_router.get("/packages")
async def get_packages():
    return {
        "packages": [
            {"id": k, **v} for k, v in CREDIT_PACKAGES.items()
        ]
    }

# ============== ADMIN COUPON ROUTES ==============

@api_router.get("/admin/coupons")
async def admin_get_coupons(admin = Depends(get_current_admin)):
    coupons = await execute_query(
        "SELECT * FROM exa_coupons ORDER BY created_at DESC",
        fetch=True
    )
    return [{
        "id": c['id'],
        "code": c['code'],
        "discount_type": c['discount_type'],
        "discount_value": float(c['discount_value']),
        "max_redemptions": c['max_redemptions'],
        "times_redeemed": c['times_redeemed'],
        "expires_at": c['expires_at'].isoformat() if c['expires_at'] else None,
        "active": bool(c['active']),
        "created_at": c['created_at'].isoformat() if c['created_at'] else None
    } for c in coupons]

@api_router.post("/admin/coupons")
async def admin_create_coupon(data: CouponCreate, admin = Depends(get_current_admin)):
    # Check if code already exists
    existing = await execute_query(
        "SELECT id FROM exa_coupons WHERE code = %s",
        (data.code.upper(),),
        fetchone=True
    )
    if existing:
        raise HTTPException(status_code=400, detail="Código de cupom já existe")
    
    coupon_id = str(uuid.uuid4())
    expires_at = None
    if data.expires_at:
        try:
            expires_at = datetime.fromisoformat(data.expires_at.replace('Z', '+00:00'))
        except:
            pass
    
    await execute_query(
        """INSERT INTO exa_coupons (id, code, discount_type, discount_value, max_redemptions, expires_at)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (coupon_id, data.code.upper(), data.discount_type, data.discount_value, 
         data.max_redemptions, expires_at)
    )
    
    return {"id": coupon_id, "code": data.code.upper()}

@api_router.patch("/admin/coupons/{coupon_id}")
async def admin_update_coupon(coupon_id: str, active: bool, admin = Depends(get_current_admin)):
    await execute_query(
        "UPDATE exa_coupons SET active = %s WHERE id = %s",
        (active, coupon_id)
    )
    return {"success": True}

@api_router.delete("/admin/coupons/{coupon_id}")
async def admin_delete_coupon(coupon_id: str, admin = Depends(get_current_admin)):
    await execute_query("DELETE FROM exa_coupons WHERE id = %s", (coupon_id,))
    return {"success": True}

# ============== LGPD DATA RIGHTS ==============

@api_router.get("/user/data")
async def export_user_data(user = Depends(get_current_user)):
    """Export all user data (LGPD access right)"""
    user_data = await execute_query(
        "SELECT id, email, created_at FROM exa_users WHERE id = %s",
        (user['user_id'],),
        fetchone=True
    )
    
    tenant_data = await execute_query(
        "SELECT id, name, plan, exam_credits, created_at FROM exa_tenants WHERE id = %s",
        (user['tenant_id'],),
        fetchone=True
    )
    
    exa_exams = await execute_query(
        "SELECT id, extracted_data, ai_analysis, summary, created_at FROM exa_exams WHERE user_id = %s",
        (user['user_id'],),
        fetch=True
    )
    
    exa_consents = await execute_query(
        "SELECT type, action, timestamp, consent_version FROM exa_consents WHERE user_id = %s",
        (user['user_id'],),
        fetch=True
    )
    
    return {
        "user": {
            "id": user_data['id'],
            "email": user_data['email'],
            "created_at": user_data['created_at'].isoformat() if user_data['created_at'] else None
        },
        "tenant": {
            "id": tenant_data['id'],
            "name": tenant_data['name'],
            "plan": tenant_data['plan'],
            "credits": tenant_data['exam_credits']
        },
        "exa_exams": [{
            "id": e['id'],
            "data": json.loads(e['extracted_data']) if e['extracted_data'] else None,
            "analysis": json.loads(e['ai_analysis']) if e['ai_analysis'] else None,
            "summary": e['summary'],
            "created_at": e['created_at'].isoformat() if e['created_at'] else None
        } for e in exa_exams],
        "exa_consents": [{
            "type": c['type'],
            "action": c['action'],
            "version": c['consent_version'],
            "timestamp": c['timestamp'].isoformat() if c['timestamp'] else None
        } for c in exa_consents],
        "exported_at": datetime.now(timezone.utc).isoformat()
    }

@api_router.delete("/user/account")
async def delete_user_account(user = Depends(get_current_user)):
    """Delete user account and all data (LGPD deletion right)"""
    user_id = user['user_id']
    tenant_id = user['tenant_id']
    
    # Log deletion
    exam_count = await execute_query(
        "SELECT COUNT(*) as count FROM exa_exams WHERE user_id = %s",
        (user_id,),
        fetchone=True
    )
    
    await execute_query(
        "INSERT INTO exa_audit_log (id, event_type, affected_count, tenant_id) VALUES (%s, 'user_deletion', %s, %s)",
        (str(uuid.uuid4()), exam_count['count'], tenant_id)
    )
    
    # Delete in order to respect foreign key constraints
    # 1. Delete chat messages (references exam_id)
    await execute_query("DELETE FROM exa_chat_messages WHERE user_id = %s", (user_id,))
    # 2. Delete exams (references user_id and tenant_id)
    await execute_query("DELETE FROM exa_exams WHERE user_id = %s", (user_id,))
    # 3. Delete consents (references user_id)
    await execute_query("DELETE FROM exa_consents WHERE user_id = %s", (user_id,))
    # 4. Delete users (references tenant_id)
    await execute_query("DELETE FROM exa_users WHERE id = %s", (user_id,))
    # 5. Delete usage tracking
    await execute_query("DELETE FROM exa_usage_tracking WHERE tenant_id = %s", (tenant_id,))
    # 6. Delete payment transactions
    await execute_query("DELETE FROM exa_payment_transactions WHERE tenant_id = %s", (tenant_id,))
    # 7. Finally delete tenant
    await execute_query("DELETE FROM exa_tenants WHERE id = %s", (tenant_id,))
    
    return {"success": True, "message": "Conta e todos os dados foram excluídos permanentemente"}

# ============== BASIC ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "Exagram API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
