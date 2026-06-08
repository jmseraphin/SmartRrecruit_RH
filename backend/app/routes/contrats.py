from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.contrat import Contrat
from app.models.employe import Employe
from app.models.offre import Offre

router = APIRouter(
    prefix="/contrats",
    tags=["Contrats"]
)


@router.post("/generer/{employe_id}")
def generer_contrat(
    employe_id: int,
    date_debut: date = Form(...),
    date_fin: date = Form(None),
    db: Session = Depends(get_db)
):
    employe = db.query(Employe).filter(
        Employe.id == employe_id
    ).first()

    if not employe:
        raise HTTPException(
            status_code=404,
            detail="Employé introuvable"
        )

    contrat_existant = db.query(Contrat).filter(
        Contrat.employe_id == employe.id
    ).first()

    if contrat_existant:
        raise HTTPException(
            status_code=400,
            detail="Un contrat existe déjà pour cet employé"
        )

    offre = db.query(Offre).filter(
        Offre.id == employe.offre_id
    ).first()

    if not offre:
        raise HTTPException(
            status_code=404,
            detail="Offre introuvable"
        )

    contrat = Contrat(
        employe_id=employe.id,
        type_contrat=offre.type_contrat,
        date_debut=date_debut,
        date_fin=date_fin,
        statut="ACTIF"
    )

    db.add(contrat)
    db.commit()
    db.refresh(contrat)

    return {
        "message": "Contrat généré avec succès",
        "contrat_id": contrat.id,
        "employe_id": employe.id,
        "type_contrat": contrat.type_contrat,
        "date_debut": contrat.date_debut,
        "date_fin": contrat.date_fin,
        "statut": contrat.statut
    }


@router.get("/")
def get_contrats(db: Session = Depends(get_db)):
    return db.query(Contrat).all()


@router.get("/{contrat_id}")
def get_contrat(
    contrat_id: int,
    db: Session = Depends(get_db)
):
    contrat = db.query(Contrat).filter(
        Contrat.id == contrat_id
    ).first()

    if not contrat:
        raise HTTPException(
            status_code=404,
            detail="Contrat introuvable"
        )

    return contrat