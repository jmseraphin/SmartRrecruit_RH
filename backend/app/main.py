from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import Base, engine

from app.models.user import User
from app.models.offre import Offre
from app.models.candidat import Candidat
from app.models.candidature import Candidature
from app.models.employe import Employe
from app.models.contrat import Contrat
from app.models.mission import Mission
from app.models.paiement import Paiement
from app.models.evaluation import Evaluation
from app.models.attestation import Attestation

from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.offres import router as offres_router
from app.routes.candidats import router as candidats_router
from app.routes.upload import router as upload_router
from app.routes.candidatures import router as candidatures_router
from app.routes.employes import router as employes_router
from app.routes.contrats import router as contrats_router
from app.routes.missions import router as missions_router
from app.routes.paiements import router as paiements_router
from app.routes.evaluations import router as evaluations_router
from app.routes.attestations import router as attestations_router
from app.routes.dashboard import router as dashboard_router
from app.routes.soldes import router as soldes_router
from app.routes.rapports import router as rapports_router
from app.routes.notifications import router as notifications_router
from app.routes.parametres import router as parametres_router


app = FastAPI(
    title="SmartRecruit RH API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(offres_router)
app.include_router(candidats_router)
app.include_router(upload_router)
app.include_router(candidatures_router)
app.include_router(employes_router)
app.include_router(contrats_router)
app.include_router(missions_router)
app.include_router(paiements_router)
app.include_router(evaluations_router)
app.include_router(attestations_router)
app.include_router(dashboard_router)
app.include_router(soldes_router)
app.include_router(rapports_router)
app.include_router(notifications_router)
app.include_router(parametres_router)

@app.get("/")
def root():
    return {
        "message": "SmartRecruit RH API"
    }