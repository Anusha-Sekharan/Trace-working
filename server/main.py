from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from integrations import search_candidates, get_github_user_details
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from auth import Token, User, verify_password, create_access_token, get_password_hash
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

app = FastAPI(title="TRACE API", description="Backend for TRACE: AI-Driven Team Formation")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to TRACE API"}

class SkillMatchRequest(BaseModel):
    user_skills: list[str]
    required_skills: list[str]

@app.post("/api/match")
async def match_skills(request: SkillMatchRequest):
    # Mock AI Matching Logic
    score = 0
    matches = []
    for skill in request.user_skills:
        if skill in request.required_skills:
            score += 10
            matches.append(skill)
    
    return {
        "score": score,
        "matches": matches,
        "is_verified": True,
        "ai_analysis": "Candidate shows strong potential in required areas."
    }

# Mock DB with functional search links
MOCK_CANDIDATES = [
    {
        "id": 1,
        "name": "Sarah Chen",
        "role": "Senior React Developer",
        "verified": True,
        "skills": ["React", "TypeScript", "Node.js"],
        "linkedin": "https://www.linkedin.com/search/results/all/?keywords=Sarah+Chen+React",
        "github": "https://github.com/search?q=Sarah+Chen+React",
        "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        "experience": "5 years"
    },
    {
        "id": 2,
        "name": "Marcus Johnson",
        "role": "Full Stack Engineer",
        "verified": True,
        "skills": ["Python", "FastAPI", "React"],
        "linkedin": "https://www.linkedin.com/search/results/all/?keywords=Marcus+Johnson+Python",
        "github": "https://github.com/search?q=Marcus+Johnson+Python",
        "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
        "experience": "4 years"
    },
    {
        "id": 3,
        "name": "Emma Wilson",
        "role": "UI/UX Designer",
        "verified": True,
        "skills": ["Figma", "Tailwind CSS", "User Research"],
        "linkedin": "https://www.linkedin.com/search/results/all/?keywords=Emma+Wilson+Designer",
        "github": "https://github.com/search?q=Emma+Wilson+Designer",
        "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        "experience": "3 years"
    },
     {
        "id": 4,
        "name": "Alex Rodriguez",
        "role": "Backend Engineer",
        "verified": False,
        "skills": ["Go", "Docker", "Kubernetes"],
        "linkedin": "https://www.linkedin.com/search/results/all/?keywords=Alex+Rodriguez+Go",
        "github": "https://github.com/search?q=Alex+Rodriguez+Go",
        "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        "experience": "6 years"
    }
]

@app.get("/api/search")
async def search_api(query: str = ""):
    if not query:
        return {"candidates": MOCK_CANDIDATES}
    
    # Use real integration
    results = await search_candidates(query)
    
    # Fallback if no results found or API fails
    if not results:
         query = query.lower()
         results = [
            c for c in MOCK_CANDIDATES 
            if query in c["name"].lower() or 
            query in c["role"].lower() or
            any(query in s.lower() for s in c["skills"])
        ]

    return {"candidates": results}

class FindNearbyRequest(BaseModel):
    username: str = ""
    skill: str = ""
    manual_location: str = None

@app.post("/api/find-nearby")
async def find_nearby(request: FindNearbyRequest):
    location = request.manual_location

    # 1. If no manual location, try to get from GitHub
    if not location and request.username:
        user_details = await get_github_user_details(request.username)
        if user_details:
             location = user_details.get("location")
    
    if not location:
        return {
            "success": False,
            "message": "Could not determine location. Please enter it manually or check your GitHub profile."
        }
    
    # 2. Search for candidates near that location
    results = await search_candidates(request.skill, location=location)

    return {
        "success": True,
        "location": location,
        "candidates": results,
        "message": f"Showing {request.skill or 'skilled'} developers near {location}"
    }

# Auth Logic with Database
from sqlalchemy.orm import Session
import models
from database import engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User  # Pydantic User model from auth.py

@app.post("/api/login", response_model=LoginResponse)
async def login_for_access_token(form_data: LoginRequest, db: Session = Depends(get_db)):
    # Check DB
    db_user = get_user_by_email(db, form_data.email)
    
    # Fallback to demo user if not in DB (for smooth transition)
    if not db_user and form_data.email == "demo@trace.ai" and form_data.password == "password123":
        # Create demo user in DB if missing
        hashed = get_password_hash("password123")
        db_user = models.User(
            username="demo@trace.ai",
            email="demo@trace.ai",
            full_name="Demo User",
            picture="",
            hashed_password=hashed,
            created_at=datetime.utcnow(), 
            disabled=False
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )
    
    # Convert SQLAlchemy model to Pydantic model for response
    user_response = User(
        username=db_user.username, 
        email=db_user.email, 
        full_name=db_user.full_name,
        picture=db_user.picture,
        created_at=db_user.created_at
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user_response}



class GoogleLoginRequest(BaseModel):
    token: str

@app.post("/api/login/google", response_model=LoginResponse)
async def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    print(f"DEBUG: Google Login Attempt with token: {request.token[:20]}...")
    try:
        # Verify the token
        id_info = id_token.verify_oauth2_token(request.token, google_requests.Request())
        print(f"DEBUG: Token Verified. Info keys: {id_info.keys()}")
        
        email = id_info.get("email")
        name = id_info.get("name")
        picture = id_info.get("picture")
        print(f"DEBUG: Extracted - Email: {email}, Name: {name}, Picture: {picture}")
        
        if not email:
             print("DEBUG: No email found in token")
             raise HTTPException(status_code=400, detail="Invalid Google Token: No email found")

        # Check if user exists in DB
        db_user = get_user_by_email(db, email)
        print(f"DEBUG: User in DB: {db_user}")
        
        if not db_user:
            print("DEBUG: Creating new user...")
            # Create new user
            db_user = models.User(
                username=email,
                full_name=name,
                email=email,
                picture=picture,
                hashed_password="", # No password for google users
                created_at=datetime.utcnow(),
                disabled=False
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            print("DEBUG: New user created and committed.")
        else:
            print("DEBUG: Updating existing user...")
            # Update user info (picture/name)
            db_user.picture = picture
            db_user.full_name = name
            db.commit()
            db.refresh(db_user)
            print("DEBUG: User updated.")
            
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": db_user.username}, expires_delta=access_token_expires
        )
        
        user_response = User(
            username=db_user.username,
            email=db_user.email,
            full_name=db_user.full_name,
            picture=db_user.picture,
            created_at=db_user.created_at
        )
        print("DEBUG: Login successful, returning response.")
        
        return {"access_token": access_token, "token_type": "bearer", "user": user_response}
        
    except ValueError as e:
        # Invalid token
        print(f"DEBUG: Token Verification Failed: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid Google Token: {str(e)}")
    except Exception as e:
        print(f"DEBUG: Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

class ChatRequest(BaseModel):
    history: list[dict]

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    from ai_engine import chat_with_assistant
    # Response is now a dictionary {type, content, data}
    response = await chat_with_assistant(request.history)
    return {"response": response}
