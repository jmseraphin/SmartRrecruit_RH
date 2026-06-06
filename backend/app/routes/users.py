from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.database.database import settings

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

security = HTTPBearer()


@router.get("/me")
def get_me(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        return {
            "email": payload.get("sub"),
            "role": payload.get("role")
        }

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token invalide"
        )