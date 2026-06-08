from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date


class CandidatCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    date_naissance: Optional[date] = None
    lieu_naissance: Optional[str] = None


class CandidatUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    date_naissance: Optional[date] = None
    lieu_naissance: Optional[str] = None
    cv_path: Optional[str] = None


class CandidatResponse(BaseModel):
    id: int
    nom: str
    prenom: str
    email: EmailStr
    telephone: Optional[str]
    adresse: Optional[str]
    date_naissance: Optional[date]
    lieu_naissance: Optional[str]
    cv_path: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True