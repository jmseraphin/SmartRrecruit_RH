from sqlalchemy import Column, Integer, String, Date, DateTime
from datetime import datetime

from app.database.database import Base


class Candidat(Base):
    __tablename__ = "candidats"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    telephone = Column(String(50), nullable=True)
    adresse = Column(String(255), nullable=True)

    date_naissance = Column(Date, nullable=True)
    lieu_naissance = Column(String(255), nullable=True)

    cv_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)