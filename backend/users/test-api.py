import requests
import json
import time
import sys

# APIエンドポイント（デプロイ完了）
API_ENDPOINT = "https://ub3o5hhdz5.execute-api.ap-southeast-2.amazonaws.com/prod"

def test_create_user():
    """ユーザー作成テスト"""
    print("\n=== Testing Create User ===")
    
    user_data = {
        "email": f"test{int(time.time())}@example.com",
        "password": "TestPassword123!",
        "profile": {
            "firstName": "太郎",
            "lastName": "テスト",
            "phone": "090-1234-5678"
        },
        "address": {
            "postalCode": "123-4567",
            "prefecture": "東京都",
            "city": "渋谷区",
            "street": "テスト1-1-1"
        }
    }
    
    response = requests.post(f"{API_ENDPOINT}/users", json=user_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 201:
        data = response.json()
        print(f"Created User ID: {data['user']['userId']}")
        print(f"Member Number: {data['user']['memberNumber']}")
        return data['user']['userId'], user_data['email'], user_data['password']
    else:
        print(f"Error: {response.text}")
        return None, None, None

def test_login(email, password):
    """ログインテスト"""
    print("\n=== Testing Login ===")
    
    login_data = {
        "email": email,
        "password": password
    }
    
    response = requests.post(f"{API_ENDPOINT}/auth/login", json=login_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Login successful!")
        print(f"Token: {data['token'][:20]}...")
        return data['token']
    else:
        print(f"Error: {response.text}")
        return None

def test_get_user(user_id):
    """ユーザー取得テスト"""
    print(f"\n=== Testing Get User ===")
    
    response = requests.get(f"{API_ENDPOINT}/users/{user_id}")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"User Email: {data['email']}")
        print(f"Member Type: {data['memberType']}")
        print(f"Points Balance: {data['points']['balance']}")
    else:
        print(f"Error: {response.text}")

def test_update_user(user_id):
    """ユーザー更新テスト"""
    print(f"\n=== Testing Update User ===")
    
    update_data = {
        "profile": {
            "firstName": "次郎",
            "lastName": "更新",
            "phone": "080-9876-5432"
        },
        "preferences": {
            "language": "en",
            "newsletter": False
        }
    }
    
    response = requests.put(f"{API_ENDPOINT}/users/{user_id}", json=update_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("User updated successfully!")
        print(f"Updated Name: {data['user']['profile']['firstName']} {data['user']['profile']['lastName']}")
    else:
        print(f"Error: {response.text}")

def test_list_users():
    """ユーザー一覧テスト"""
    print("\n=== Testing List Users ===")
    
    response = requests.get(f"{API_ENDPOINT}/users?limit=10")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total Users: {data['count']}")
        if data['users']:
            print("First User:")
            print(f"  - Email: {data['users'][0]['email']}")
            print(f"  - Member Number: {data['users'][0]['memberNumber']}")
    else:
        print(f"Error: {response.text}")

def test_delete_user(user_id):
    """ユーザー削除テスト"""
    print(f"\n=== Testing Delete User ===")
    
    response = requests.delete(f"{API_ENDPOINT}/users/{user_id}")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("User deleted successfully!")
    else:
        print(f"Error: {response.text}")

def main():
    print("=" * 50)
    print("User API Test Suite")
    print("=" * 50)
    
    # APIエンドポイントの確認
    if "YOUR-API-ID" in API_ENDPOINT:
        print("\n⚠️  Please update API_ENDPOINT with your actual API Gateway URL")
        print("You can find it in the CDK deployment output")
        sys.exit(1)
    
    print(f"\nAPI Endpoint: {API_ENDPOINT}")
    
    # テスト実行
    try:
        # 1. ユーザー作成
        user_id, email, password = test_create_user()
        
        if user_id:
            # 2. ログイン
            token = test_login(email, password)
            
            # 3. ユーザー取得
            test_get_user(user_id)
            
            # 4. ユーザー更新
            test_update_user(user_id)
            
            # 5. ユーザー一覧
            test_list_users()
            
            # 6. ユーザー削除
            # test_delete_user(user_id)  # コメントアウト（テストユーザーを残す場合）
        
        print("\n" + "=" * 50)
        print("All tests completed!")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()