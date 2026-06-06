from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.database.database import settings, get_db
from app.models.offre import Offre
from app.schemas.offre import OffreCreate, OffreUpdate, OffreResponse


router = APIRouter(
    prefix="/offres",
    tags=["Offres"]
)

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        email = payload.get("sub")
        role = payload.get("role")

        if email is None or role is None:
            raise HTTPException(
                status_code=401,
                detail="Token invalide"
            )

        return {
            "email": email,
            "role": role
        }

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token invalide"
        )


def admin_required(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Acces refuse: ADMIN uniquement"
        )

    return current_user


def calculer_statut_offre(offre: Offre):
    if offre.statut == "ANNULEE":
        return "ANNULEE"

    today = date.today()

    if offre.date_fin_reception < today:
        return "FERMEE"

    if offre.date_debut_reception > today:
        return "PROGRAMMEE"

    return "OUVERTE"


def mettre_a_jour_statut(offre: Offre, db: Session):
    nouveau_statut = calculer_statut_offre(offre)

    if offre.statut != nouveau_statut:
        offre.statut = nouveau_statut
        db.commit()
        db.refresh(offre)

    return offre


@router.post("/", response_model=OffreResponse)
def create_offre(
    offre_data: OffreCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    if offre_data.date_fin_reception < offre_data.date_debut_reception:
        raise HTTPException(
            status_code=400,
            detail="La date fin reception doit etre apres la date debut reception"
        )

    total_score = sum(offre_data.criteres_score.values())

    if total_score != 100:
        raise HTTPException(
            status_code=400,
            detail="La somme des criteres_score doit etre egale a 100"
        )

    nouvelle_offre = Offre(
        titre=offre_data.titre,
        poste=offre_data.poste,
        description=offre_data.description,
        lieu=offre_data.lieu,
        type_contrat=offre_data.type_contrat,
        experience_min=offre_data.experience_min,
        niveau_etude=offre_data.niveau_etude,
        competences_requises=offre_data.competences_requises,
        criteres_score=offre_data.criteres_score,
        date_debut_reception=offre_data.date_debut_reception,
        date_fin_reception=offre_data.date_fin_reception,
        created_by_email=current_user["email"],
        created_by_role=current_user["role"]
    )

    db.add(nouvelle_offre)
    db.flush()

    nouvelle_offre.reference = f"OFFRE_REF_{nouvelle_offre.id:04d}"
    nouvelle_offre.statut = calculer_statut_offre(nouvelle_offre)

    db.commit()
    db.refresh(nouvelle_offre)

    return nouvelle_offre


@router.get("/", response_model=list[OffreResponse])
def get_offres(db: Session = Depends(get_db)):
    offres = db.query(Offre).order_by(Offre.id.desc()).all()

    for offre in offres:
        if offre.statut != "ANNULEE":
            offre.statut = calculer_statut_offre(offre)

    db.commit()

    return offres


@router.get("/{offre_id}", response_model=OffreResponse)
def get_offre(
    offre_id: int,
    db: Session = Depends(get_db)
):
    offre = db.query(Offre).filter(Offre.id == offre_id).first()

    if not offre:
        raise HTTPException(
            status_code=404,
            detail="Offre introuvable"
        )

    return mettre_a_jour_statut(offre, db)


@router.put("/{offre_id}", response_model=OffreResponse)
def update_offre(
    offre_id: int,
    offre_data: OffreUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    offre = db.query(Offre).filter(Offre.id == offre_id).first()

    if not offre:
        raise HTTPException(
            status_code=404,
            detail="Offre introuvable"
        )

    if offre.statut == "ANNULEE":
        raise HTTPException(
            status_code=400,
            detail="Impossible de modifier une offre annulee"
        )

    update_data = offre_data.model_dump(exclude_unset=True)

    date_debut = update_data.get(
        "date_debut_reception",
        offre.date_debut_reception
    )

    date_fin = update_data.get(
        "date_fin_reception",
        offre.date_fin_reception
    )

    if date_fin < date_debut:
        raise HTTPException(
            status_code=400,
            detail="La date fin reception doit etre apres la date debut reception"
        )

    if "criteres_score" in update_data:
        total_score = sum(update_data["criteres_score"].values())

        if total_score != 100:
            raise HTTPException(
                status_code=400,
                detail="La somme des criteres_score doit etre egale a 100"
            )

    for key, value in update_data.items():
        setattr(offre, key, value)

    offre.statut = calculer_statut_offre(offre)

    db.commit()
    db.refresh(offre)

    return offre


@router.delete("/{offre_id}", response_model=OffreResponse)
def annuler_offre(
    offre_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    offre = db.query(Offre).filter(Offre.id == offre_id).first()

    if not offre:
        raise HTTPException(
            status_code=404,
            detail="Offre introuvable"
        )

    if offre.statut == "ANNULEE":
        raise HTTPException(
            status_code=400,
            detail="Offre deja annulee"
        )

    offre.statut = "ANNULEE"

    db.commit()
    db.refresh(offre)

    return offre