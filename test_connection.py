import requests

# Test backend connection
try:
    response = requests.get('http://localhost:8000/docs')
    if response.status_code == 200:
        print("✅ Backend is running and accessible!")
        print("📋 API Documentation available at: http://localhost:8000/docs")
    else:
        print(f"❌ Backend responded with status code: {response.status_code}")
except requests.exceptions.RequestException as e:
    print(f"❌ Cannot connect to backend: {e}")
    print("💡 Make sure the backend server is running on port 8000")

# Test file upload simulation
test_file_path = r"A:\progash\ocr\sample_images\realtest.jpeg"
try:
    with open(test_file_path, 'rb') as f:
        files = {'file': ('realtest.jpeg', f, 'image/jpeg')}
        response = requests.post('http://localhost:8000/upload/answer_sheet', files=files)

    if response.status_code == 200:
        data = response.json()
        print("✅ File upload test successful!")
        print(f"📄 File ID: {data.get('file_id')}")
        print(f"📝 Message: {data.get('message')}")
    else:
        print(f"❌ File upload failed with status code: {response.status_code}")
        print(f"📝 Response: {response.text}")

except FileNotFoundError:
    print("❌ Test file not found")
except Exception as e:
    print(f"❌ Upload test failed: {e}")

print("\n🎯 Frontend should be running at: http://localhost:5173/")
print("🎯 Backend API at: http://localhost:8000/")
print("🎯 API Docs at: http://localhost:8000/docs")