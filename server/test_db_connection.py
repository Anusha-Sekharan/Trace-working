from database import SessionLocal, engine
from sqlalchemy import text
import sys

try:
    print("Testing database connection via database.py...")
    # Try to connect
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print(f"Connection successful! Result: {result.scalar()}")

    # Try session
    db = SessionLocal()
    print("Session created successfully.")
    db.close()
    print("Test Complete: SUCCESS")

except Exception as e:
    print(f"Test Failed: {e}")
    sys.exit(1)
