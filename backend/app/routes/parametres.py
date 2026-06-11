from fastapi import APIRouter, Depends, Form
from app.core.deps import require_rh_or_admin
from app.services.system_config_service import get_system_config, save_system_config

router = APIRouter(
    prefix="/parametres",
    tags=["Paramètres"]
)


@router.get("/email")
def get_email_config(
    current_user: dict = Depends(require_rh_or_admin)
):
    config = get_system_config()

    return {
        "smtp_email": config.get("smtp_email"),
        "smtp_password_configured": bool(config.get("smtp_password"))
    }


@router.post("/email")
def save_email_config(
    smtp_email: str = Form(...),
    smtp_password: str = Form(...),
    current_user: dict = Depends(require_rh_or_admin)
):
    save_system_config({
        "smtp_email": smtp_email,
        "smtp_password": smtp_password
    })

    return {
        "message": "Configuration email enregistrée avec succès",
        "smtp_email": smtp_email
    }