import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

load_dotenv()

DATABASE_POOL_MAX = int(os.getenv("DATABASE_POOL_MAX", "10"))

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/sequel_test",
)

engine = create_engine(
    DATABASE_URL,
    pool_size=DATABASE_POOL_MAX,
    max_overflow=0,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session
