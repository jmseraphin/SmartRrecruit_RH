import os
import shutil
from fastapi import UploadFile

UPLOAD_DIR = "uploads/cv"

ALLOWED_EXTENSIONS = [".pdf", ".docx"]


def save_file(file: UploadFile) -> dict:
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    filename = file.filename
    extension = os.path.splitext(filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Format de fichier non autorisé. PDF ou DOCX seulement.")

    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "filename": filename,
        "path": file_path
    }


def delete_file(path: str):
    if path and os.path.exists(path):
        os.remove(path)


def get_file_url(path: str):
    return path