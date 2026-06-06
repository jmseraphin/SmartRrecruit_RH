from datetime import date, datetime
from typing import List, Dict, Optional

from pydantic import BaseModel


class OffreCreate(BaseModel):
    titre: str
    poste: str
    description: str
    lieu: str
    type_contrat: str

    experience_min: int = 0
    niveau_etude: Optional[str] = None

    competences_requises: List[str]
    criteres_score: Dict[str, int]

    date_debut_reception: date
    date_fin_reception: date


class OffreUpdate(BaseModel):
    titre: Optional[str] = None
    poste: Optional[str] = None
    description: Optional[str] = None
    lieu: Optional[str] = None
    type_contrat: Optional[str] = None

    experience_min: Optional[int] = None
    niveau_etude: Optional[str] = None

    competences_requises: Optional[List[str]] = None
    criteres_score: Optional[Dict[str, int]] = None

    date_debut_reception: Optional[date] = None
    date_fin_reception: Optional[date] = None


class OffreResponse(BaseModel):
    id: int
    reference: str

    titre: str
    poste: str
    description: str
    lieu: str
    type_contrat: str

    experience_min: int
    niveau_etude: Optional[str]

    competences_requises: List[str]
    criteres_score: Dict[str, int]

    date_debut_reception: date
    date_fin_reception: date

    statut: str

    created_by_email: str
    created_by_role: str

    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True