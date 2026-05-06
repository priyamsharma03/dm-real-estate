from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from .core.database import engine, init_db
from .data.seed_properties import SEED_PROPERTIES
from .models.property import Property
from .routers import auth, inquiries, locations, properties, uploads

ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")
load_dotenv(ROOT_DIR / "backend" / ".env")

app = FastAPI(title="DM Real Estate API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200","https://dm-realestate.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    seed_db()


def seed_db() -> None:
    with Session(engine) as session:
        existing = session.exec(select(Property).limit(1)).first()
        if existing:
            return
        for item in SEED_PROPERTIES:
            session.add(Property(**item))
        session.commit()


app.include_router(auth.router)
app.include_router(inquiries.router)
app.include_router(locations.router)
app.include_router(properties.router)
app.include_router(uploads.router)
