import sys
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# Login to get token (creates demo user if it doesn't exist)
print("1. Logging in as demo user...")
login_res = client.post("/api/login", json={"email": "demo@trace.ai", "password": "password123"})
if login_res.status_code != 200:
    print("Failed to login", login_res.text)
    sys.exit(1)
token = login_res.json()["access_token"]

# Delete the account
print("2. Deleting account via /api/user/account...")
del_res = client.delete("/api/user/account", headers={"Authorization": f"Bearer {token}"})
print("Result Status:", del_res.status_code)
print("Result Body:", del_res.json())

# Try updating profile (should fail because user is deleted)
print("3. Verifying user is deleted...")
prof_res = client.put("/api/user/profile", headers={"Authorization": f"Bearer {token}"}, json={})
print("Verify Result:", prof_res.status_code, prof_res.text)

if prof_res.status_code == 404 and del_res.status_code == 200:
    print("\n✅ Verification Successful: Account correctly deleted and removed from DB.")
else:
    print("\n❌ Verification Failed")
    sys.exit(1)
