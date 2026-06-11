import smtplib
from email.message import EmailMessage

from app.database.database import settings
from app.services.system_config_service import get_system_config


def get_email_credentials():
    config = get_system_config()

    smtp_email = config.get("smtp_email") or settings.SMTP_EMAIL
    smtp_password = config.get("smtp_password") or settings.SMTP_PASSWORD

    return smtp_email, smtp_password


def send_email_with_attachment(to_email: str, subject: str, body: str, file_path: str):
    smtp_email, smtp_password = get_email_credentials()

    if not smtp_email or not smtp_password:
        return False

    msg = EmailMessage()
    msg["From"] = smtp_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    with open(file_path, "rb") as f:
        file_data = f.read()
        file_name = file_path.split("\\")[-1].split("/")[-1]

    msg.add_attachment(
        file_data,
        maintype="application",
        subtype="pdf",
        filename=file_name
    )

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(smtp_email, smtp_password)
        smtp.send_message(msg)

    return True