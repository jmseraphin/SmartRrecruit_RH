from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.deps import require_rh_or_admin
from app.models.paiement import Paiement
from app.models.mission import Mission
from app.models.candidature import Candidature

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.get("/")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    notifications = []

    paiements_attente = db.query(Paiement).filter(
        Paiement.statut == "EN_ATTENTE"
    ).count()

    if paiements_attente > 0:
        notifications.append({
            "type": "paiement",
            "message": f"{paiements_attente} paiement(s) en attente de validation"
        })

    missions_en_cours = db.query(Mission).filter(
        Mission.statut == "EN_COURS"
    ).count()

    if missions_en_cours > 0:
        notifications.append({
            "type": "mission",
            "message": f"{missions_en_cours} mission(s) en cours à suivre"
        })

    candidatures_nouvelles = db.query(Candidature).filter(
        Candidature.statut == "NOUVELLE"
    ).count()

    if candidatures_nouvelles > 0:
        notifications.append({
            "type": "candidature",
            "message": f"{candidatures_nouvelles} nouvelle(s) candidature(s)"
        })

    return {
        "count": len(notifications),
        "notifications": notifications
    }