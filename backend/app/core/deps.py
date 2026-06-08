from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.database.database import settings

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        email = payload.get("sub")
        role = payload.get("role")

        if not email or not role:
            raise HTTPException(status_code=401, detail="Token invalide")

        return {
            "email": email,
            "role": role
        }

    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")


def require_roles(roles: list[str]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in roles:
            raise HTTPException(
                status_code=403,
                detail="Accès refusé"
            )

        return current_user

    return role_checker


def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Accès ADMIN requis")

    return current_user


def require_rh_or_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["ADMIN", "RH"]:
        raise HTTPException(status_code=403, detail="Accès RH ou ADMIN requis")

    return current_user