from datetime import timedelta
from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from . import auth
from .database import create_db_and_tables, get_session
from .models import User, UserCreate, UserRead, Token
from .routers import tasks

app = FastAPI()

app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])

origins = [
    "http://localhost:3000",
    "http://localhost:3001",  
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://full-stack-web-application-hackatho.vercel.app/",
    "*"                       
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/api/auth/register", response_model=UserRead)
def register_user(user: UserCreate, db: Annotated[Session, Depends(get_session)]):
    db_user = db.exec(select(User).where(User.email == user.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@app.post("/api/auth/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Annotated[Session, Depends(get_session)]):
    user = db.exec(select(User).where(User.email == form_data.username)).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}