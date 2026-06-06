from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    nom: str
    email: EmailStr
    mot_de_passe: str
    role: str


class UserResponse(BaseModel):
    id: int
    nom: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True