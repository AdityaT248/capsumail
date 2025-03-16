from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import uuid

from app.database import get_db
from app.models.models import User, VerificationToken
from app.schemas import UserCreate, UserResponse, Token
from app.auth import (
    get_password_hash, 
    authenticate_user, 
    create_access_token, 
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.services.email_service import EmailService

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    responses={404: {"description": "Not found"}},
)

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create verification token
    token = secrets.token_urlsafe(32)
    token_expiry = datetime.utcnow() + timedelta(hours=24)
    db_token = VerificationToken(
        user_id=db_user.id,
        token=token,
        expires_at=token_expiry
    )
    db.add(db_token)
    db.commit()
    
    # Send verification email
    verification_url = f"http://localhost:8000/auth/verify?token={token}"
    email_content = f"""
    <html>
        <body>
            <h1>Welcome to TimeCapsule!</h1>
            <p>Thank you for registering. Please click the link below to verify your email address:</p>
            <p><a href="{verification_url}">Verify Email</a></p>
            <p>This link will expire in 24 hours.</p>
        </body>
    </html>
    """
    
    EmailService.send_email(
        to_email=user.email,
        subject="Verify your TimeCapsule account",
        content=email_content
    )
    
    return db_user

@router.get("/verify")
async def verify_email(token: str, db: Session = Depends(get_db)):
    # Find token in database
    db_token = db.query(VerificationToken).filter(VerificationToken.token == token).first()
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    # Check if token is expired
    if db_token.expires_at < datetime.utcnow():
        db.delete(db_token)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired"
        )
    
    # Update user verification status
    user = db.query(User).filter(User.id == db_token.user_id).first()
    user.is_verified = True
    
    # Delete token
    db.delete(db_token)
    db.commit()
    
    return {"message": "Email verified successfully"}

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user 