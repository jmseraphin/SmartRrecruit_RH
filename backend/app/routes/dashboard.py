from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.core.deps import require_rh_or_admin

from app.models.offre import Offre
from app.models.candidat import Candidat
from app.models.candidature import Candidature
from app.models.employe import Employe
from app.models.mission import Mission
from app.models.paiement import Paiement
from app.models.evaluation import Evaluation
from app.models.attestation import Attestation
from app.models.contrat import Contrat

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    total_offres = db.query(Offre).count()
    offres_ouvertes = db.query(Offre).filter(Offre.statut == "OUVERTE").count()

    total_candidats = db.query(Candidat).count()
    total_candidatures = db.query(Candidature).count()

    selectionnes = db.query(Candidature).filter(
        Candidature.statut == "SELECTIONNE"
    ).count()

    non_retenus = db.query(Candidature).filter(
        Candidature.statut == "NON_RETENU"
    ).count()

    total_employes = db.query(Employe).count()
    employes_actifs = db.query(Employe).filter(Employe.statut == "ACTIF").count()

    total_contrats = db.query(Contrat).count()
    total_missions = db.query(Mission).count()

    missions_en_cours = db.query(Mission).filter(
        Mission.statut == "EN_COURS"
    ).count()

    missions_terminees = db.query(Mission).filter(
        Mission.statut == "TERMINEE"
    ).count()

    total_paiements = db.query(Paiement).count()

    montant_total = db.query(func.coalesce(func.sum(Paiement.montant), 0)).scalar()

    montant_paye = db.query(func.coalesce(func.sum(Paiement.montant), 0)).filter(
        Paiement.statut == "PAYE"
    ).scalar()

    montant_en_attente = db.query(func.coalesce(func.sum(Paiement.montant), 0)).filter(
        Paiement.statut == "EN_ATTENTE"
    ).scalar()

    total_evaluations = db.query(Evaluation).count()
    total_attestations = db.query(Attestation).count()

    return {
        "user": current_user,
        "offres": {
            "total": total_offres,
            "ouvertes": offres_ouvertes
        },
        "candidats": {
            "total": total_candidats
        },
        "candidatures": {
            "total": total_candidatures,
            "selectionnes": selectionnes,
            "non_retenus": non_retenus
        },
        "employes": {
            "total": total_employes,
            "actifs": employes_actifs
        },
        "contrats": {
            "total": total_contrats
        },
        "missions": {
            "total": total_missions,
            "en_cours": missions_en_cours,
            "terminees": missions_terminees
        },
        "paiements": {
            "total": total_paiements,
            "montant_total": montant_total,
            "montant_paye": montant_paye,
            "montant_en_attente": montant_en_attente
        },
        "evaluations": {
            "total": total_evaluations
        },
        "attestations": {
            "total": total_attestations
        }
    }


@router.get("/top-candidatures")
def get_top_candidatures(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    candidatures = db.query(Candidature).order_by(
        Candidature.score.desc()
    ).limit(10).all()

    return candidatures