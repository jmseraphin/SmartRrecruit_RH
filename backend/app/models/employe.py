from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class Employe(Base):
    __tablename__ = "employes"

    id = Column(Integer, primary_key=True, index=True)

    candidat_id = Column(Integer, ForeignKey("candidats.id"), nullable=False)
    candidature_id = Column(Integer, ForeignKey("candidatures.id"), nullable=False)
    offre_id = Column(Integer, ForeignKey("offres.id"), nullable=False)

    poste = Column(String(255), nullable=False)
    date_embauche = Column(Date, nullable=True)

    statut = Column(String(50), default="ACTIF")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())