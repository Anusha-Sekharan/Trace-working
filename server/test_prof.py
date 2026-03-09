import sys, traceback
from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

login_res = client.post("/api/login", json={"email": "demo@trace.ai", "password": "password123"})
if login_res.status_code != 200:
    print("Login failed!", login_res.text)
    sys.exit(1)

token = login_res.json()["access_token"]

update_res = client.put(
    "/api/user/profile",
    headers={"Authorization": f"Bearer {token}"},
    json={"github_link": "test", "linkedin_link": "test"}
)
print("Status:", update_res.status_code)
print("Response:", update_res.text)
