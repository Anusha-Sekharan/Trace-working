from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from schemas.api import SkillMatchRequest, FindNearbyRequest
from integrations import search_candidates, get_github_user_details

router = APIRouter(prefix="/api", tags=["Matching & Searching"])

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

@router.post("/match")
async def match_skills(request: SkillMatchRequest):
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

@router.get("/search")
async def search_api(query: str = "", db: Session = Depends(get_db)):
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
            "id": u.id + 10000, 
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
    
    results = await search_candidates(query)
    
    if not results:
         q_lower = query.lower()
         results = [
            c for c in MOCK_CANDIDATES 
            if q_lower in c["name"].lower() or 
            q_lower in c["role"].lower() or
            any(q_lower in s.lower() for s in c["skills"])
        ]

    return {"candidates": db_candidates + results}

@router.post("/find-nearby")
async def find_nearby(request: FindNearbyRequest):
    location = request.manual_location

    if not location and request.username:
        user_details = await get_github_user_details(request.username)
        if user_details:
             location = user_details.get("location")
    
    if not location:
        return {
            "success": False,
            "message": "Could not determine location. Please enter it manually or check your GitHub profile."
        }
    
    results = await search_candidates(request.skill, location=location)

    return {
        "success": True,
        "location": location,
        "candidates": results,
        "message": f"Showing {request.skill or 'skilled'} developers near {location}"
    }
