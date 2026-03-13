"""
Exagram API Tests - Blood Count Exam Analysis SaaS
Tests for user registration, login, LGPD consent, admin functionality, and specialists
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://exagram-blood.preview.emergentagent.com')

# Test credentials
TEST_USER_EMAIL = f"test_user_{uuid.uuid4().hex[:8]}@exagram.com"
TEST_USER_PASSWORD = "Test123456!"
TEST_USER_NAME = "Test User"

ADMIN_EMAIL = "admin@exagram.com.br"
ADMIN_PASSWORD = "Exagram@Admin2024"

# Store tokens for authenticated tests
user_token = None
admin_token = None
user_id = None
tenant_id = None
created_specialist_id = None


class TestHealthAndBasicEndpoints:
    """Test basic API health and public endpoints"""
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✅ Health check passed: {data}")
    
    def test_root_endpoint(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Exagram" in data["message"]
        print(f"✅ Root endpoint passed: {data}")
    
    def test_packages_endpoint(self):
        """Test credit packages endpoint"""
        response = requests.get(f"{BASE_URL}/api/packages")
        assert response.status_code == 200
        data = response.json()
        assert "packages" in data
        assert len(data["packages"]) > 0
        # Verify package structure
        for pkg in data["packages"]:
            assert "id" in pkg
            assert "credits" in pkg
            assert "amount" in pkg
        print(f"✅ Packages endpoint passed: {len(data['packages'])} packages available")
    
    def test_consent_config_endpoint(self):
        """Test LGPD consent config endpoint"""
        response = requests.get(f"{BASE_URL}/api/consent/config")
        assert response.status_code == 200
        data = response.json()
        assert "dpo_name" in data
        assert "dpo_email" in data
        assert "consent_version" in data
        assert "retention_days" in data
        print(f"✅ Consent config passed: DPO={data['dpo_name']}, Version={data['consent_version']}")


class TestUserRegistration:
    """Test user registration flow - creates user with 1 free credit"""
    
    def test_user_registration(self):
        """Test new user registration"""
        global user_token, user_id, tenant_id
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "name": TEST_USER_NAME
        })
        
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_USER_EMAIL
        assert data["user"]["name"] == TEST_USER_NAME
        assert "tenant_id" in data["user"]
        assert data["user"]["consent_granted"] == False
        
        user_token = data["token"]
        user_id = data["user"]["id"]
        tenant_id = data["user"]["tenant_id"]
        
        print(f"✅ User registration passed: {TEST_USER_EMAIL}")
        print(f"   User ID: {user_id}")
        print(f"   Tenant ID: {tenant_id}")
    
    def test_duplicate_registration_fails(self):
        """Test that duplicate email registration fails"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "name": TEST_USER_NAME
        })
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✅ Duplicate registration correctly rejected: {data['detail']}")


class TestUserLogin:
    """Test user login flow"""
    
    def test_user_login_success(self):
        """Test successful user login"""
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
        assert "plan" in data["user"]
        
        user_token = data["token"]
        print(f"✅ User login passed: {TEST_USER_EMAIL}")
        print(f"   Credits: {data['user']['exam_credits']}, Plan: {data['user']['plan']}")
    
    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✅ Invalid login correctly rejected: {data['detail']}")
    
    def test_user_login_nonexistent_user(self):
        """Test login with non-existent user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@exagram.com",
            "password": "anypassword"
        })
        
        assert response.status_code == 401
        print("✅ Non-existent user login correctly rejected")


class TestLGPDConsent:
    """Test LGPD consent grant flow (terms, privacy, sensitive_data)"""
    
    def test_grant_terms_consent(self):
        """Test granting terms consent"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.post(f"{BASE_URL}/api/consent/grant", 
            json={"type": "terms"},
            headers=headers
        )
        
        assert response.status_code == 200, f"Terms consent failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["type"] == "terms"
        print("✅ Terms consent granted")
    
    def test_grant_privacy_consent(self):
        """Test granting privacy consent"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.post(f"{BASE_URL}/api/consent/grant", 
            json={"type": "privacy"},
            headers=headers
        )
        
        assert response.status_code == 200, f"Privacy consent failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["type"] == "privacy"
        print("✅ Privacy consent granted")
    
    def test_grant_sensitive_data_consent(self):
        """Test granting sensitive data consent"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.post(f"{BASE_URL}/api/consent/grant", 
            json={"type": "sensitive_data"},
            headers=headers
        )
        
        assert response.status_code == 200, f"Sensitive data consent failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert data["type"] == "sensitive_data"
        print("✅ Sensitive data consent granted")
    
    def test_consent_status_all_granted(self):
        """Test that all consents are now granted"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.get(f"{BASE_URL}/api/consent/status", headers=headers)
        
        assert response.status_code == 200, f"Consent status failed: {response.text}"
        data = response.json()
        assert data["all_granted"] == True
        assert "consent_version" in data
        print(f"✅ All consents verified: {data}")


class TestAuthenticatedUserEndpoints:
    """Test authenticated user endpoints"""
    
    def test_get_current_user(self):
        """Test getting current user info"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        
        assert response.status_code == 200, f"Get user failed: {response.text}"
        data = response.json()
        assert data["email"] == TEST_USER_EMAIL
        assert "exam_credits" in data
        assert data["consent_granted"] == True
        print(f"✅ Get current user passed: {data['email']}, Credits: {data['exam_credits']}")
    
    def test_get_exams_list(self):
        """Test getting user's exams list"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.get(f"{BASE_URL}/api/exams", headers=headers)
        
        assert response.status_code == 200, f"Get exams failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Get exams list passed: {len(data)} exams found")
    
    def test_export_user_data_lgpd(self):
        """Test LGPD data export endpoint"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.get(f"{BASE_URL}/api/user/data", headers=headers)
        
        assert response.status_code == 200, f"Export data failed: {response.text}"
        data = response.json()
        assert "user" in data
        assert "tenant" in data
        assert "exa_exams" in data
        assert "exa_consents" in data
        assert "exported_at" in data
        print(f"✅ LGPD data export passed: User data exported at {data['exported_at']}")


class TestSpecialistsPublicEndpoint:
    """Test specialists public endpoint"""
    
    def test_get_specialists_list(self):
        """Test getting specialists list"""
        response = requests.get(f"{BASE_URL}/api/specialists")
        
        assert response.status_code == 200, f"Get specialists failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Get specialists list passed: {len(data)} specialists found")
    
    def test_get_specialists_with_filters(self):
        """Test getting specialists with filters"""
        response = requests.get(f"{BASE_URL}/api/specialists?specialty=Hematologista&state=SP")
        
        assert response.status_code == 200, f"Get filtered specialists failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Get filtered specialists passed: {len(data)} specialists found")


class TestAdminLogin:
    """Test admin login flow"""
    
    def test_admin_login_success(self):
        """Test successful admin login"""
        global admin_token
        
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        
        assert "token" in data
        assert "admin" in data
        assert data["admin"]["email"] == ADMIN_EMAIL
        
        admin_token = data["token"]
        print(f"✅ Admin login passed: {ADMIN_EMAIL}")
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        print("✅ Invalid admin login correctly rejected")


class TestAdminDashboard:
    """Test admin dashboard endpoints"""
    
    def test_admin_overview(self):
        """Test admin overview statistics"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.get(f"{BASE_URL}/api/admin/overview", headers=headers)
        
        assert response.status_code == 200, f"Admin overview failed: {response.text}"
        data = response.json()
        assert "total_exa_tenants" in data
        assert "active_subscriptions" in data
        assert "exa_exams_this_month" in data
        print(f"✅ Admin overview passed: {data['total_exa_tenants']} tenants, {data['active_subscriptions']} active subs")
    
    def test_admin_get_tenants(self):
        """Test admin get tenants list"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.get(f"{BASE_URL}/api/admin/tenants", headers=headers)
        
        assert response.status_code == 200, f"Admin get tenants failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        
        # Verify our test user is in the list
        test_tenant = next((t for t in data if t.get("user_email") == TEST_USER_EMAIL), None)
        assert test_tenant is not None, "Test user tenant not found in admin list"
        print(f"✅ Admin get tenants passed: {len(data)} tenants, test user found")
    
    def test_admin_get_audit_log(self):
        """Test admin audit log endpoint"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.get(f"{BASE_URL}/api/admin/audit-log", headers=headers)
        
        assert response.status_code == 200, f"Admin audit log failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Admin audit log passed: {len(data)} log entries")


class TestAdminSpecialistsCRUD:
    """Test admin specialists CRUD operations"""
    
    def test_admin_create_specialist(self):
        """Test creating a new specialist"""
        global created_specialist_id
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        specialist_data = {
            "name": f"Dr. Test Specialist {uuid.uuid4().hex[:6]}",
            "specialty": "Hematologista",
            "type": "medico",
            "city": "São Paulo",
            "state": "SP",
            "phone": "(11) 99999-9999",
            "email": f"test_specialist_{uuid.uuid4().hex[:6]}@test.com",
            "description": "Test specialist for automated testing"
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/specialists", 
            json=specialist_data,
            headers=headers
        )
        
        assert response.status_code == 200, f"Create specialist failed: {response.text}"
        data = response.json()
        assert "id" in data
        created_specialist_id = data["id"]
        print(f"✅ Admin create specialist passed: ID={created_specialist_id}")
    
    def test_admin_update_specialist(self):
        """Test updating a specialist"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        update_data = {
            "description": "Updated description for testing",
            "phone": "(11) 88888-8888"
        }
        
        response = requests.patch(f"{BASE_URL}/api/admin/specialists/{created_specialist_id}", 
            json=update_data,
            headers=headers
        )
        
        assert response.status_code == 200, f"Update specialist failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        print(f"✅ Admin update specialist passed")
    
    def test_admin_delete_specialist(self):
        """Test deleting a specialist"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.delete(f"{BASE_URL}/api/admin/specialists/{created_specialist_id}", 
            headers=headers
        )
        
        assert response.status_code == 200, f"Delete specialist failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        print(f"✅ Admin delete specialist passed")


class TestAdminTenantsCRUD:
    """Test admin tenants CRUD operations"""
    
    def test_admin_create_tenant(self):
        """Test creating a new tenant via admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        new_tenant_email = f"admin_created_{uuid.uuid4().hex[:8]}@exagram.com"
        tenant_data = {
            "name": "Admin Created Tenant",
            "email": new_tenant_email,
            "password": "AdminCreated123!"
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/tenants", 
            json=tenant_data,
            headers=headers
        )
        
        assert response.status_code == 200, f"Create tenant failed: {response.text}"
        data = response.json()
        assert "tenant_id" in data
        assert "user_id" in data
        assert data["email"] == new_tenant_email
        
        # Store for cleanup
        TestAdminTenantsCRUD.created_tenant_id = data["tenant_id"]
        print(f"✅ Admin create tenant passed: {new_tenant_email}")
    
    def test_admin_toggle_tenant_active(self):
        """Test toggling tenant active status"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Deactivate
        response = requests.patch(f"{BASE_URL}/api/admin/tenants/{TestAdminTenantsCRUD.created_tenant_id}?active=false", 
            headers=headers
        )
        
        assert response.status_code == 200, f"Toggle tenant failed: {response.text}"
        print(f"✅ Admin toggle tenant active passed")
    
    def test_admin_delete_tenant(self):
        """Test deleting a tenant"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.delete(f"{BASE_URL}/api/admin/tenants/{TestAdminTenantsCRUD.created_tenant_id}", 
            headers=headers
        )
        
        assert response.status_code == 200, f"Delete tenant failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        print(f"✅ Admin delete tenant passed")


class TestUnauthorizedAccess:
    """Test that unauthorized access is properly rejected"""
    
    def test_user_endpoints_without_token(self):
        """Test user endpoints without authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✅ User endpoint without token correctly rejected")
    
    def test_admin_endpoints_without_token(self):
        """Test admin endpoints without authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/overview")
        assert response.status_code == 401
        print("✅ Admin endpoint without token correctly rejected")
    
    def test_admin_endpoints_with_user_token(self):
        """Test admin endpoints with user token (should be rejected)"""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/overview", headers=headers)
        assert response.status_code == 403
        print("✅ Admin endpoint with user token correctly rejected")


class TestCleanup:
    """Cleanup test data"""
    
    def test_delete_test_user(self):
        """Delete test user account (LGPD deletion)"""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.delete(f"{BASE_URL}/api/user/account", headers=headers)
        
        assert response.status_code == 200, f"Delete user failed: {response.text}"
        data = response.json()
        assert data["success"] == True
        print(f"✅ Test user deleted: {TEST_USER_EMAIL}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
