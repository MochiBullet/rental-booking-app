import requests
import json
import time

# APIエンドポイント
API_ENDPOINT = "https://ub3o5hhdz5.execute-api.ap-southeast-2.amazonaws.com/prod"

def test_password_reset_flow():
    """パスワードリセット機能の完全テスト"""
    print("=" * 60)
    print("Password Reset API Test")
    print("=" * 60)
    
    # 1. まずテストユーザーを作成
    print("\n=== Step 1: Creating Test User ===")
    user_data = {
        "email": f"resettest{int(time.time())}@example.com",
        "password": "OriginalPassword123!",
        "profile": {
            "firstName": "Reset",
            "lastName": "Test"
        }
    }
    
    response = requests.post(f"{API_ENDPOINT}/users", json=user_data)
    print(f"Create User Status: {response.status_code}")
    
    if response.status_code != 201:
        print(f"[FAIL] Failed to create user: {response.text}")
        return
    
    user_info = response.json()
    test_email = user_data["email"]
    print(f"[OK] Created test user: {test_email}")
    print(f"   User ID: {user_info['user']['userId']}")
    
    # 2. パスワード忘れリクエスト
    print("\n=== Step 2: Password Reset Request ===")
    forgot_data = {"email": test_email}
    
    response = requests.post(f"{API_ENDPOINT}/auth/forgot-password", json=forgot_data)
    print(f"Forgot Password Status: {response.status_code}")
    
    if response.status_code != 200:
        print(f"[FAIL] Failed to request password reset: {response.text}")
        return
    
    forgot_result = response.json()
    reset_token = forgot_result.get('resetToken')
    
    if reset_token:
        print(f"[OK] Password reset requested successfully")
        print(f"   Reset token: {reset_token}")
        print(f"   Message: {forgot_result['message']}")
    else:
        print("[FAIL] No reset token returned (production behavior)")
        print(f"   Message: {forgot_result['message']}")
        return
    
    # 3. パスワードリセット実行
    print("\n=== Step 3: Password Reset Execution ===")
    new_password = "NewPassword123!"
    reset_data = {
        "token": reset_token,
        "newPassword": new_password
    }
    
    response = requests.post(f"{API_ENDPOINT}/auth/reset-password", json=reset_data)
    print(f"Reset Password Status: {response.status_code}")
    
    if response.status_code != 200:
        print(f"[FAIL] Failed to reset password: {response.text}")
        return
    
    reset_result = response.json()
    print(f"[OK] Password reset successful")
    print(f"   Message: {reset_result['message']}")
    
    # 4. 新しいパスワードでログインテスト
    print("\n=== Step 4: Login with New Password ===")
    login_data = {
        "email": test_email,
        "password": new_password
    }
    
    response = requests.post(f"{API_ENDPOINT}/auth/login", json=login_data)
    print(f"Login Status: {response.status_code}")
    
    if response.status_code == 200:
        login_result = response.json()
        print(f"[OK] Login successful with new password")
        print(f"   Token: {login_result['token'][:20]}...")
    else:
        print(f"[FAIL] Failed to login with new password: {response.text}")
        return
    
    # 5. 古いパスワードでのログイン失敗テスト
    print("\n=== Step 5: Login with Old Password (Should Fail) ===")
    old_login_data = {
        "email": test_email,
        "password": user_data["password"]  # 元のパスワード
    }
    
    response = requests.post(f"{API_ENDPOINT}/auth/login", json=old_login_data)
    print(f"Old Password Login Status: {response.status_code}")
    
    if response.status_code == 401:
        print(f"[OK] Old password correctly rejected")
    else:
        print(f"[FAIL] Old password should have been rejected: {response.text}")
    
    # 6. トークン再利用テスト（失敗すべき）
    print("\n=== Step 6: Reset Token Reuse Test (Should Fail) ===")
    reuse_data = {
        "token": reset_token,
        "newPassword": "AnotherPassword123!"
    }
    
    response = requests.post(f"{API_ENDPOINT}/auth/reset-password", json=reuse_data)
    print(f"Token Reuse Status: {response.status_code}")
    
    if response.status_code == 400:
        print(f"[OK] Reset token correctly rejected on reuse")
    else:
        print(f"[FAIL] Reset token should have been rejected: {response.text}")
    
    print("\n" + "=" * 60)
    print("Password Reset Flow Test Completed!")
    print("=" * 60)

def test_edge_cases():
    """エッジケースのテスト"""
    print("\n" + "=" * 60)
    print("Edge Cases Test")
    print("=" * 60)
    
    # 存在しないメールアドレス
    print("\n=== Test: Non-existent Email ===")
    response = requests.post(f"{API_ENDPOINT}/auth/forgot-password", 
                           json={"email": "nonexistent@example.com"})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # 無効なトークン
    print("\n=== Test: Invalid Token ===")
    response = requests.post(f"{API_ENDPOINT}/auth/reset-password", 
                           json={"token": "invalid-token", "newPassword": "Test123!"})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # 短すぎるパスワード
    print("\n=== Test: Short Password ===")
    response = requests.post(f"{API_ENDPOINT}/auth/reset-password", 
                           json={"token": "dummy-token", "newPassword": "123"})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    try:
        # メインテスト実行
        test_password_reset_flow()
        
        # エッジケースのテスト
        test_edge_cases()
        
    except Exception as e:
        print(f"\n[FAIL] Test failed with error: {e}")
        import traceback
        traceback.print_exc()