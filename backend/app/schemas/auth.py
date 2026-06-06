from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    mot_de_passe: str