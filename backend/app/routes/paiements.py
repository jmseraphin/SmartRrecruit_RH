from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.paiement import Paiement
from app.models.employe import Employe
from app.models.mission import Mission

router = APIRouter(
    prefix="/paiements",
    tags=["Paiements"]
)

TYPES_PAIEMENT_AUTORISES = [
    "AVANCE",
    "SALAIRE",
    "PRIME"
]

STATUTS_PAIEMENT_AUTORISES = [
    "EN_ATTENTE",
    "PAYE"
]


@router.post("/creer/{employe_id}")
def creer_paiement(
    employe_id: int,
    montant: float = Form(...),
    type_paiement: str = Form(...),
    mission_id: int = Form(None),
    db: Session = Depends(get_db)
):
    employe = db.query(Employe).filter(
        Employe.id == employe_id
    ).first()

    if not employe:
        raise HTTPException(status_code=404, detail="Employé introuvable")

    if type_paiement not in TYPES_PAIEMENT_AUTORISES:
        raise HTTPException(
            status_code=400,
            detail=f"Type paiement invalide. Valeurs autorisées: {TYPES_PAIEMENT_AUTORISES}"
        )

    if mission_id:
        mission = db.query(Mission).filter(
            Mission.id == mission_id
        ).first()

        if not mission:
            raise HTTPException(status_code=404, detail="Mission introuvable")

        if mission.employe_id != employe.id:
            raise HTTPException(
                status_code=400,
                detail="Cette mission n'appartient pas à cet employé"
            )

    paiement = Paiement(
        employe_id=employe.id,
        mission_id=mission_id,
        montant=montant,
        type_paiement=type_paiement,
        statut="EN_ATTENTE"
    )

    db.add(paiement)
    db.commit()
    db.refresh(paiement)

    return {
        "message": "Paiement créé avec succès",
        "paiement_id": paiement.id,
        "employe_id": paiement.employe_id,
        "mission_id": paiement.mission_id,
        "montant": paiement.montant,
        "type_paiement": paiement.type_paiement,
        "statut": paiement.statut
    }


@router.get("/")
def get_paiements(db: Session = Depends(get_db)):
    return db.query(Paiement).all()


@router.get("/{paiement_id}")
def get_paiement(paiement_id: int, db: Session = Depends(get_db)):
    paiement = db.query(Paiement).filter(
        Paiement.id == paiement_id
    ).first()

    if not paiement:
        raise HTTPException(status_code=404, detail="Paiement introuvable")

    return paiement


@router.put("/{paiement_id}/payer")
def payer_paiement(
    paiement_id: int,
    date_paiement: date = Form(None),
    db: Session = Depends(get_db)
):
    paiement = db.query(Paiement).filter(
        Paiement.id == paiement_id
    ).first()

    if not paiement:
        raise HTTPException(status_code=404, detail="Paiement introuvable")

    paiement.statut = "PAYE"
    paiement.date_paiement = date_paiement or date.today()

    db.commit()
    db.refresh(paiement)

    return {
        "message": "Paiement marqué comme payé",
        "paiement_id": paiement.id,
        "statut": paiement.statut,
        "date_paiement": paiement.date_paiement
    }