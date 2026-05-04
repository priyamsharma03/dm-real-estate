from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel, Session, create_engine

from .config import CONNECT_ARGS, DATABASE_URL, IS_SQLITE

engine_kwargs = {"echo": False, "connect_args": CONNECT_ARGS}
if IS_SQLITE:
    engine_kwargs["poolclass"] = StaticPool

engine = create_engine(DATABASE_URL, **engine_kwargs)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session() -> Session:
    return Session(engine)
