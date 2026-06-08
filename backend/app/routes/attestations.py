import os
from datetime import date

import qrcode
from fastapi import APIRouter, Depends, HTTPException, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

from app.database.database import get_db
from app.core.deps import require_rh_or_admin

from app.models.attestation import Attestation
from app.models.employe import Employe
from app.models.candidat import Candidat
from app.models.offre import Offre
from app.models.mission import Mission
from app.models.evaluation import Evaluation

router = APIRouter(prefix="/attestations", tags=["Attestations"])

ATTESTATION_DIR = "uploads/attestations"
ASSETS_DIR = "uploads/assets"
LOGO_PATH = "uploads/assets/logo.jpeg"


def format_date_fr(value):
    if not value:
        return "Non précisée"

    mois = [
        "janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "décembre"
    ]

    return f"{value.day} {mois[value.month - 1]} {value.year}"


def draw_wrapped_text(c, text, x, y, max_width, line_height=15):
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


def generate_qr_code(text: str, output_path: str):
    qr = qrcode.QRCode(
        version=1,
        box_size=6,
        border=2
    )
    qr.add_data(text)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_path)


def generate_attestation_pdf(
    file_path: str,
    candidat: Candidat,
    employe: Employe,
    offre: Offre,
    mois_mission: str,
    intitule_travail: str,
    commune: str,
    district: str,
    region: str
):
    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    # Bordures
    c.setLineWidth(2)
    c.rect(30, 30, width - 60, height - 60)
    c.setLineWidth(1)
    c.rect(38, 38, width - 76, height - 76)

    # Header fixe
    c.setFont("Helvetica", 9)
    header_lines = [
        "Association SYNERGIE CONSULT",
        "Lot AN/51 B3609 Anolaka",
        "Talatamaty, Fianarantsoa 301",
        "NIF : 4001019642",
        "STAT : 94111 21 2012 0 01863",
        "Tél : +261 34 38 637 33",
        "Email : ndriatahianiavo@gmail.com",
    ]

    y_header = height - 70
    for line in header_lines:
        c.drawString(65, y_header, line)
        y_header -= 13

    # Logo réel
    if os.path.exists(LOGO_PATH):
        logo = ImageReader(LOGO_PATH)
        c.drawImage(
            logo,
            width - 190,
            height - 155,
            width=105,
            height=105,
            preserveAspectRatio=True,
            mask="auto"
        )

    # Titre
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, height - 190, "ATTESTATION DE TRAVAIL")

    # Infos depuis DB
    nom_complet = f"{candidat.prenom} {candidat.nom}".upper()
    date_naissance = format_date_fr(candidat.date_naissance)
    lieu_naissance = candidat.lieu_naissance or "Non précisé"
    poste = employe.poste

    qr_phrase = (
        f"{nom_complet} né le {date_naissance} à {lieu_naissance} "
        f"a travaillé au sein de notre Association, Mois de {mois_mission}, "
        f"en qualité d’{poste}"
    )

    texte = (
        f"Je Soussigné, RANDRIATAHIANA Charles, Président de l’Association SYNERGIE CONSULT, "
        f"atteste par la présente {qr_phrase} {intitule_travail}, "
        f"{commune}, District d’{district}, Région {region}, "
        f"sous contrat FID et l’Association SYNERGIE CONSULT."
    )

    c.setFont("Helvetica", 10)
    y = height - 250
    y = draw_wrapped_text(c, texte, 55, y, width - 110, 15)

    y -= 15
    y = draw_wrapped_text(
        c,
        "En foi de quoi, cette attestation est délivrée pour servir et valoir ce que de droit",
        55,
        y,
        width - 110,
        15
    )

    y -= 10
    c.setFont("Helvetica", 10)
    c.drawString(width - 260, y, f"Fait à Fianarantsoa, le {format_date_fr(date.today())}")

    # 6 cm environ sous la fin du texte/date
    block_y = y - 120

    if block_y < 80:
        block_y = 80

    os.makedirs(ASSETS_DIR, exist_ok=True)

    qr_path = os.path.join(ASSETS_DIR, f"qr_attestation_employe_{employe.id}.png")
    generate_qr_code(qr_phrase, qr_path)

    qr_img = ImageReader(qr_path)
    c.drawImage(qr_img, 80, block_y, width=70, height=70)

    # Espace tampon/signature volontairement laissé vide
    c.setFont("Helvetica", 10)
    c.drawString(width - 245, block_y + 12, "RANDRIATAHIANA Charles")
    c.drawString(width - 245, block_y - 8, "Président de l’Association Synergie Consult")

    c.save()


@router.post("/generer/{employe_id}")
def generer_attestation(
    employe_id: int,
    mois_mission: str = Form(...),
    intitule_travail: str = Form(...),
    commune: str = Form(...),
    district: str = Form(...),
    region: str = Form(...),
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

    os.makedirs(ATTESTATION_DIR, exist_ok=True)

    filename = f"attestation_employe_{employe.id}.pdf"
    file_path = os.path.join(ATTESTATION_DIR, filename)

    generate_attestation_pdf(
        file_path=file_path,
        candidat=candidat,
        employe=employe,
        offre=offre,
        mois_mission=mois_mission,
        intitule_travail=intitule_travail,
        commune=commune,
        district=district,
        region=region
    )

    attestation = Attestation(
        employe_id=employe.id,
        mission_id=None,
        fichier_path=file_path,
        statut="GENEREE"
    )

    db.add(attestation)
    db.commit()
    db.refresh(attestation)

    return {
        "message": "Attestation générée avec succès",
        "attestation_id": attestation.id,
        "employe_id": employe.id,
        "fichier_path": attestation.fichier_path,
        "statut": attestation.statut
    }


@router.get("/")
def get_attestations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    return db.query(Attestation).all()


@router.get("/{attestation_id}/download")
def download_attestation(
    attestation_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    attestation = db.query(Attestation).filter(
        Attestation.id == attestation_id
    ).first()

    if not attestation:
        raise HTTPException(status_code=404, detail="Attestation introuvable")

    if not os.path.exists(attestation.fichier_path):
        raise HTTPException(status_code=404, detail="Fichier PDF introuvable")

    return FileResponse(
        path=attestation.fichier_path,
        filename=os.path.basename(attestation.fichier_path),
        media_type="application/pdf"
    )


@router.get("/{attestation_id}")
def get_attestation(
    attestation_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    attestation = db.query(Attestation).filter(
        Attestation.id == attestation_id
    ).first()

    if not attestation:
        raise HTTPException(status_code=404, detail="Attestation introuvable")

    return attestation