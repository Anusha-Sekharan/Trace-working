from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db
from crud.user import get_user_by_email, create_user
from auth import User, verify_password, create_access_token, get_password_hash
from schemas.api import LoginRequest, LoginResponse, GoogleLoginRequest
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import models

router = APIRouter(prefix="/api/login", tags=["Authentication"])

@router.post("", response_model=LoginResponse)
async def login_for_access_token(form_data: LoginRequest, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, form_data.email)
    
    if not db_user and form_data.email == "demo@trace.ai" and form_data.password == "password123":
        hashed = get_password_hash("password123")
        new_user = models.User(
            username="demo@trace.ai",
            email="demo@trace.ai",
            full_name="Demo User",
            picture="",
            hashed_password=hashed,
            created_at=datetime.utcnow(), 
            disabled=False
        )
        db_user = create_user(db, new_user)

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
    
    user_response = User.model_validate(db_user, from_attributes=True)
    return {"access_token": access_token, "token_type": "bearer", "user": user_response}

@router.post("/google", response_model=LoginResponse)
async def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        id_info = id_token.verify_oauth2_token(request.token, google_requests.Request())
        
        email = id_info.get("email")
        name = id_info.get("name")
        picture = id_info.get("picture")
        
        if not email:
             raise HTTPException(status_code=400, detail="Invalid Google Token: No email found")

        db_user = get_user_by_email(db, email)
        
        if not db_user:
            new_user = models.User(
                username=email,
                full_name=name,
                email=email,
                picture=picture,
                hashed_password="",
                created_at=datetime.utcnow(),
                disabled=False
            )
            db_user = create_user(db, new_user)
        else:
            if db_user.picture != picture or db_user.full_name != name:
                db_user.picture = picture
                db_user.full_name = name
                from crud.user import update_user
                db_user = update_user(db, db_user)
            
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": db_user.username}, expires_delta=access_token_expires
        )
        
        user_response = User.model_validate(db_user, from_attributes=True)
        return {"access_token": access_token, "token_type": "bearer", "user": user_response}
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google Token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
