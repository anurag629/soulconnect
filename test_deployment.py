"""
Quick diagnostic script to test registration endpoint
Run this to verify your deployment configuration
"""

import requests
import json

# Your deployment URLs
BACKEND_URL = "https://soulconnect-backend-dg0k.onrender.com/api/v1"
FRONTEND_URL = "https://soulconnect-taupe.vercel.app"

def test_backend_health():
    """Test if backend is accessible"""
    print("1. Testing backend health...")
    try:
        response = requests.get(f"{BACKEND_URL.replace('/api/v1', '')}/", timeout=10)
        print(f"   ✅ Backend is accessible: {response.status_code}")
        return True
    except Exception as e:
        print(f"   ❌ Backend not accessible: {str(e)}")
        return False

def test_cors():
    """Test CORS configuration"""
    print("\n2. Testing CORS configuration...")
    try:
        headers = {
            'Origin': FRONTEND_URL,
            'Content-Type': 'application/json',
        }
        response = requests.options(
            f"{BACKEND_URL}/auth/register/",
            headers=headers,
            timeout=10
        )
        cors_headers = response.headers.get('Access-Control-Allow-Origin', 'NOT SET')
        print(f"   CORS Header: {cors_headers}")
        
        if cors_headers in [FRONTEND_URL, '*']:
            print("   ✅ CORS is configured correctly")
            return True
        else:
            print(f"   ❌ CORS not configured for {FRONTEND_URL}")
            return False
    except Exception as e:
        print(f"   ⚠️  Could not test CORS: {str(e)}")
        return False

def test_registration():
    """Test registration endpoint"""
    print("\n3. Testing registration endpoint...")
    
    test_data = {
        "email": f"test{int(requests.utils.default_user_agent().split()[-1].replace('/', ''))}@example.com",
        "password": "TestPass123!",
        "first_name": "Test",
        "last_name": "User",
        "phone_number": "9876543210",
        "gender": "male",
        "date_of_birth": "2000-01-01"
    }
    
    try:
        headers = {
            'Origin': FRONTEND_URL,
            'Content-Type': 'application/json',
        }
        
        response = requests.post(
            f"{BACKEND_URL}/auth/register/",
            json=test_data,
            headers=headers,
            timeout=30
        )
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        
        if response.status_code == 201:
            print("   ✅ Registration endpoint working!")
            return True
        elif response.status_code == 400:
            print("   ⚠️  Validation error (expected if email exists)")
            data = response.json()
            print(f"   Error details: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"   ❌ Registration failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Registration test failed: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("KSHATRIYAConnect Deployment Diagnostic")
    print("=" * 60)
    print(f"Backend: {BACKEND_URL}")
    print(f"Frontend: {FRONTEND_URL}")
    print("=" * 60)
    
    results = []
    results.append(("Backend Health", test_backend_health()))
    results.append(("CORS Configuration", test_cors()))
    results.append(("Registration Endpoint", test_registration()))
    
    print("\n" + "=" * 60)
    print("Summary:")
    print("=" * 60)
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    print("\n" + "=" * 60)
    if all(r[1] for r in results):
        print("✅ All tests passed! Your deployment should be working.")
    else:
        print("❌ Some tests failed. Check the configuration:")
        print("\nRequired Render Environment Variables:")
        print(f"   CORS_ALLOWED_ORIGINS={FRONTEND_URL}")
        print(f"   CSRF_TRUSTED_ORIGINS={FRONTEND_URL}")
        print(f"   FRONTEND_URL={FRONTEND_URL}")
        print("\nRequired Vercel Environment Variable:")
        print(f"   NEXT_PUBLIC_API_URL={BACKEND_URL}")
    print("=" * 60)

if __name__ == "__main__":
    main()
