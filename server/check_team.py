import sys
import urllib.request
import json

req = urllib.request.Request(
    'http://localhost:8000/api/build-team', 
    data=json.dumps({'project_description': 'build a fintech app with react and go'}).encode('utf-8'), 
    headers={'Content-Type': 'application/json'}
)
try:
    response = urllib.request.urlopen(req)
    print("SUCCESS")
    print(response.read().decode())
except Exception as e:
    print("ERROR")
    print(e)
    if hasattr(e, 'read'):
        print(e.read().decode())
