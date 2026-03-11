from pydantic import BaseModel
from typing import List, Optional

class SkillMatchRequest(BaseModel):
    user_skills: List[str]
    required_skills: List[str]

class FindNearbyRequest(BaseModel):
    username: str = ""
    skill: str = ""
    manual_location: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleLoginRequest(BaseModel):
    token: str

class UpdateProfileRequest(BaseModel):
    github_link: Optional[str] = None
    linkedin_link: Optional[str] = None

class ChatRequest(BaseModel):
    history: List[dict]

class InterviewRequest(BaseModel):
    role: str
    history: List[dict]

class AssessmentStartRequest(BaseModel):
    role: str

class QAndA(BaseModel):
    question: str
    answer: str

class AssessmentSubmitRequest(BaseModel):
    role: str
    q_and_a: List[QAndA]
