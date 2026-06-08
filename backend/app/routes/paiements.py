import os
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from app.database.database import get_db
from app.core.deps import require_rh_or_admin

from app.models.paiement import Paiement
from app.models.employe import Employe
from app.models.candidat import Candidat
from app.models.mission import Mission
from app.services.email_service import send_email_with_attachment

router = APIRouter(prefix="/paiements", tags=["Paiements"])

RECU_DIR = "uploads/recus"

TYPES_PAIEMENT_AUTORISES = ["AVANCE", "SALAIRE", "PRIME"]


def generate_recu_pdf(file_path, paiement, employe, candidat):
    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, height - 70, "REÇU DE PAIEMENT")

    c.setFont("Helvetica", 11)
    y = height - 130

    c.drawString(60, y, f"Employé : {candidat.prenom} {candidat.nom}")
    y -= 25
    c.drawString(60, y, f"Poste : {employe.poste}")
    y -= 25
    c.drawString(60, y, f"Type de paiement : {paiement.type_paiement}")
    y -= 25
    c.drawString(60, y, f"Montant : {paiement.montant} MGA")
    y -= 25
    c.drawString(60, y, f"Date de paiement : {paiement.date_paiement}")
    y -= 25
    c.drawString(60, y, f"Statut : {paiement.statut}")

    y -= 60
    c.drawString(60, y, "Ce reçu confirme que le paiement ci-dessus a été effectué.")

    y -= 80
    c.drawString(width - 250, y, f"Fait à Fianarantsoa, le {date.today()}")

    y -= 80
    c.drawString(width - 250, y, "RANDRIATAHIANA Charles")
    c.drawString(width - 250, y - 20, "Président de l’Association SYNERGIE CONSULT")

    c.save()


@router.post("/creer/{employe_id}")
def creer_paiement(
    employe_id: int,
    montant: float = Form(...),
    type_paiement: str = Form(...),
    mission_id: int = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    employe = db.query(Employe).filter(Employe.id == employe_id).first()

    if not employe:
        raise HTTPException(status_code=404, detail="Employé introuvable")

    if type_paiement not in TYPES_PAIEMENT_AUTORISES:
        raise HTTPException(
            status_code=400,
            detail=f"Type paiement invalide. Valeurs autorisées: {TYPES_PAIEMENT_AUTORISES}"
        )

    if mission_id:
        mission = db.query(Mission).filter(Mission.id == mission_id).first()

        if not mission:
            raise HTTPException(status_code=404, detail="Mission introuvable")

        if mission.employe_id != employe.id:
            raise HTTPException(
                status_code=400,
                detail="Cette mission n'appartient pas à cet employé"
            )

    paiement = Paiement(
        employe_id=employe.id,
        mission_id=mission_id,
        montant=montant,
        type_paiement=type_paiement,
        statut="EN_ATTENTE"
    )

    db.add(paiement)
    db.commit()
    db.refresh(paiement)

    return {
        "message": "Paiement créé avec succès",
        "paiement_id": paiement.id,
        "employe_id": paiement.employe_id,
        "mission_id": paiement.mission_id,
        "montant": paiement.montant,
        "type_paiement": paiement.type_paiement,
        "statut": paiement.statut
    }


@router.put("/{paiement_id}/payer")
def payer_paiement(
    paiement_id: int,
    date_paiement: date = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    paiement = db.query(Paiement).filter(Paiement.id == paiement_id).first()

    if not paiement:
        raise HTTPException(status_code=404, detail="Paiement introuvable")

    employe = db.query(Employe).filter(Employe.id == paiement.employe_id).first()

    if not employe:
        raise HTTPException(status_code=404, detail="Employé introuvable")

    candidat = db.query(Candidat).filter(Candidat.id == employe.candidat_id).first()

    if not candidat:
        raise HTTPException(status_code=404, detail="Candidat introuvable")

    paiement.statut = "PAYE"
    paiement.date_paiement = date_paiement or date.today()

    os.makedirs(RECU_DIR, exist_ok=True)

    recu_path = os.path.join(RECU_DIR, f"recu_paiement_{paiement.id}.pdf")

    generate_recu_pdf(
        file_path=recu_path,
        paiement=paiement,
        employe=employe,
        candidat=candidat
    )

    paiement.recu_path = recu_path

    db.commit()
    db.refresh(paiement)

    email_envoye = False

    if candidat.email:
        try:
            email_envoye = send_email_with_attachment(
                to_email=candidat.email,
                subject="Reçu de paiement - SmartRecruit RH",
                body=(
                    f"Bonjour {candidat.prenom},\n\n"
                    f"Veuillez trouver en pièce jointe votre reçu de paiement.\n\n"
                    f"Montant : {paiement.montant} MGA\n"
                    f"Type : {paiement.type_paiement}\n"
                    f"Date : {paiement.date_paiement}\n\n"
                    f"Cordialement,\nSmartRecruit RH"
                ),
                file_path=recu_path
            )
        except Exception:
            email_envoye = False

    return {
        "message": "Paiement marqué comme payé",
        "paiement_id": paiement.id,
        "statut": paiement.statut,
        "date_paiement": paiement.date_paiement,
        "recu_path": paiement.recu_path,
        "email_envoye": email_envoye
    }


@router.get("/")
def get_paiements(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    return db.query(Paiement).all()


@router.get("/{paiement_id}")
def get_paiement(
    paiement_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    paiement = db.query(Paiement).filter(Paiement.id == paiement_id).first()

    if not paiement:
        raise HTTPException(status_code=404, detail="Paiement introuvable")

    return paiement


@router.get("/{paiement_id}/download")
def download_recu_paiement(
    paiement_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    paiement = db.query(Paiement).filter(Paiement.id == paiement_id).first()

    if not paiement:
        raise HTTPException(status_code=404, detail="Paiement introuvable")

    if not paiement.recu_path:
        raise HTTPException(status_code=404, detail="Reçu non généré")

    if not os.path.exists(paiement.recu_path):
        raise HTTPException(status_code=404, detail="Fichier reçu introuvable")

    return FileResponse(
        path=paiement.recu_path,
        filename=os.path.basename(paiement.recu_path),
        media_type="application/pdf"
    )