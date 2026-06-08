from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class Paiement(Base):
    __tablename__ = "paiements"

    id = Column(Integer, primary_key=True, index=True)

    employe_id = Column(Integer, ForeignKey("employes.id"), nullable=False)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=True)

    montant = Column(Float, nullable=False)
    type_paiement = Column(String(50), nullable=False)

    statut = Column(String(50), default="EN_ATTENTE")
    date_paiement = Column(Date, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())