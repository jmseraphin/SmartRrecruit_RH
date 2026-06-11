from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class Candidature(Base):
    __tablename__ = "candidatures"

    id = Column(Integer, primary_key=True, index=True)

    candidat_id = Column(Integer, ForeignKey("candidats.id"), nullable=False)
    offre_id = Column(Integer, ForeignKey("offres.id"), nullable=False)

    lettre_motivation = Column(Text, nullable=True)
    cv_path = Column(String(255), nullable=False)

    statut = Column(String(50), default="EN_ATTENTE")
    score = Column(Float, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    candidat = relationship(
        "Candidat",
        lazy="joined"
    )

    offre = relationship(
        "Offre",
        lazy="joined"
    )