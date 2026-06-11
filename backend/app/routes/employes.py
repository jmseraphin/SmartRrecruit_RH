from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.deps import require_rh_or_admin

from app.models.employe import Employe
from app.models.candidature import Candidature
from app.models.candidat import Candidat
from app.models.offre import Offre

router = APIRouter(
    prefix="/employes",
    tags=["Employés"]
)


def employe_to_dict(employe: Employe):
    candidat = employe.candidat
    offre = employe.offre

    return {
        "id": employe.id,
        "candidat_id": employe.candidat_id,
        "candidature_id": employe.candidature_id,
        "offre_id": employe.offre_id,
        "nom": candidat.nom if candidat else None,
        "prenom": candidat.prenom if candidat else None,
        "email": candidat.email if candidat else None,
        "telephone": candidat.telephone if candidat else None,
        "reference_offre": offre.reference if offre else None,
        "titre_offre": offre.titre if offre else None,
        "poste": employe.poste,
        "date_embauche": employe.date_embauche,
        "statut": employe.statut,
        "created_at": employe.created_at,
        "updated_at": employe.updated_at
    }


@router.post("/integrer/{candidature_id}")
def integrer_candidat(
    candidature_id: int,
    date_embauche: date = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
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

    offre = db.query(Offre).filter(
        Offre.id == candidature.offre_id
    ).first()

    if not offre:
        raise HTTPException(
            status_code=404,
            detail="Offre associée introuvable"
        )

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
        "employe": employe_to_dict(employe),
        "candidature_statut": candidature.statut
    }


@router.get("/")
def get_employes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    employes = db.query(Employe).order_by(Employe.id.desc()).all()
    return [employe_to_dict(employe) for employe in employes]


@router.get("/{employe_id}")
def get_employe(
    employe_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    employe = db.query(Employe).filter(
        Employe.id == employe_id
    ).first()

    if not employe:
        raise HTTPException(
            status_code=404,
            detail="Employé introuvable"
        )

    return employe_to_dict(employe)