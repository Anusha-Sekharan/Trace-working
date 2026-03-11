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

# Include modular routers
from routers import auth, profile, assessment, match
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(assessment.router)
app.include_router(match.router)
