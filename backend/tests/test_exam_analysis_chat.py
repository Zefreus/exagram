"""
Exagram API Tests - Exam Analysis, Chat, and Webhook Features
Tests for:
- Mercado Pago webhook endpoint
- Exam upload with AI extraction (Gemini) and analysis (Claude)
- Exam results page with values table and flags
- Chat with exam context
- User credits deduction after exam upload
- Admin coupon CRUD (regression)
"""
import pytest
import requests
import os
import uuid
import time
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://hemograma-ai.preview.emergentagent.com')

# Test credentials - existing user with exam
TEST_USER_EMAIL = "final_test_1773422756@exagram.com"
TEST_USER_PASSWORD = "Test123!"
TEST_EXAM_ID = "8c8e4271-eaf3-40a3-84d5-d2aae69d9711"

# Admin credentials
ADMIN_EMAIL = "admin@exagram.com.br"
ADMIN_PASSWORD = "Exagram@Admin2024"

# Store tokens
user_token = None
admin_token = None


class TestHealthAndBasicEndpoints:
    """Test basic API health"""
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✅ Health check passed")


class TestUserLoginWithExam:
    """Test login with existing user that has an exam"""
    
    def test_user_login(self):
        """Test login with test user"""
        global user_token
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        assert "exam_credits" in data["user"]
        
        user_token = data["token"]
        print(f"✅ User login passed: {TEST_USER_EMAIL}, Credits: {data['user']['exam_credits']}")


class TestExamResultsEndpoint:
    """Test exam results endpoint - values table and flags"""
    
    def test_get_exam_details(self):
        """Test getting exam details with extracted data and flags"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.get(f"{BASE_URL}/api/exams/{TEST_EXAM_ID}", headers=headers)
        
        assert response.status_code == 200, f"Get exam failed: {response.text}"
        data = response.json()
        
        # Verify exam structure
        assert "id" in data
        assert data["id"] == TEST_EXAM_ID
        assert "extracted_data" in data
        assert "flags" in data
        assert "summary" in data
        assert "messages" in data
        
        print(f"✅ Get exam details passed: ID={data['id']}")
    
    def test_exam_has_extracted_values(self):
        """Test that exam has extracted hemogram values"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.get(f"{BASE_URL}/api/exams/{TEST_EXAM_ID}", headers=headers)
        data = response.json()
        
        extracted_data = data.get("extracted_data", {})
        valores = extracted_data.get("valores", {})
        
        # Verify we have hemogram parameters
        assert len(valores) > 0, "No values extracted from exam"
        
        # Check for expected hemogram parameters
        expected_params = ["hemoglobina", "hematocrito", "eritrocitos", "leucocitos", "plaquetas"]
        found_params = [p for p in expected_params if p in valores]
        
        assert len(found_params) >= 3, f"Expected at least 3 hemogram params, found: {found_params}"
        
        # Verify value structure
        for param in found_params:
            value_data = valores[param]
            assert "valor" in value_data, f"Missing 'valor' in {param}"
            assert "unidade" in value_data, f"Missing 'unidade' in {param}"
            
        print(f"✅ Extracted values test passed: {len(valores)} parameters found")
        print(f"   Found params: {list(valores.keys())}")
    
    def test_exam_has_flags(self):
        """Test that exam has flags for each value (normal/borderline/attention)"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.get(f"{BASE_URL}/api/exams/{TEST_EXAM_ID}", headers=headers)
        data = response.json()
        
        flags = data.get("flags", {})
        
        assert len(flags) > 0, "No flags found in exam"
        
        # Verify flag values are valid
        valid_flags = ["normal", "borderline", "attention"]
        for param, flag in flags.items():
            assert flag in valid_flags, f"Invalid flag '{flag}' for {param}"
        
        print(f"✅ Flags test passed: {len(flags)} flags found")
        
        # Count flag distribution
        flag_counts = {}
        for flag in flags.values():
            flag_counts[flag] = flag_counts.get(flag, 0) + 1
        print(f"   Flag distribution: {flag_counts}")
    
    def test_exam_has_summary(self):
        """Test that exam has AI-generated summary"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.get(f"{BASE_URL}/api/exams/{TEST_EXAM_ID}", headers=headers)
        data = response.json()
        
        summary = data.get("summary", "")
        
        assert summary, "No summary found in exam"
        assert len(summary) > 50, f"Summary too short: {len(summary)} chars"
        
        print(f"✅ Summary test passed: {len(summary)} chars")
        print(f"   Preview: {summary[:100]}...")
    
    def test_exam_not_found(self):
        """Test getting non-existent exam returns 404"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        fake_exam_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/exams/{fake_exam_id}", headers=headers)
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✅ Non-existent exam correctly returns 404")


class TestChatWithExamContext:
    """Test chat functionality with exam context"""
    
    def test_chat_endpoint_exists(self):
        """Test that chat endpoint exists and accepts messages"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.post(
            f"{BASE_URL}/api/exams/{TEST_EXAM_ID}/chat",
            json={"content": "Teste de conexão"},
            headers=headers
        )
        
        assert response.status_code == 200, f"Chat endpoint failed: {response.text}"
        data = response.json()
        
        assert "user_message" in data
        assert "ai_response" in data
        
        print("✅ Chat endpoint exists and responds")
    
    def test_chat_returns_contextual_response(self):
        """Test that chat returns response with exam context"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        # Ask about a specific value
        response = requests.post(
            f"{BASE_URL}/api/exams/{TEST_EXAM_ID}/chat",
            json={"content": "Minha hemoglobina está normal?"},
            headers=headers
        )
        
        assert response.status_code == 200, f"Chat failed: {response.text}"
        data = response.json()
        
        ai_response = data.get("ai_response", {}).get("content", "")
        
        # Verify response mentions hemoglobin or blood-related terms
        assert ai_response, "No AI response received"
        assert len(ai_response) > 20, "AI response too short"
        
        # Check for contextual keywords (Portuguese)
        contextual_keywords = ["hemoglobina", "normal", "valor", "g/dL", "sangue", "resultado"]
        found_keywords = [kw for kw in contextual_keywords if kw.lower() in ai_response.lower()]
        
        assert len(found_keywords) >= 1, f"Response lacks context. Keywords found: {found_keywords}"
        
        print(f"✅ Chat contextual response test passed")
        print(f"   Response preview: {ai_response[:150]}...")
    
    def test_chat_messages_are_saved(self):
        """Test that chat messages are persisted"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        # Get exam to check messages
        response = requests.get(f"{BASE_URL}/api/exams/{TEST_EXAM_ID}", headers=headers)
        data = response.json()
        
        messages = data.get("messages", [])
        
        assert len(messages) > 0, "No messages found in exam"
        
        # Verify message structure
        for msg in messages:
            assert "role" in msg
            assert "content" in msg
            assert msg["role"] in ["user", "assistant"]
        
        print(f"✅ Chat messages persistence test passed: {len(messages)} messages")
    
    def test_chat_without_auth_fails(self):
        """Test that chat without authentication fails"""
        response = requests.post(
            f"{BASE_URL}/api/exams/{TEST_EXAM_ID}/chat",
            json={"content": "Test"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Chat without auth correctly rejected")


class TestMercadoPagoWebhook:
    """Test Mercado Pago webhook endpoint"""
    
    def test_webhook_accepts_post(self):
        """Test webhook endpoint accepts POST requests"""
        response = requests.post(
            f"{BASE_URL}/api/webhooks/mercadopago",
            json={"type": "payment", "data": {"id": "test123"}}
        )
        
        assert response.status_code == 200, f"Webhook failed: {response.text}"
        data = response.json()
        
        assert "received" in data
        assert data["received"] == True
        
        print("✅ Webhook accepts POST requests")
    
    def test_webhook_accepts_query_params(self):
        """Test webhook accepts query parameters (MP IPN format)"""
        response = requests.post(
            f"{BASE_URL}/api/webhooks/mercadopago?topic=payment&id=12345"
        )
        
        assert response.status_code == 200, f"Webhook with query params failed: {response.text}"
        data = response.json()
        
        assert data["received"] == True
        
        print("✅ Webhook accepts query parameters")
    
    def test_webhook_handles_empty_body(self):
        """Test webhook handles empty body gracefully"""
        response = requests.post(
            f"{BASE_URL}/api/webhooks/mercadopago",
            headers={"Content-Type": "application/json"}
        )
        
        # Should not crash, may return 200 or 422
        assert response.status_code in [200, 422], f"Unexpected status: {response.status_code}"
        
        print(f"✅ Webhook handles empty body: status {response.status_code}")
    
    def test_webhook_handles_payment_notification(self):
        """Test webhook handles payment notification format"""
        # Simulate MP payment notification
        response = requests.post(
            f"{BASE_URL}/api/webhooks/mercadopago",
            json={
                "action": "payment.created",
                "api_version": "v1",
                "data": {"id": "999999999"},
                "date_created": "2026-03-13T10:00:00.000-03:00",
                "id": 12345,
                "live_mode": False,
                "type": "payment",
                "user_id": "123456789"
            }
        )
        
        assert response.status_code == 200, f"Webhook payment notification failed: {response.text}"
        data = response.json()
        
        assert data["received"] == True
        
        print("✅ Webhook handles payment notification format")


class TestAdminLogin:
    """Test admin login for coupon management"""
    
    def test_admin_login(self):
        """Test admin login"""
        global admin_token
        
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        
        assert "token" in data
        admin_token = data["token"]
        
        print(f"✅ Admin login passed")


class TestAdminCouponCRUD:
    """Test admin coupon CRUD operations (regression)"""
    
    created_coupon_id = None
    
    def test_admin_list_coupons(self):
        """Test listing all coupons"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.get(f"{BASE_URL}/api/admin/coupons", headers=headers)
        
        assert response.status_code == 200, f"List coupons failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        
        print(f"✅ List coupons passed: {len(data)} coupons")
    
    def test_admin_create_coupon(self):
        """Test creating a new coupon"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        coupon_code = f"TEST{uuid.uuid4().hex[:6].upper()}"
        
        response = requests.post(f"{BASE_URL}/api/admin/coupons",
            json={
                "code": coupon_code,
                "discount_type": "percent",
                "discount_value": 20.0,
                "max_redemptions": 50
            },
            headers=headers
        )
        
        assert response.status_code == 200, f"Create coupon failed: {response.text}"
        data = response.json()
        
        assert "id" in data
        TestAdminCouponCRUD.created_coupon_id = data["id"]
        
        print(f"✅ Create coupon passed: {coupon_code}")
    
    def test_admin_toggle_coupon(self):
        """Test toggling coupon active status"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Deactivate
        response = requests.patch(
            f"{BASE_URL}/api/admin/coupons/{TestAdminCouponCRUD.created_coupon_id}?active=false",
            headers=headers
        )
        
        assert response.status_code == 200, f"Toggle coupon failed: {response.text}"
        
        print("✅ Toggle coupon passed")
    
    def test_admin_delete_coupon(self):
        """Test deleting a coupon"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.delete(
            f"{BASE_URL}/api/admin/coupons/{TestAdminCouponCRUD.created_coupon_id}",
            headers=headers
        )
        
        assert response.status_code == 200, f"Delete coupon failed: {response.text}"
        
        print("✅ Delete coupon passed")


class TestExamsList:
    """Test exams list endpoint"""
    
    def test_get_user_exams_list(self):
        """Test getting user's exams list"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.get(f"{BASE_URL}/api/exams", headers=headers)
        
        assert response.status_code == 200, f"Get exams list failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        
        # Verify our test exam is in the list
        exam_ids = [e["id"] for e in data]
        assert TEST_EXAM_ID in exam_ids, f"Test exam not found in list"
        
        print(f"✅ Exams list passed: {len(data)} exams, test exam found")


class TestCreditPackages:
    """Test credit packages endpoint"""
    
    def test_get_packages(self):
        """Test getting available credit packages"""
        response = requests.get(f"{BASE_URL}/api/packages")
        
        assert response.status_code == 200, f"Packages failed: {response.text}"
        data = response.json()
        
        assert "packages" in data
        assert len(data["packages"]) == 3
        
        # Verify package IDs
        package_ids = [p["id"] for p in data["packages"]]
        assert "single" in package_ids
        assert "pack3" in package_ids
        assert "pack10" in package_ids
        
        print(f"✅ Packages endpoint passed: {len(data['packages'])} packages")


class TestCouponValidation:
    """Test coupon validation endpoint"""
    
    def test_validate_teste10_coupon(self):
        """Test validating TESTE10 coupon"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.post(f"{BASE_URL}/api/payments/validate-coupon",
            json={"code": "TESTE10"},
            headers=headers
        )
        
        assert response.status_code == 200, f"Coupon validation failed: {response.text}"
        data = response.json()
        
        assert data["valid"] == True
        assert data["discount_type"] == "percent"
        assert data["discount_value"] == 10.0
        
        print(f"✅ TESTE10 coupon validation passed: {data['discount_value']}% discount")
    
    def test_validate_invalid_coupon(self):
        """Test validating invalid coupon"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.post(f"{BASE_URL}/api/payments/validate-coupon",
            json={"code": "INVALIDCODE123"},
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["valid"] == False
        
        print("✅ Invalid coupon correctly rejected")


class TestCheckoutCreation:
    """Test Mercado Pago checkout creation"""
    
    def test_create_checkout_without_coupon(self):
        """Test creating checkout without coupon"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.post(f"{BASE_URL}/api/payments/checkout",
            json={
                "package_id": "single",
                "origin_url": "https://hemograma-ai.preview.emergentagent.com"
            },
            headers=headers
        )
        
        assert response.status_code == 200, f"Checkout failed: {response.text}"
        data = response.json()
        
        assert "url" in data
        assert "session_id" in data
        assert data["original_price"] == 9.9
        assert data["final_price"] == 9.9
        
        print(f"✅ Checkout without coupon passed: R$ {data['final_price']}")
    
    def test_create_checkout_with_coupon(self):
        """Test creating checkout with TESTE10 coupon"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.post(f"{BASE_URL}/api/payments/checkout",
            json={
                "package_id": "pack3",
                "origin_url": "https://hemograma-ai.preview.emergentagent.com",
                "coupon_code": "TESTE10"
            },
            headers=headers
        )
        
        assert response.status_code == 200, f"Checkout with coupon failed: {response.text}"
        data = response.json()
        
        assert data["original_price"] == 19.9
        expected_final = 19.9 * 0.9  # 10% discount
        assert abs(data["final_price"] - expected_final) < 0.01
        assert data["coupon_applied"] == "TESTE10"
        
        print(f"✅ Checkout with coupon passed: R$ {data['original_price']} -> R$ {data['final_price']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
