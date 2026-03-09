import json
import urllib.request
import urllib.error

# login to get token
req_login = urllib.request.Request(
    'http://localhost:8000/api/login',
    data=json.dumps({"email":"demo@trace.ai","password":"password123"}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    res_login = urllib.request.urlopen(req_login)
    token = json.loads(res_login.read().decode())["access_token"]
    
    req_prof = urllib.request.Request(
        'http://localhost:8000/api/user/profile',
        data=json.dumps({"github_link":"test","linkedin_link":"test"}).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'},
        method='PUT'
    )
    res_prof = urllib.request.urlopen(req_prof)
    print("Success:", res_prof.read().decode())
    
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code, e.reason)
    print("Body:", e.read().decode())
