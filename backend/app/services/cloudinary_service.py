import logging

from cloudinary import config as cloudinary_config
from cloudinary import uploader
from fastapi import HTTPException, UploadFile

from ..core.config import (
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_FOLDER,
)


def _ensure_cloudinary_configured() -> None:
    if not (CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET):
        raise HTTPException(status_code=500, detail="Cloudinary is not configured.")

    cloudinary_config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True,
    )


def upload_image(file: UploadFile) -> str:
    _ensure_cloudinary_configured()

    try:
        result = uploader.upload(
            file.file,
            folder=CLOUDINARY_FOLDER,
            resource_type="image",
        )
    except Exception:
        logging.exception("Cloudinary upload failed")
        raise HTTPException(status_code=500, detail="Cloudinary upload failed.")

    url = result.get("secure_url")
    if not url:
        raise HTTPException(status_code=500, detail="Cloudinary upload failed.")

    return url
