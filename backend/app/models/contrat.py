from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class Contrat(Base):
    __tablename__ = "contrats"

    id = Column(Integer, primary_key=True, index=True)

    employe_id = Column(Integer, ForeignKey("employes.id"), nullable=False)

    type_contrat = Column(String(100), nullable=False)

    date_debut = Column(Date, nullable=False)
    date_fin = Column(Date, nullable=True)

    statut = Column(String(50), default="ACTIF")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())