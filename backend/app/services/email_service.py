import smtplib
from email.message import EmailMessage

from app.database.database import settings


def send_email_with_attachment(to_email: str, subject: str, body: str, file_path: str):
    if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD:
        return False

    msg = EmailMessage()
    msg["From"] = settings.SMTP_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    with open(file_path, "rb") as f:
        file_data = f.read()
        file_name = file_path.split("\\")[-1]

    msg.add_attachment(
        file_data,
        maintype="application",
        subtype="pdf",
        filename=file_name
    )

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
        smtp.send_message(msg)

    return True