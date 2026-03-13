#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class ExagramAPITester:
    def __init__(self, base_url="https://exam-analyzer-17.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append(f"{name}: {details}")

    def test_api_endpoint(self, method, endpoint, expected_status, data=None, headers=None, description=""):
        """Generic API test method"""
        url = f"{self.base_url}/api{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)
            
            success = response.status_code == expected_status
            details = f"Expected {expected_status}, got {response.status_code}"
            if not success and response.text:
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', response.text[:100])}"
                except:
                    details += f" - {response.text[:100]}"
            
            self.log_test(f"{method} {endpoint} {description}", success, details)
            return success, response.json() if success and response.text else {}
            
        except Exception as e:
            self.log_test(f"{method} {endpoint} {description}", False, f"Exception: {str(e)}")
            return False, {}

    def test_basic_endpoints(self):
        """Test basic API endpoints"""
        print("\n🔍 Testing Basic API Endpoints...")
        
        # Test root API endpoint
        self.test_api_endpoint('GET', '/', 200, description="(Root API)")
        
        # Test health endpoint
        self.test_api_endpoint('GET', '/health', 200, description="(Health Check)")
        
        # Test packages endpoint
        self.test_api_endpoint('GET', '/packages', 200, description="(Credit Packages)")
        
        # Test specialists endpoint
        self.test_api_endpoint('GET', '/specialists', 200, description="(Specialists List)")

    def test_admin_login(self):
        """Test admin login functionality"""
        print("\n🔍 Testing Admin Authentication...")
        
        admin_data = {
            "email": "admin@exagram.com.br",
            "password": "Exagram@Admin2024"
        }
        
        success, response = self.test_api_endpoint(
            'POST', '/admin/login', 200, 
            data=admin_data, 
            description="(Admin Login)"
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            return True
        else:
            print("   ❌ Failed to get admin token")
            return False

    def test_admin_endpoints(self):
        """Test admin-protected endpoints"""
        if not self.admin_token:
            print("\n⚠️  Skipping admin endpoints - no admin token")
            return
            
        print("\n🔍 Testing Admin Endpoints...")
        
        admin_headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Test admin overview
        self.test_api_endpoint(
            'GET', '/admin/overview', 200,
            headers=admin_headers,
            description="(Admin Overview)"
        )
        
        # Test admin tenants list
        self.test_api_endpoint(
            'GET', '/admin/tenants', 200,
            headers=admin_headers,
            description="(Admin Tenants List)"
        )
        
        # Test admin audit log
        self.test_api_endpoint(
            'GET', '/admin/audit-log', 200,
            headers=admin_headers,
            description="(Admin Audit Log)"
        )

    def test_user_registration_flow(self):
        """Test user registration and login flow"""
        print("\n🔍 Testing User Registration Flow...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        # Test user registration
        success, response = self.test_api_endpoint(
            'POST', '/auth/register', 200,
            data=test_user,
            description="(User Registration)"
        )
        
        if success and 'token' in response:
            self.user_token = response['token']
            print(f"   User token obtained: {self.user_token[:20]}...")
            
            # Test user login
            login_data = {
                "email": test_user["email"],
                "password": test_user["password"]
            }
            
            self.test_api_endpoint(
                'POST', '/auth/login', 200,
                data=login_data,
                description="(User Login)"
            )
            
            return True
        else:
            print("   ❌ Failed to register user")
            return False

    def test_user_endpoints(self):
        """Test user-protected endpoints"""
        if not self.user_token:
            print("\n⚠️  Skipping user endpoints - no user token")
            return
            
        print("\n🔍 Testing User Endpoints...")
        
        user_headers = {'Authorization': f'Bearer {self.user_token}'}
        
        # Test get user profile
        self.test_api_endpoint(
            'GET', '/auth/me', 200,
            headers=user_headers,
            description="(User Profile)"
        )
        
        # Test consent config
        self.test_api_endpoint(
            'GET', '/consent/config', 200,
            description="(Consent Config)"
        )
        
        # Test consent status
        self.test_api_endpoint(
            'GET', '/consent/status', 200,
            headers=user_headers,
            description="(Consent Status)"
        )

    def test_consent_flow(self):
        """Test LGPD consent flow"""
        if not self.user_token:
            print("\n⚠️  Skipping consent flow - no user token")
            return
            
        print("\n🔍 Testing LGPD Consent Flow...")
        
        user_headers = {'Authorization': f'Bearer {self.user_token}'}
        
        # Test granting different types of consent
        consent_types = ['terms', 'privacy', 'sensitive_data']
        
        for consent_type in consent_types:
            consent_data = {
                "type": consent_type,
                "ip_address": "127.0.0.1",
                "user_agent": "Test Agent"
            }
            
            self.test_api_endpoint(
                'POST', '/consent/grant', 200,
                data=consent_data,
                headers=user_headers,
                description=f"(Grant {consent_type} consent)"
            )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Exagram API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic endpoint tests
        self.test_basic_endpoints()
        
        # Admin authentication and endpoints
        if self.test_admin_login():
            self.test_admin_endpoints()
        
        # User registration and authentication
        if self.test_user_registration_flow():
            self.test_user_endpoints()
            self.test_consent_flow()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"   • {failure}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\n✨ Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ExagramAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())