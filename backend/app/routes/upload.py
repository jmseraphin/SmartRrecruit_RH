from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.storage_service import save_file

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)


@router.post("/cv")
def upload_cv(file: UploadFile = File(...)):
    try:
        result = save_file(file)

        return {
            "message": "CV uploadé avec succès",
            "filename": result["filename"],
            "path": result["path"]
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )