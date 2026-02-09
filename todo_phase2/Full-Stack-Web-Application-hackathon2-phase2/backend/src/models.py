from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel
import datetime

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    
    tasks: List["Task"] = Relationship(back_populates="owner")

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

class TaskBase(SQLModel):
    title: str = Field(index=True)
    description: Optional[str] = None
    is_completed: bool = Field(default=False)

class Task(TaskBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow, nullable=False)
    
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")
    owner: Optional[User] = Relationship(back_populates="tasks")

class TaskCreate(TaskBase):
    pass

class TaskRead(TaskBase):
    id: int
    created_at: datetime.datetime
    owner_id: int

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    
class Token(SQLModel):
    access_token: str
    token_type: str

class TokenData(SQLModel):
    email: Optional[str] = None
