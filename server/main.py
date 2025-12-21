from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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


from integrations import search_candidates

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
        "is_verified": True,  # Mock verified status
        "ai_analysis": "Candidate shows strong potential in required areas."
    }

@app.get("/api/search")
async def search_api(query: str):
    results = await search_candidates(query)
    return {"candidates": results}
