from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from integrations import search_candidates, get_github_user_details
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta
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

# Auth Logic
fake_users_db = {
    "demo@trace.ai": {
        "username": "demo@trace.ai",
        "full_name": "Demo User",
        "email": "demo@trace.ai",
        "picture": "",
        "hashed_password": get_password_hash("password123"),
        "disabled": False,
    }
}

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return type('UserInDB', (object,), user_dict)
    return None

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

@app.post("/api/login", response_model=LoginResponse)
async def login_for_access_token(form_data: LoginRequest):
    user = get_user(fake_users_db, form_data.email)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    # Convert UserInDB to User model for response
    user_response = User(
        username=user.username, 
        email=user.email, 
        full_name=user.full_name,
        picture=user.picture
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user_response}



class GoogleLoginRequest(BaseModel):
    token: str

@app.post("/api/login/google", response_model=LoginResponse)
async def google_login(request: GoogleLoginRequest):
    try:
        # Verify the token
        # Specify the CLIENT_ID of the app that accesses the backend:
        # id_info = id_token.verify_oauth2_token(token, google_requests.Request(), CLIENT_ID)
        
        # For now, we will verify indiscriminately (NOT RECOMMENDED FOR PRODUCTION without checking Audience)
        # In production, you MUST check that id_info['aud'] is your Google Client ID
        id_info = id_token.verify_oauth2_token(request.token, google_requests.Request())
        
        email = id_info.get("email")
        name = id_info.get("name")
        picture = id_info.get("picture")
        
        if not email:
             raise HTTPException(status_code=400, detail="Invalid Google Token: No email found")

        # Check if user exists, if not create one
        user_in_db = get_user(fake_users_db, email)
        if not user_in_db:
            # Create new user
            fake_users_db[email] = {
                "username": email,
                "full_name": name,
                "email": email,
                "picture": picture,
                "hashed_password": "", # No password for google users
                "disabled": False,
            }
            user_in_db = get_user(fake_users_db, email)
        else:
            # Update user info (like picture) if they log in again
            # Note: Since get_user returns a dynamic object, we modify the source db directly
            fake_users_db[email]["picture"] = picture
            fake_users_db[email]["full_name"] = name
            user_in_db = get_user(fake_users_db, email)
            
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user_in_db.username}, expires_delta=access_token_expires
        )
        
        user_response = User(
            username=user_in_db.username,
            email=user_in_db.email,
            full_name=user_in_db.full_name,
            picture=user_in_db.picture
        )
        
        return {"access_token": access_token, "token_type": "bearer", "user": user_response}
        
    except ValueError as e:
        # Invalid token
        raise HTTPException(status_code=401, detail=f"Invalid Google Token: {str(e)}")

class ChatRequest(BaseModel):
    history: list[dict]

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    from ai_engine import chat_with_assistant
    # Response is now a dictionary {type, content, data}
    response = await chat_with_assistant(request.history)
    return {"response": response}
