from sqlalchemy import Boolean, Column, Integer, String, DateTime
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True) # Max length for indexing compatibility
    email = Column(String(255), unique=True, index=True)
    full_name = Column(String(255))
    picture = Column(String(1024)) # URL can be long
    hashed_password = Column(String(255))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    disabled = Column(Boolean, default=False)
    github_link = Column(String(1024), nullable=True)
    linkedin_link = Column(String(1024), nullable=True)
