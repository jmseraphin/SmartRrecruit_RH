import re
import fitz
from docx import Document


def extract_text_from_pdf(file_path: str):
    text = ""

    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
        doc.close()
    except Exception:
        return ""

    return text.lower()


def extract_text_from_docx(file_path: str):
    try:
        doc = Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs]).lower()
    except Exception:
        return ""


def extract_text_from_file(file_path: str):
    path = file_path.lower()

    if path.endswith(".pdf"):
        return extract_text_from_pdf(file_path)

    if path.endswith(".docx"):
        return extract_text_from_docx(file_path)

    if path.endswith(".txt"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read().lower()
        except Exception:
            return ""

    return ""


def count_experience_years(text: str):
    years = re.findall(r"(\d+)\s*(ans|année|années|year|years)", text)
    total = 0

    for y, _ in years:
      total = max(total, int(y))

    return total


def detect_diplome(text: str):
    mots = [
        "baccalauréat", "bac", "licence", "master", "doctorat",
        "diplôme", "certificat", "bts", "dut", "formation"
    ]

    return any(mot in text for mot in mots)


def detect_attestation_travail(text: str):
    mots = [
        "attestation de travail",
        "certificat de travail",
        "a travaillé",
        "experience professionnelle",
        "expérience professionnelle",
        "poste occupé",
        "employé"
    ]

    return any(mot in text for mot in mots)


def calculate_score_from_dossier(offre, dossier_path: str, competences_candidat: str = ""):
    text = extract_text_from_file(dossier_path)

    score = 0

    competences_requises = offre.competences_requises or []
    criteres = offre.criteres_score or {}

    poids_competences = criteres.get("competences", 40)
    poids_experience = criteres.get("experience", 30)
    poids_formation = criteres.get("formation", 30)

    source_text = f"{text} {competences_candidat}".lower()

    if competences_requises:
        matched = 0

        for competence in competences_requises:
            if competence.lower() in source_text:
                matched += 1

        score += (matched / len(competences_requises)) * poids_competences

    experience_years = count_experience_years(text)

    if offre.experience_min and offre.experience_min > 0:
        experience_score = min(experience_years / offre.experience_min, 1) * poids_experience
    else:
        experience_score = poids_experience if experience_years > 0 else 0

    score += experience_score

    if detect_diplome(text):
        score += poids_formation * 0.6

    if detect_attestation_travail(text):
        score += poids_formation * 0.4

    return round(min(score, 100), 2)