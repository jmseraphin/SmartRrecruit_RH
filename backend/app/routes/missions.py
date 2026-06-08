from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.mission import Mission
from app.models.employe import Employe

router = APIRouter(prefix="/missions", tags=["Missions"])

STATUTS_MISSION_AUTORISES = [
    "EN_COURS",
    "TERMINEE",
    "ANNULEE"
]


@router.post("/assigner/{employe_id}")
def assigner_mission(
    employe_id: int,
    titre: str = Form(...),
    description: str = Form(None),
    mois_mission: str = Form(None),
    intitule_projet: str = Form("pour la mise en œuvre des activités de Transfert Monétaire Non Conditionnel (TMNC)"),
    commune: str = Form(None),
    district: str = Form(None),
    region: str = Form(None),
    date_debut: date = Form(...),
    date_fin: date = Form(None),
    db: Session = Depends(get_db)
):
    employe = db.query(Employe).filter(Employe.id == employe_id).first()

    if not employe:
        raise HTTPException(status_code=404, detail="Employé introuvable")

    mission = Mission(
        employe_id=employe.id,
        offre_id=employe.offre_id,
        titre=titre,
        description=description,
        mois_mission=mois_mission,
        intitule_projet=intitule_projet,
        commune=commune,
        district=district,
        region=region,
        date_debut=date_debut,
        date_fin=date_fin,
        statut="EN_COURS"
    )

    db.add(mission)
    db.commit()
    db.refresh(mission)

    return {
        "message": "Mission assignée avec succès",
        "mission_id": mission.id,
        "employe_id": mission.employe_id,
        "offre_id": mission.offre_id,
        "titre": mission.titre,
        "mois_mission": mission.mois_mission,
        "intitule_projet": mission.intitule_projet,
        "commune": mission.commune,
        "district": mission.district,
        "region": mission.region,
        "statut": mission.statut
    }


@router.get("/")
def get_missions(db: Session = Depends(get_db)):
    return db.query(Mission).all()


@router.get("/{mission_id}")
def get_mission(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()

    if not mission:
        raise HTTPException(status_code=404, detail="Mission introuvable")

    return mission


@router.put("/{mission_id}/statut")
def update_mission_statut(
    mission_id: int,
    statut: str = Form(...),
    db: Session = Depends(get_db)
):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()

    if not mission:
        raise HTTPException(status_code=404, detail="Mission introuvable")

    if statut not in STATUTS_MISSION_AUTORISES:
        raise HTTPException(
            status_code=400,
            detail=f"Statut invalide. Valeurs autorisées: {STATUTS_MISSION_AUTORISES}"
        )

    mission.statut = statut
    db.commit()
    db.refresh(mission)

    return {
        "message": "Statut mission mis à jour avec succès",
        "mission_id": mission.id,
        "nouveau_statut": mission.statut
    }