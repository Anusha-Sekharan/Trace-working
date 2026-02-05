import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import urllib.parse

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "trace_db")

print(f"Testing connection to: {DB_HOST}")
print(f"User: {DB_USER}")
print(f"Password Raw: {DB_PASSWORD}")

# Test 1: Raw String (Likely to fail)
try:
    url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
    print(f"Trying Raw URL: {url.replace(DB_PASSWORD, '******')}")
    engine = create_engine(url)
    with engine.connect() as conn:
        print("Success with Raw URL!")
except Exception as e:
    print(f"Failed with Raw URL: {e}")

# Test 2: Encoded String (The Fix)
try:
    encoded_password = urllib.parse.quote_plus(DB_PASSWORD)
    encoded_user = urllib.parse.quote_plus(DB_USER)
    url = f"mysql+pymysql://{encoded_user}:{encoded_password}@{DB_HOST}/{DB_NAME}"
    print(f"Trying Encoded URL: {url.replace(encoded_password, '******')}")
    engine = create_engine(url)
    with engine.connect() as conn:
        print("Success with Encoded URL!")
except Exception as e:
    print(f"Failed with Encoded URL: {e}")
