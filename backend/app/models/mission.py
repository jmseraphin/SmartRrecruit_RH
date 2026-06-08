from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)

    employe_id = Column(Integer, ForeignKey("employes.id"), nullable=False)
    offre_id = Column(Integer, ForeignKey("offres.id"), nullable=False)

    titre = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    mois_mission = Column(String(100), nullable=True)
    intitule_projet = Column(Text, nullable=True)
    commune = Column(String(255), nullable=True)
    district = Column(String(255), nullable=True)
    region = Column(String(255), nullable=True)

    date_debut = Column(Date, nullable=False)
    date_fin = Column(Date, nullable=True)

    statut = Column(String(50), default="EN_COURS")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())