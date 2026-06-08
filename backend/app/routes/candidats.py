from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.candidat import Candidat
from app.schemas.candidat import CandidatCreate, CandidatUpdate, CandidatResponse

router = APIRouter(
    prefix="/candidats",
    tags=["Candidats"]
)


@router.post("/", response_model=CandidatResponse)
def create_candidat(candidat: CandidatCreate, db: Session = Depends(get_db)):
    existing_candidat = db.query(Candidat).filter(
        Candidat.email == candidat.email
    ).first()

    if existing_candidat:
        raise HTTPException(
            status_code=400,
            detail="Un candidat avec cet email existe déjà"
        )

    new_candidat = Candidat(**candidat.model_dump())

    db.add(new_candidat)
    db.commit()
    db.refresh(new_candidat)

    return new_candidat


@router.get("/", response_model=list[CandidatResponse])
def get_candidats(db: Session = Depends(get_db)):
    return db.query(Candidat).all()


@router.get("/{candidat_id}", response_model=CandidatResponse)
def get_candidat(candidat_id: int, db: Session = Depends(get_db)):
    candidat = db.query(Candidat).filter(Candidat.id == candidat_id).first()

    if not candidat:
        raise HTTPException(
            status_code=404,
            detail="Candidat introuvable"
        )

    return candidat


@router.put("/{candidat_id}", response_model=CandidatResponse)
def update_candidat(
    candidat_id: int,
    candidat_update: CandidatUpdate,
    db: Session = Depends(get_db)
):
    candidat = db.query(Candidat).filter(Candidat.id == candidat_id).first()

    if not candidat:
        raise HTTPException(
            status_code=404,
            detail="Candidat introuvable"
        )

    update_data = candidat_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(candidat, key, value)

    db.commit()
    db.refresh(candidat)

    return candidat


@router.delete("/{candidat_id}")
def delete_candidat(candidat_id: int, db: Session = Depends(get_db)):
    candidat = db.query(Candidat).filter(Candidat.id == candidat_id).first()

    if not candidat:
        raise HTTPException(
            status_code=404,
            detail="Candidat introuvable"
        )

    db.delete(candidat)
    db.commit()

    return {
        "message": "Candidat supprimé avec succès"
    }