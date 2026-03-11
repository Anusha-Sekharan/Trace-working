from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from crud.user import get_user_by_username, update_user
from auth import User, SECRET_KEY, ALGORITHM
from schemas.api import UpdateProfileRequest
from jose import jwt, JWTError
import shutil

router = APIRouter(prefix="/api/user", tags=["User Profile"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def get_current_username(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Token validation failed")

@router.put("/profile", response_model=User)
async def update_profile(
    request: UpdateProfileRequest, 
    username: str = Depends(get_current_username), 
    db: Session = Depends(get_db)
):
    db_user = get_user_by_username(db, username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
         
    try:
        if request.github_link is not None:
            db_user.github_link = request.github_link
        if request.linkedin_link is not None:
            db_user.linkedin_link = request.linkedin_link
            
        update_user(db, db_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database Update Failed: {str(e)}")
    
    return User.model_validate(db_user, from_attributes=True)

@router.post("/upload-evidence", response_model=User)
async def upload_evidence(
    file: UploadFile = File(...), 
    username: str = Depends(get_current_username), 
    db: Session = Depends(get_db)
):
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
        update_user(db, db_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload Failed: {str(e)}")

    return User.model_validate(db_user, from_attributes=True)
