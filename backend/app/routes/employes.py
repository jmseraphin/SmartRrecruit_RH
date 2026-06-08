from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.employe import Employe
from app.models.candidature import Candidature
from app.models.offre import Offre

router = APIRouter(
    prefix="/employes",
    tags=["Employés"]
)


@router.post("/integrer/{candidature_id}")
def integrer_candidat(
    candidature_id: int,
    date_embauche: date = Form(None),
    db: Session = Depends(get_db)
):
    candidature = db.query(Candidature).filter(
        Candidature.id == candidature_id
    ).first()

    if not candidature:
        raise HTTPException(status_code=404, detail="Candidature introuvable")

    if candidature.statut != "SELECTIONNE":
        raise HTTPException(
            status_code=400,
            detail="Seule une candidature SELECTIONNE peut être intégrée"
        )

    employe_existant = db.query(Employe).filter(
        Employe.candidature_id == candidature.id
    ).first()

    if employe_existant:
        raise HTTPException(
            status_code=400,
            detail="Ce candidat est déjà intégré comme employé"
        )

    offre = db.query(Offre).filter(Offre.id == candidature.offre_id).first()

    if not offre:
        raise HTTPException(status_code=404, detail="Offre associée introuvable")

    employe = Employe(
        candidat_id=candidature.candidat_id,
        candidature_id=candidature.id,
        offre_id=offre.id,
        poste=offre.poste,
        date_embauche=date_embauche,
        statut="ACTIF"
    )

    candidature.statut = "EMPLOYE"

    db.add(employe)
    db.commit()
    db.refresh(employe)

    return {
        "message": "Candidat intégré directement comme employé",
        "employe_id": employe.id,
        "candidat_id": employe.candidat_id,
        "candidature_id": employe.candidature_id,
        "offre_id": employe.offre_id,
        "poste": employe.poste,
        "date_embauche": employe.date_embauche,
        "statut": employe.statut,
        "candidature_statut": candidature.statut
    }


@router.get("/")
def get_employes(db: Session = Depends(get_db)):
    return db.query(Employe).all()


@router.get("/{employe_id}")
def get_employe(employe_id: int, db: Session = Depends(get_db)):
    employe = db.query(Employe).filter(Employe.id == employe_id).first()

    if not employe:
        raise HTTPException(status_code=404, detail="Employé introuvable")

    return employe