from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.core.deps import require_rh_or_admin
from app.models.employe import Employe
from app.models.paiement import Paiement

router = APIRouter(
    prefix="/soldes",
    tags=["Soldes"]
)


@router.get("/")
def get_soldes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    employes = db.query(Employe).all()

    resultats = []

    for employe in employes:
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

        resultats.append({
            "employe_id": employe.id,
            "poste": employe.poste,
            "total_paye": total_paye,
            "total_en_attente": total_en_attente,
            "solde_total": total_paye + total_en_attente
        })

    return resultats


@router.get("/{employe_id}")
def get_solde_employe(
    employe_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    employe = db.query(Employe).filter(Employe.id == employe_id).first()

    if not employe:
        raise HTTPException(status_code=404, detail="Employé introuvable")

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

    paiements = db.query(Paiement).filter(
        Paiement.employe_id == employe.id
    ).all()

    return {
        "employe_id": employe.id,
        "poste": employe.poste,
        "total_paye": total_paye,
        "total_en_attente": total_en_attente,
        "solde_total": total_paye + total_en_attente,
        "historique_paiements": paiements
    }