from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    preferred_language: Optional[str] = "en"
    state: Optional[str] = "Madhya Pradesh"
    occupation: Optional[str] = None
    annual_income: Optional[float] = None

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    preferred_language: Optional[str] = "en"
    state: Optional[str] = "Madhya Pradesh"
    occupation: Optional[str] = None
    annual_income: Optional[float] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    preferred_language: Optional[str] = None
    state: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None

class UserOut(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
