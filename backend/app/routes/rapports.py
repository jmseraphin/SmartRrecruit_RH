import os
from datetime import date

from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas

from app.database.database import get_db
from app.core.deps import require_rh_or_admin
from app.models.candidat import Candidat
from app.models.candidature import Candidature
from app.models.employe import Employe
from app.models.paiement import Paiement
from app.models.offre import Offre

router = APIRouter(
    prefix="/rapports",
    tags=["Rapports"]
)

RAPPORT_DIR = "uploads/rapports"


def generate_pdf(title: str, headers: list, rows: list, file_path: str):
    c = canvas.Canvas(file_path, pagesize=landscape(A4))
    width, height = landscape(A4)

    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, height - 50, title)

    c.setFont("Helvetica", 9)
    c.drawString(40, height - 75, f"Date génération : {date.today()}")

    y = height - 110
    x_start = 40
    col_width = (width - 80) / len(headers)

    c.setFont("Helvetica-Bold", 8)

    for index, header in enumerate(headers):
        c.drawString(x_start + index * col_width, y, str(header))

    y -= 20
    c.setFont("Helvetica", 8)

    for row in rows:
        if y < 50:
            c.showPage()
            y = height - 60
            c.setFont("Helvetica", 8)

        for index, value in enumerate(row):
            text = str(value)[:35] if value is not None else ""
            c.drawString(x_start + index * col_width, y, text)

        y -= 18

    c.save()


@router.get("/candidatures")
def rapport_candidatures(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    os.makedirs(RAPPORT_DIR, exist_ok=True)

    candidatures = db.query(Candidature).all()
    rows = []

    for candidature in candidatures:
        candidat = db.query(Candidat).filter(
            Candidat.id == candidature.candidat_id
        ).first()

        offre = db.query(Offre).filter(
            Offre.id == candidature.offre_id
        ).first()

        rows.append([
            candidature.id,
            candidat.nom if candidat else "",
            candidat.prenom if candidat else "",
            candidat.email if candidat else "",
            offre.titre if offre else "",
            candidature.score,
            candidature.statut
        ])

    file_path = os.path.join(RAPPORT_DIR, "rapport_candidatures.pdf")

    generate_pdf(
        title="Rapport des Candidatures",
        headers=["ID", "Nom", "Prénom", "Email", "Offre", "Score", "Statut"],
        rows=rows,
        file_path=file_path
    )

    return FileResponse(
        path=file_path,
        filename="rapport_candidatures.pdf",
        media_type="application/pdf"
    )


@router.get("/employes")
def rapport_employes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    os.makedirs(RAPPORT_DIR, exist_ok=True)

    employes = db.query(Employe).all()
    rows = []

    for employe in employes:
        candidat = db.query(Candidat).filter(
            Candidat.id == employe.candidat_id
        ).first()

        offre = db.query(Offre).filter(
            Offre.id == employe.offre_id
        ).first()

        rows.append([
            employe.id,
            candidat.nom if candidat else "",
            candidat.prenom if candidat else "",
            candidat.email if candidat else "",
            employe.poste,
            offre.lieu if offre else "",
            employe.statut
        ])

    file_path = os.path.join(RAPPORT_DIR, "rapport_employes.pdf")

    generate_pdf(
        title="Rapport des Employés",
        headers=["ID", "Nom", "Prénom", "Email", "Poste", "Lieu", "Statut"],
        rows=rows,
        file_path=file_path
    )

    return FileResponse(
        path=file_path,
        filename="rapport_employes.pdf",
        media_type="application/pdf"
    )


@router.get("/paiements")
def rapport_paiements(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_rh_or_admin)
):
    os.makedirs(RAPPORT_DIR, exist_ok=True)

    paiements = db.query(Paiement).all()
    rows = []

    for paiement in paiements:
        employe = db.query(Employe).filter(
            Employe.id == paiement.employe_id
        ).first()

        candidat = None

        if employe:
            candidat = db.query(Candidat).filter(
                Candidat.id == employe.candidat_id
            ).first()

        rows.append([
            paiement.id,
            candidat.nom if candidat else "",
            candidat.prenom if candidat else "",
            employe.poste if employe else "",
            paiement.type_paiement,
            paiement.montant,
            paiement.statut,
            paiement.date_paiement
        ])

    file_path = os.path.join(RAPPORT_DIR, "rapport_paiements.pdf")

    generate_pdf(
        title="Rapport des Paiements",
        headers=["ID", "Nom", "Prénom", "Poste", "Type", "Montant", "Statut", "Date"],
        rows=rows,
        file_path=file_path
    )

    return FileResponse(
        path=file_path,
        filename="rapport_paiements.pdf",
        media_type="application/pdf"
    )