from sqlalchemy import Column, Integer, String, Text, Date, DateTime, JSON
from sqlalchemy.sql import func

from app.database.database import Base


class Offre(Base):
    __tablename__ = "offres"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String(50), unique=True, index=True, nullable=True)

    titre = Column(String(255), nullable=False)
    poste = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    lieu = Column(String(255), nullable=False)
    type_contrat = Column(String(100), nullable=False)

    experience_min = Column(Integer, default=0)
    niveau_etude = Column(String(255), nullable=True)

    competences_requises = Column(JSON, nullable=False)
    criteres_score = Column(JSON, nullable=False)

    date_debut_reception = Column(Date, nullable=False)
    date_fin_reception = Column(Date, nullable=False)

    statut = Column(String(50), default="OUVERTE")

    created_by_email = Column(String(255), nullable=False)
    created_by_role = Column(String(50), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())