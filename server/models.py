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
    evidence_bundle = Column(String(1024), nullable=True)
    role = Column(String(255), nullable=True)
    ai_score = Column(Integer, nullable=True)
    is_assessed = Column(Boolean, default=False)
    
    # New AI-driven fields
    skill_labels = Column(String, nullable=True) # JSON string of skills
    projects = Column(String, nullable=True)     # JSON string of projects
    github_stats = Column(String, nullable=True) # JSON string of GH metrics
    learning_path = Column(String, nullable=True)# JSON string of suggested path
    vibe_score = Column(Integer, nullable=True)  # Soft skill score
    vibe_feedback = Column(String, nullable=True)# AI feedback on "vibe"

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    description = Column(String(1024))
    synergy_score = Column(Integer)
    members = Column(String, nullable=True) # JSON string of user IDs
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
