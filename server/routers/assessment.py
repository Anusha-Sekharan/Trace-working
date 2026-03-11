from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from crud.user import get_user_by_username, update_user
from auth import User, SECRET_KEY, ALGORITHM
from schemas.api import AssessmentStartRequest, AssessmentSubmitRequest
from jose import jwt, JWTError

router = APIRouter(prefix="/api/assessment", tags=["Assessment"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def get_current_username(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except Exception:
        raise HTTPException(status_code=401, detail="Token validation failed")

@router.post("/start")
async def start_assessment(request: AssessmentStartRequest):
    from ai_engine import generate_assessment_questions
    questions = await generate_assessment_questions(request.role)
    return {"questions": questions}

@router.post("/submit", response_model=User)
async def submit_assessment(
    request: AssessmentSubmitRequest, 
    username: str = Depends(get_current_username), 
    db: Session = Depends(get_db)
):
    from ai_engine import evaluate_assessment
    
    db_user = get_user_by_username(db, username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    q_and_a_dicts = [{"question": qa.question, "answer": qa.answer} for qa in request.q_and_a]
    score = await evaluate_assessment(request.role, q_and_a_dicts)
    
    try:
        db_user.role = request.role
        db_user.ai_score = score
        db_user.is_assessed = True
        update_user(db, db_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database update failed: {str(e)}")
        
    return User.model_validate(db_user, from_attributes=True)
