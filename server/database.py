from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Default to MySQL on localhost if .env is missing or DATABASE_URL not set
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/trace_db")

# For MySQL, we don't need 'check_same_thread' which is mostly for SQLite
try:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True,  # Good practice to check connection health
        pool_recycle=3600    # Prevent stale connections
    )
except Exception as e:
    print(f"Warning: Failed to create database engine: {e}")
    engine = None
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
