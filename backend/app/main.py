from fastapi import FastAPI

from app.database.database import Base, engine
from app.models.user import User
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.offres import router as offres_router
from app.models.offre import Offre

app = FastAPI(
    title="SmartRecruit RH API"
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(offres_router)


@app.get("/")
def root():
    return {
        "message": "SmartRecruit RH API"
    }