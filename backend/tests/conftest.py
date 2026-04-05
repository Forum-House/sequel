import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

import uuid
from collections.abc import AsyncGenerator
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/sequel_test",
)
os.environ.setdefault("REDIS_HOST", "localhost")
os.environ.setdefault("REDIS_PORT", "6379")

from app.main import app


def _database_url() -> str:
    url = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/sequel_test")
    # asyncpg requires postgresql+asyncpg:// scheme
    return url.replace("postgresql://", "postgresql+asyncpg://")


@pytest.fixture(scope="session")
def base_url() -> str:
    return os.getenv("BASE_URL", "http://localhost")


@pytest.fixture(scope="session")
def db_engine():
    engine = create_async_engine(_database_url(), pool_pre_ping=True)
    return engine


@pytest.fixture(scope="session", autouse=True)
async def setup_database(db_engine) -> AsyncGenerator[None, None]:
    init_sql_path = Path(__file__).resolve().parents[2] / "init.sql"
    sql_text = init_sql_path.read_text(encoding="utf-8")
    statements = [stmt.strip() for stmt in sql_text.split(";") if stmt.strip()]

    async with db_engine.begin() as conn:
        for stmt in statements:
            await conn.execute(text(stmt))

    yield

    async with db_engine.begin() as conn:
        await conn.execute(text("TRUNCATE TABLE events, urls, users RESTART IDENTITY CASCADE"))

    await db_engine.dispose()


@pytest.fixture
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    session_factory = async_sessionmaker(bind=db_engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session


@pytest.fixture
async def client(base_url: str) -> AsyncGenerator[AsyncClient, None]:
    async with app.router.lifespan_context(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport,
            base_url=base_url,
            follow_redirects=False,
            timeout=20.0,
        ) as async_client:
            yield async_client


def unique_username(prefix: str = "testuser") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"


def unique_email(prefix: str = "test") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}@example.com"
