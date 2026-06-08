from datetime import date

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.candidat import Candidat
from app.models.offre import Offre
from app.models.candidature import Candidature
from app.services.storage_service import save_file

router = APIRouter(prefix="/candidatures", tags=["Candidatures"])

STATUTS_AUTORISES = [
    "EN_ATTENTE",
    "SELECTIONNE",
    "NON_RETENU",
    "EMPLOYE"
]


def calculate_score(offre: Offre, competences_candidat: str):
    score = 0
    competences_requises = offre.competences_requises or []

    for competence in competences_requises:
        if competence.lower() in competences_candidat.lower():
            score += 10

    return min(score, 100)


@router.post("/apply")
def apply_to_offre(
    offre_id: int = Form(...),
    nom: str = Form(...),
    prenom: str = Form(...),
    email: str = Form(...),
    telephone: str = Form(None),
    adresse: str = Form(None),
    date_naissance: date = Form(None),
    lieu_naissance: str = Form(None),
    competences: str = Form(""),
    lettre_motivation: str = Form(None),
    cv_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    offre = db.query(Offre).filter(Offre.id == offre_id).first()

    if not offre:
        raise HTTPException(status_code=404, detail="Offre introuvable")

    candidat = db.query(Candidat).filter(Candidat.email == email).first()
    saved_cv = save_file(cv_file)

    if not candidat:
        candidat = Candidat(
            nom=nom,
            prenom=prenom,
            email=email,
            telephone=telephone,
            adresse=adresse,
            date_naissance=date_naissance,
            lieu_naissance=lieu_naissance,
            cv_path=saved_cv["path"]
        )
        db.add(candidat)
        db.commit()
        db.refresh(candidat)
    else:
        candidat.nom = nom
        candidat.prenom = prenom
        candidat.telephone = telephone
        candidat.adresse = adresse
        candidat.date_naissance = date_naissance
        candidat.lieu_naissance = lieu_naissance
        candidat.cv_path = saved_cv["path"]
        db.commit()
        db.refresh(candidat)

    score = calculate_score(offre, competences)

    candidature = Candidature(
        candidat_id=candidat.id,
        offre_id=offre.id,
        lettre_motivation=lettre_motivation,
        cv_path=saved_cv["path"],
        score=score,
        statut="EN_ATTENTE"
    )

    db.add(candidature)
    db.commit()
    db.refresh(candidature)

    return {
        "message": "Candidature envoyée avec succès",
        "candidat_id": candidat.id,
        "offre_id": offre.id,
        "candidature_id": candidature.id,
        "score": score,
        "statut": candidature.statut,
        "cv_path": saved_cv["path"]
    }


@router.get("/")
def get_candidatures(db: Session = Depends(get_db)):
    return db.query(Candidature).order_by(Candidature.score.desc()).all()


@router.get("/offre/{offre_id}")
def get_candidatures_by_offre(offre_id: int, db: Session = Depends(get_db)):
    offre = db.query(Offre).filter(Offre.id == offre_id).first()

    if not offre:
        raise HTTPException(status_code=404, detail="Offre introuvable")

    return db.query(Candidature).filter(
        Candidature.offre_id == offre_id
    ).order_by(Candidature.score.desc()).all()


@router.get("/offre/{offre_id}/ranking")
def ranking_candidatures_by_offre(offre_id: int, db: Session = Depends(get_db)):
    offre = db.query(Offre).filter(Offre.id == offre_id).first()

    if not offre:
        raise HTTPException(status_code=404, detail="Offre introuvable")

    candidatures = db.query(Candidature).filter(
        Candidature.offre_id == offre_id
    ).order_by(Candidature.score.desc()).all()

    return {
        "offre_id": offre.id,
        "offre": offre.titre,
        "classement": candidatures
    }


@router.post("/offre/{offre_id}/auto-select")
def auto_select_candidatures(
    offre_id: int,
    nombre: int = Form(1),
    db: Session = Depends(get_db)
):
    offre = db.query(Offre).filter(Offre.id == offre_id).first()

    if not offre:
        raise HTTPException(status_code=404, detail="Offre introuvable")

    candidatures = db.query(Candidature).filter(
        Candidature.offre_id == offre_id
    ).order_by(Candidature.score.desc()).all()

    if not candidatures:
        raise HTTPException(
            status_code=404,
            detail="Aucune candidature trouvée pour cette offre"
        )

    for index, candidature in enumerate(candidatures):
        candidature.statut = "SELECTIONNE" if index < nombre else "NON_RETENU"

    db.commit()

    return {
        "message": "Sélection automatique effectuée avec succès",
        "offre_id": offre.id,
        "nombre_selectionnes": nombre,
        "total_candidatures": len(candidatures)
    }


@router.put("/{candidature_id}/statut")
def update_candidature_statut(
    candidature_id: int,
    statut: str = Form(...),
    db: Session = Depends(get_db)
):
    candidature = db.query(Candidature).filter(Candidature.id == candidature_id).first()

    if not candidature:
        raise HTTPException(status_code=404, detail="Candidature introuvable")

    if statut not in STATUTS_AUTORISES:
        raise HTTPException(
            status_code=400,
            detail=f"Statut invalide. Valeurs autorisées: {STATUTS_AUTORISES}"
        )

    candidature.statut = statut
    db.commit()
    db.refresh(candidature)

    return {
        "message": "Statut mis à jour avec succès",
        "candidature_id": candidature.id,
        "nouveau_statut": candidature.statut
    }


@router.get("/{candidature_id}")
def get_candidature(candidature_id: int, db: Session = Depends(get_db)):
    candidature = db.query(Candidature).filter(Candidature.id == candidature_id).first()

    if not candidature:
        raise HTTPException(status_code=404, detail="Candidature introuvable")

    return candidature