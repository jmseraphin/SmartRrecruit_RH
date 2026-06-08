from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.evaluation import Evaluation
from app.models.employe import Employe
from app.core.deps import require_rh_or_admin

router = APIRouter(
    prefix="/evaluations",
    tags=["Evaluations"]
)


def get_appreciation(note: float):
    if note >= 18:
        return "EXCELLENT"

    if note >= 14:
        return "TRES_BIEN"

    if note >= 10:
        return "BIEN"

    return "INSUFFISANT"


@router.post("/creer/{employe_id}")
def creer_evaluation(
    employe_id: int,
    note: float = Form(...),
    commentaire: str = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    employe = db.query(Employe).filter(Employe.id == employe_id).first()

    if not employe:
        raise HTTPException(
            status_code=404,
            detail="Employé introuvable"
        )

    evaluation = Evaluation(
        employe_id=employe.id,
        note=note,
        commentaire=commentaire,
        appreciation=get_appreciation(note)
    )

    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)

    return {
        "message": "Evaluation enregistrée avec succès",
        "evaluation_id": evaluation.id,
        "employe_id": evaluation.employe_id,
        "note": evaluation.note,
        "appreciation": evaluation.appreciation
    }


@router.get("/")
def get_evaluations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    return db.query(Evaluation).all()


@router.get("/{evaluation_id}")
def get_evaluation(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()

    if not evaluation:
        raise HTTPException(
            status_code=404,
            detail="Evaluation introuvable"
        )

    return evaluation


@router.put("/{evaluation_id}")
def update_evaluation(
    evaluation_id: int,
    note: float = Form(None),
    commentaire: str = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()

    if not evaluation:
        raise HTTPException(
            status_code=404,
            detail="Evaluation introuvable"
        )

    if note is not None:
        evaluation.note = note
        evaluation.appreciation = get_appreciation(note)

    if commentaire is not None:
        evaluation.commentaire = commentaire

    db.commit()
    db.refresh(evaluation)

    return {
        "message": "Evaluation mise à jour avec succès",
        "evaluation_id": evaluation.id,
        "note": evaluation.note,
        "appreciation": evaluation.appreciation
    }


@router.delete("/{evaluation_id}")
def delete_evaluation(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()

    if not evaluation:
        raise HTTPException(
            status_code=404,
            detail="Evaluation introuvable"
        )

    db.delete(evaluation)
    db.commit()

    return {
        "message": "Evaluation supprimée avec succès"
    }