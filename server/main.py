from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from integrations import search_candidates, get_github_user_details

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

class ChatRequest(BaseModel):
    history: list[dict]

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    from ai_engine import chat_with_assistant
    # Response is now a dictionary {type, content, data}
    response = await chat_with_assistant(request.history)
    return {"response": response}
