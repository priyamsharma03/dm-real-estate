import os
from dotenv import load_dotenv

# Load .env ONLY if it exists (for local dev)
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dm_real_estate.db")
IS_SQLITE = DATABASE_URL.startswith("sqlite")
CONNECT_ARGS = {"check_same_thread": False, "timeout": 30} if IS_SQLITE else {}

EMAIL_RECIPIENT = os.getenv("EMAIL_RECIPIENT", "dmrealestate07@gmail.com")
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
CLOUDINARY_FOLDER = os.getenv("CLOUDINARY_FOLDER", "dm-real-estate")