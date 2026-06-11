import os
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from app.database.database import get_db
from app.core.deps import require_rh_or_admin

from app.models.contrat import Contrat
from app.models.employe import Employe
from app.models.candidat import Candidat
from app.models.offre import Offre
from app.services.email_service import send_email_with_attachment

router = APIRouter(
    prefix="/contrats",
    tags=["Contrats"]
)

CONTRAT_DIR = "uploads/contrats"


def format_date_fr(value):
    if not value:
        return "Non précisée"

    mois = [
        "janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "décembre"
    ]

    return f"{value.day} {mois[value.month - 1]} {value.year}"


def draw_text(c, text, x, y, max_width, line_height=15):
    words = text.split()
    line = ""

    for word in words:
        test_line = f"{line} {word}".strip()

        if c.stringWidth(test_line, "Helvetica", 10) <= max_width:
            line = test_line
        else:
            c.drawString(x, y, line)
            y -= line_height
            line = word

    if line:
        c.drawString(x, y, line)
        y -= line_height

    return y


def generate_contrat_pdf(file_path, employe, candidat, offre, contrat):
    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width / 2, height - 70, "CONTRAT DE TRAVAIL")

    c.setFont("Helvetica", 10)
    y = height - 120

    texte = (
        f"Entre l’Association SYNERGIE CONSULT, représentée par son Président, "
        f"et Madame / Monsieur {candidat.prenom} {candidat.nom}, "
        f"il est établi le présent contrat de travail."
    )

    y = draw_text(c, texte, 60, y, width - 120)

    y -= 20
    c.drawString(60, y, f"Poste : {employe.poste}")
    y -= 20
    c.drawString(60, y, f"Type de contrat : {contrat.type_contrat}")
    y -= 20
    c.drawString(60, y, f"Lieu de travail : {offre.lieu}")
    y -= 20
    c.drawString(60, y, f"Date début : {format_date_fr(contrat.date_debut)}")
    y -= 20
    c.drawString(60, y, f"Date fin : {format_date_fr(contrat.date_fin)}")
    y -= 20
    c.drawString(60, y, f"Statut : {contrat.statut}")

    y -= 40
    texte2 = (
        "Le présent contrat précise les conditions de collaboration entre les parties. "
        "L’employé s’engage à effectuer les missions confiées avec professionnalisme, "
        "respect des consignes et confidentialité."
    )

    y = draw_text(c, texte2, 60, y, width - 120)

    y -= 50
    c.drawString(60, y, f"Fait à {offre.lieu}, le {format_date_fr(date.today())}")

    y -= 80
    c.drawString(80, y, "Signature Employé")
    c.drawString(width - 230, y, "Signature Responsable")

    y -= 60
    c.drawString(width - 230, y, "RANDRIATAHIANA Charles")
    c.drawString(width - 230, y - 18, "Président de l’Association")

    c.save()


@router.post("/generer/{employe_id}")
def generer_contrat(
    employe_id: int,
    date_debut: date = Form(...),
    date_fin: date = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    employe = db.query(Employe).filter(Employe.id == employe_id).first()

    if not employe:
        raise HTTPException(status_code=404, detail="Employé introuvable")

    candidat = db.query(Candidat).filter(Candidat.id == employe.candidat_id).first()
    offre = db.query(Offre).filter(Offre.id == employe.offre_id).first()

    if not candidat:
        raise HTTPException(status_code=404, detail="Candidat introuvable")

    if not offre:
        raise HTTPException(status_code=404, detail="Offre introuvable")

    contrat_existant = db.query(Contrat).filter(
        Contrat.employe_id == employe.id
    ).first()

    if contrat_existant:
        raise HTTPException(
            status_code=400,
            detail="Un contrat existe déjà pour cet employé"
        )

    contrat = Contrat(
        employe_id=employe.id,
        type_contrat=offre.type_contrat,
        date_debut=date_debut,
        date_fin=date_fin,
        statut="ACTIF"
    )

    db.add(contrat)
    db.commit()
    db.refresh(contrat)

    os.makedirs(CONTRAT_DIR, exist_ok=True)

    file_path = os.path.join(CONTRAT_DIR, f"contrat_employe_{employe.id}.pdf")

    generate_contrat_pdf(
        file_path=file_path,
        employe=employe,
        candidat=candidat,
        offre=offre,
        contrat=contrat
    )

    return {
        "message": "Contrat généré avec succès",
        "contrat_id": contrat.id,
        "employe_id": employe.id,
        "type_contrat": contrat.type_contrat,
        "date_debut": contrat.date_debut,
        "date_fin": contrat.date_fin,
        "statut": contrat.statut,
        "fichier_path": file_path
    }


@router.get("/")
def get_contrats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    return db.query(Contrat).all()


@router.get("/{contrat_id}/download")
def download_contrat(
    contrat_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    contrat = db.query(Contrat).filter(
        Contrat.id == contrat_id
    ).first()

    if not contrat:
        raise HTTPException(status_code=404, detail="Contrat introuvable")

    file_path = f"uploads/contrats/contrat_employe_{contrat.employe_id}.pdf"

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Fichier contrat introuvable")

    return FileResponse(
        path=file_path,
        filename=os.path.basename(file_path),
        media_type="application/pdf"
    )

@router.post("/{contrat_id}/send-email")
def send_contrat_email(
    contrat_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    contrat = db.query(Contrat).filter(
        Contrat.id == contrat_id
    ).first()

    if not contrat:
        raise HTTPException(
            status_code=404,
            detail="Contrat introuvable"
        )

    employe = db.query(Employe).filter(
        Employe.id == contrat.employe_id
    ).first()

    if not employe:
        raise HTTPException(
            status_code=404,
            detail="Employé introuvable"
        )

    candidat = db.query(Candidat).filter(
        Candidat.id == employe.candidat_id
    ).first()

    if not candidat:
        raise HTTPException(
            status_code=404,
            detail="Candidat introuvable"
        )

    file_path = f"uploads/contrats/contrat_employe_{contrat.employe_id}.pdf"

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="Fichier contrat introuvable"
        )

    sent = send_email_with_attachment(
        to_email=candidat.email,
        subject="Votre contrat de travail",
        body=(
            f"Bonjour {candidat.prenom} {candidat.nom},\n\n"
            f"Veuillez trouver ci-joint votre contrat de travail.\n\n"
            f"Cordialement,\n"
            f"Service RH"
        ),
        file_path=file_path
    )

    if not sent:
        raise HTTPException(
            status_code=500,
            detail="Configuration SMTP manquante"
        )

    return {
        "message": "Contrat envoyé avec succès",
        "email": candidat.email,
        "contrat_id": contrat.id
    }

@router.get("/{contrat_id}")
def get_contrat(
    contrat_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    contrat = db.query(Contrat).filter(Contrat.id == contrat_id).first()

    if not contrat:
        raise HTTPException(status_code=404, detail="Contrat introuvable")

    return contrat