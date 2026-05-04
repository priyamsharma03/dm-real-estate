from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ..models.user import UserProfile
from ..services.auth_service import require_admin
from ..services.cloudinary_service import upload_image

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.post("/images", response_model=list[str])
def upload_images(
    files: list[UploadFile] = File(...),
    current_user: UserProfile = Depends(require_admin),
) -> list[str]:
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    urls: list[str] = []
    for file in files:
        try:
            urls.append(upload_image(file))
        finally:
            try:
                file.file.close()
            except Exception:
                pass

    return urls
