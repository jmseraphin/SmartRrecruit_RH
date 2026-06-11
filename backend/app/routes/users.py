from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.deps import get_current_user
from app.core.security import hash_password, verify_password
from app.models.user import User

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me")
def get_me(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user = db.query(User).filter(User.email == current_user["email"]).first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    return {
        "id": user.id,
        "nom": user.nom,
        "email": user.email,
        "role": user.role
    }


@router.put("/me/profile")
def update_profile(
    nom: str = Form(...),
    email: str = Form(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user = db.query(User).filter(User.email == current_user["email"]).first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    existing = db.query(User).filter(
        User.email == email,
        User.id != user.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    user.nom = nom
    user.email = email

    db.commit()
    db.refresh(user)

    return {
        "message": "Profil mis à jour avec succès",
        "id": user.id,
        "nom": user.nom,
        "email": user.email,
        "role": user.role
    }


@router.put("/me/password")
def update_password(
    ancien_mot_de_passe: str = Form(...),
    nouveau_mot_de_passe: str = Form(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user = db.query(User).filter(User.email == current_user["email"]).first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    if not verify_password(ancien_mot_de_passe, user.mot_de_passe):
        raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")

    user.mot_de_passe = hash_password(nouveau_mot_de_passe)

    db.commit()

    return {
        "message": "Mot de passe modifié avec succès"
    }