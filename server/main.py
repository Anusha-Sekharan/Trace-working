from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from integrations import search_candidates, get_github_user_details
from fastapi import Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from datetime import datetime, timedelta
from auth import Token, User, verify_password, create_access_token, get_password_hash
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
import shutil
from sqlalchemy.orm import Session
import models
from database import engine, get_db
import json
from ai_engine import parse_resume_content, generate_learning_path, analyze_github_repos, form_team_synergy, analyze_vibe

app = FastAPI(title="TRACE API", description="Backend for TRACE: AI-Driven Team Formation")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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
async def search_api(query: str = "", db: Session = Depends(get_db)):
    # 1. Fetch from Database
    db_candidates = []
    if query:
        db_users = db.query(models.User).filter(
            models.User.role.ilike(f"%{query}%") |
            models.User.full_name.ilike(f"%{query}%")
        ).all()
    else:
        db_users = db.query(models.User).filter(models.User.is_assessed == True).all()

    for u in db_users:
        db_candidates.append({
            "id": u.id + 10000, # Offset ID to avoid conflict with mocks
            "name": u.full_name,
            "role": u.role or "Developer",
            "verified": u.is_assessed,
            "skills": [u.role] if u.role else [],
            "linkedin": u.linkedin_link,
            "github": u.github_link,
            "image": u.picture or f"https://api.dicebear.com/7.x/avataaars/svg?seed={u.full_name.replace(' ', '')}",
            "experience": "AI Assessed",
            "ai_score": u.ai_score
        })

    if not query:
        return {"candidates": db_candidates + MOCK_CANDIDATES}
    
    # 2. Use real integration
    results = await search_candidates(query)
    
    # 3. Fallback if no results found or API fails
    if not results:
         q_lower = query.lower()
         results = [
            c for c in MOCK_CANDIDATES 
            if q_lower in c["name"].lower() or 
            q_lower in c["role"].lower() or
            any(q_lower in s.lower() for s in c["skills"])
        ]

    # Combine DB candidates with external/mock results
    return {"candidates": db_candidates + results}

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
    
    return {"access_token": access_token, "token_type": "bearer", "user": User.from_attributes(db_user)}



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
        
        return {"access_token": access_token, "token_type": "bearer", "user": User.from_attributes(db_user)}
        
    except ValueError as e:
        # Invalid token
        print(f"DEBUG: Token Verification Failed: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid Google Token: {str(e)}")
    except Exception as e:
        print(f"DEBUG: Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


class UpdateProfileRequest(BaseModel):
    github_link: str = None
    linkedin_link: str = None

@app.put("/api/user/profile", response_model=User)
async def update_profile(request: UpdateProfileRequest, token: str = Depends(OAuth2PasswordBearer(tokenUrl="/api/login")), db: Session = Depends(get_db)):
    print(f"DEBUG: Update Profile Request: {request}")
    # Verify token
    try:
        # Quick verify logic as we don't have verify_token exported cleanly, reusing logic
        # Ideally move verify_token to auth.py and import it
        # For now, decoding manually as implemented in many tutorials or importing if available
        # Implementation of get_current_user logic:
        from jose import jwt, JWTError
        from auth import SECRET_KEY, ALGORITHM
        
        print("DEBUG: Decoding token...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        print(f"DEBUG: Token Decoded. Username: {username}")
        if username is None:
            print("DEBUG: Username missing in token")
            raise HTTPException(status_code=401, detail="Invalid token")
            
    except JWTError as e:
         print(f"DEBUG: JWT Error: {e}")
         raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
         print(f"DEBUG: Token verification exception: {e}")
         raise HTTPException(status_code=401, detail="Token validation failed")

    print(f"DEBUG: Fetching user {username} from DB...")
    db_user = get_user_by_username(db, username)
    if not db_user:
         print("DEBUG: User not found in DB")
         raise HTTPException(status_code=404, detail="User not found")
         
    try:
        if request.github_link is not None:
            print(f"DEBUG: Updating GitHub: {request.github_link}")
            db_user.github_link = request.github_link
        if request.linkedin_link is not None:
            print(f"DEBUG: Updating LinkedIn: {request.linkedin_link}")
            db_user.linkedin_link = request.linkedin_link
            
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")
        
    return User.from_attributes(db_user)

@app.get("/api/user/github-analysis", response_model=User)
async def github_analysis(token: str = Depends(OAuth2PasswordBearer(tokenUrl="/api/login")), db: Session = Depends(get_db)):
    try:
        from jose import jwt
        from auth import SECRET_KEY, ALGORITHM
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    db_user = get_user_by_username(db, username)
    if not db_user or not db_user.github_link:
        raise HTTPException(status_code=400, detail="GitHub link not provided")

    gh_user = db_user.github_link.split('/')[-1]
    # Mock repos data for now
    mock_repos = [{"name": "project1", "stars": 10, "lang": "Python"}, {"name": "project2", "stars": 5, "lang": "React"}]
    stats = await analyze_github_repos(gh_user, mock_repos)
    
    db_user.github_stats = json.dumps(stats)
    db.commit()
    db.refresh(db_user)
    
    return User.from_attributes(db_user)

class BuildTeamRequest(BaseModel):
    project_description: str

@app.post("/api/build-team")
async def build_team(request: BuildTeamRequest, db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.is_assessed == True).all()
    candidates = []
    for u in users:
        candidates.append({
            "id": u.id,
            "name": u.full_name,
            "skills": json.loads(u.skill_labels) if u.skill_labels else [u.role],
            "role": u.role
        })
    
    if len(candidates) < 3:
        candidates.extend([{"id": c["id"], "name": c["name"], "skills": c["skills"], "role": c["role"]} for c in MOCK_CANDIDATES])

    team_result = await form_team_synergy(request.project_description, candidates)
    
    new_team = models.Team(
        name=team_result["team_name"],
        description=request.project_description,
        synergy_score=team_result["synergy_score"],
        members=json.dumps(team_result["members"])
    )
    db.add(new_team)
    db.commit()
    
    return {"team": team_result}

@app.post("/api/user/upload-evidence", response_model=User)
async def upload_evidence(file: UploadFile = File(...), token: str = Depends(OAuth2PasswordBearer(tokenUrl="/api/login")), db: Session = Depends(get_db)):
    try:
        from jose import jwt, JWTError
        from auth import SECRET_KEY, ALGORITHM
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Token validation failed")

    db_user = get_user_by_username(db, username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not file.filename.lower().endswith(('.pdf', '.zip')):
        raise HTTPException(status_code=400, detail="Only PDF or ZIP files are allowed")

    file_extension = file.filename.split('.')[-1]
    filename = f"{db_user.username.replace('@', '_').replace('.', '_')}_evidence.{file_extension}"
    file_path = f"uploads/{filename}"

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        db_user.evidence_bundle = file_path
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload Failed: {str(e)}")

    # Trigger AI Resume Parsing
    try:
        parsed_data = await parse_resume_content(file_path)
        db_user.skill_labels = json.dumps(parsed_data.get("skills", []))
        db_user.projects = json.dumps(parsed_data.get("projects", []))
        db_user.role = parsed_data.get("suggested_role", db_user.role)
        db.commit()
    except Exception as ai_e:
        print(f"AI Parse background error: {ai_e}")


    return User.from_attributes(db_user)

@app.delete("/api/user/account")
async def delete_account(token: str = Depends(OAuth2PasswordBearer(tokenUrl="/api/login")), db: Session = Depends(get_db)):
    try:
        from jose import jwt, JWTError
        from auth import SECRET_KEY, ALGORITHM
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"DEBUG: Delete Account Token Error: {e}")
        raise HTTPException(status_code=401, detail=f"Token validation failed: {str(e)}")

    db_user = get_user_by_username(db, username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    try:
        # Delete evidence bundle file if it exists
        if db_user.evidence_bundle and os.path.exists(db_user.evidence_bundle):
            os.remove(db_user.evidence_bundle)
            
        # Delete user from database
        db.delete(db_user)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")

    return {"message": "Account deleted successfully"}

class ChatRequest(BaseModel):
    history: list[dict]

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    from ai_engine import chat_with_assistant
    # Response is now a dictionary {type, content, data}
    response = await chat_with_assistant(request.history)
    return {"response": response}

class InterviewRequest(BaseModel):
    role: str
    history: list[dict]

@app.post("/api/interview")
async def interview_endpoint(request: InterviewRequest):
    from ai_engine import conduct_mock_interview
    response = await conduct_mock_interview(request.role, request.history)
    return {"response": response}

class VibeCheckRequest(BaseModel):
    chat_history: list[dict]

@app.post("/api/interview/vibe-check")
async def vibe_check(request: VibeCheckRequest, token: str = Depends(OAuth2PasswordBearer(tokenUrl="/api/login")), db: Session = Depends(get_db)):
    try:
        from jose import jwt
        from auth import SECRET_KEY, ALGORITHM
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    result = await analyze_vibe(chat_history=request.chat_history)
    
    db_user = get_user_by_username(db, username)
    if db_user:
        db_user.vibe_score = result.get("vibe_score", 70)
        db_user.vibe_feedback = result.get("feedback", "")
        db.commit()
    
    return result

class AssessmentStartRequest(BaseModel):
    role: str

@app.post("/api/assessment/start")
async def start_assessment(request: AssessmentStartRequest):
    from ai_engine import generate_assessment_questions
    questions = await generate_assessment_questions(request.role)
    return {"questions": questions}

class QAndA(BaseModel):
    question: str
    answer: str

class AssessmentSubmitRequest(BaseModel):
    role: str
    q_and_a: list[QAndA]

@app.post("/api/assessment/submit", response_model=User)
async def submit_assessment(request: AssessmentSubmitRequest, token: str = Depends(OAuth2PasswordBearer(tokenUrl="/api/login")), db: Session = Depends(get_db)):
    from ai_engine import evaluate_assessment
    from jose import jwt, JWTError
    from auth import SECRET_KEY, ALGORITHM
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Token validation failed")

    db_user = get_user_by_username(db, username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    q_and_a_dicts = [{"question": qa.question, "answer": qa.answer} for qa in request.q_and_a]
    score = await evaluate_assessment(request.role, q_and_a_dicts)
    
    try:
        db_user.role = request.role
        db_user.ai_score = score
        db_user.is_assessed = True
        
        # Generate Learning Path
        missed_topics = [qa.question for qa in request.q_and_a if "wrong" in qa.answer.lower()] # Simplified logic
        l_path = await generate_learning_path(request.role, score, missed_topics)
        db_user.learning_path = json.dumps(l_path)
        
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")
        
    return User(
        username=db_user.username,
        email=db_user.email,
        full_name=db_user.full_name,
        picture=db_user.picture,
        github_link=db_user.github_link,
        linkedin_link=db_user.linkedin_link,
        evidence_bundle=db_user.evidence_bundle,
        role=db_user.role,
        ai_score=db_user.ai_score,
        is_assessed=db_user.is_assessed,
        created_at=db_user.created_at
    )
