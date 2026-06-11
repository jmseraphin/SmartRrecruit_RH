from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.core.deps import require_rh_or_admin
from app.models.employe import Employe
from app.models.paiement import Paiement
from app.models.candidat import Candidat

router = APIRouter(
    prefix="/soldes",
    tags=["Soldes"]
)


def solde_to_dict(employe: Employe, db: Session):
    candidat = db.query(Candidat).filter(
        Candidat.id == employe.candidat_id
    ).first()

    total_paye = db.query(
        func.coalesce(func.sum(Paiement.montant), 0)
    ).filter(
        Paiement.employe_id == employe.id,
        Paiement.statut == "PAYE"
    ).scalar()

    total_en_attente = db.query(
        func.coalesce(func.sum(Paiement.montant), 0)
    ).filter(
        Paiement.employe_id == employe.id,
        Paiement.statut == "EN_ATTENTE"
    ).scalar()

    return {
        "employe_id": employe.id,
        "nom": candidat.nom if candidat else None,
        "prenom": candidat.prenom if candidat else None,
        "email": candidat.email if candidat else None,
        "telephone": candidat.telephone if candidat else None,
        "poste": employe.poste,
        "total_paye": total_paye,
        "total_en_attente": total_en_attente,
        "solde_total": total_paye + total_en_attente
    }


@router.get("/")
def get_soldes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    employes = db.query(Employe).all()
    return [solde_to_dict(employe, db) for employe in employes]


@router.get("/{employe_id}")
def get_solde_employe(
    employe_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    employe = db.query(Employe).filter(Employe.id == employe_id).first()

    if not employe:
        raise HTTPException(status_code=404, detail="Employé introuvable")

    result = solde_to_dict(employe, db)

    paiements = db.query(Paiement).filter(
        Paiement.employe_id == employe.id
    ).all()

    result["historique_paiements"] = paiements

    return result