from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class Attestation(Base):
    __tablename__ = "attestations"

    id = Column(Integer, primary_key=True, index=True)

    employe_id = Column(Integer, ForeignKey("employes.id"), nullable=False)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=True)

    fichier_path = Column(String(255), nullable=False)
    statut = Column(String(50), default="GENEREE")

    created_at = Column(DateTime(timezone=True), server_default=func.now())