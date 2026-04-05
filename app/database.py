import os
from collections.abc import AsyncGenerator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

load_dotenv()

DATABASE_POOL_MAX = int(os.getenv("DATABASE_POOL_MAX", "10"))


def _get_database_url() -> str:
    url = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/sequel")
    return url.replace("postgresql://", "postgresql+asyncpg://")


engine = create_async_engine(
    _get_database_url(),
    pool_size=DATABASE_POOL_MAX,
    max_overflow=0,
    pool_pre_ping=True,
)

SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
