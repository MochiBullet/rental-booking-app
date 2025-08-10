#!/usr/bin/env python3
"""
Test script for the rental booking API
"""

import requests
import json
from datetime import datetime

# API Gateway endpoint (replace with actual endpoint after deployment)
API_BASE_URL = "https://your-api-id.execute-api.ap-southeast-2.amazonaws.com/prod"

def test_members_api():
    """Test members API endpoints"""
    print("=== Testing Members API ===")
    
    # Test member creation
    print("\n1. Creating new member...")
    member_data = {
        "email": "test@example.com",
        "licenseLastFour": "1234"
    }
    
    response = requests.post(f"{API_BASE_URL}/members", 
                           json=member_data,
                           headers={'Content-Type': 'application/json'})
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        created_member = response.json()
        member_id = created_member['memberId']
        
        # Test getting member by ID
        print(f"\n2. Getting member by ID: {member_id}")
        response = requests.get(f"{API_BASE_URL}/members/{member_id}")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        # Test getting member by email
        print(f"\n3. Getting member by email: {member_data['email']}")
        response = requests.get(f"{API_BASE_URL}/members?email={member_data['email']}")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        # Test updating member
        print(f"\n4. Updating member...")
        update_data = {"email": "updated@example.com"}
        response = requests.put(f"{API_BASE_URL}/members/{member_id}",
                              json=update_data,
                              headers={'Content-Type': 'application/json'})
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_vehicles_api():
    """Test vehicles API endpoints"""
    print("\n=== Testing Vehicles API ===")
    
    # Test vehicle creation
    print("\n1. Creating new vehicle...")
    vehicle_data = {
        "name": "Toyota Prius",
        "vehicleType": "car",
        "description": "エコフレンドリーなハイブリッド車",
        "pricePerHour": 1500,
        "pricePerDay": 8000,
        "capacity": 5,
        "fuelType": "hybrid",
        "transmission": "automatic",
        "features": ["ナビ", "ETC", "バックカメラ"],
        "brand": "Toyota",
        "model": "Prius",
        "year": 2023
    }
    
    response = requests.post(f"{API_BASE_URL}/vehicles",
                           json=vehicle_data,
                           headers={'Content-Type': 'application/json'})
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        created_vehicle = response.json()
        vehicle_id = created_vehicle['vehicleId']
        
        # Test getting vehicle by ID
        print(f"\n2. Getting vehicle by ID: {vehicle_id}")
        response = requests.get(f"{API_BASE_URL}/vehicles/{vehicle_id}")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        # Test getting vehicles by type
        print(f"\n3. Getting vehicles by type: car")
        response = requests.get(f"{API_BASE_URL}/vehicles?type=car")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_all_endpoints():
    """Test all API endpoints"""
    try:
        test_members_api()
        test_vehicles_api()
        print("\n=== All tests completed! ===")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to API: {e}")
        print("Make sure to replace API_BASE_URL with your actual API Gateway endpoint")

if __name__ == "__main__":
    print("Rental Booking API Test Script")
    print("==============================")
    print(f"API Base URL: {API_BASE_URL}")
    print("\nNote: Update API_BASE_URL with your actual endpoint after deployment")
    
    # Uncomment the line below to run tests
    # test_all_endpoints()