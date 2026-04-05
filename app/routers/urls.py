import asyncio
import logging
import random
import string
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from pydantic import BaseModel, field_validator

from app.cache import cache
from app.database import get_db
from app.models import Event, URL, User
from app.schemas import URLOut, URLUpdate


class URLCreate(BaseModel):
    user_id: int
    original_url: str
    title: str | None = None

    @field_validator("original_url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        from urllib.parse import urlparse
        parsed = urlparse(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("Invalid URL format")
        return value

router = APIRouter(tags=["urls"])
logger = logging.getLogger("url_shortener")


def _generate_short_code(length: int = 6) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(random.choices(alphabet, k=length))


async def _create_unique_short_code(db: AsyncSession) -> str:
    for _ in range(50):
        code = _generate_short_code(6)
        result = await db.execute(select(URL.id).where(URL.short_code == code))
        if result.scalar_one_or_none() is None:
            return code
    raise HTTPException(status_code=500, detail="Could not generate short code")


@router.post("/urls", response_model=URLOut, status_code=status.HTTP_201_CREATED)
async def create_url(payload: URLCreate, db: AsyncSession = Depends(get_db)):
    user_id = payload.user_id
    original_url = payload.original_url
    title = payload.title

    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    short_code = await _create_unique_short_code(db)
    new_url = URL(
        user_id=user_id,
        short_code=short_code,
        original_url=original_url,
        title=title,
        is_active=True,
    )
    db.add(new_url)

    await db.flush()
    created_event = Event(
        url_id=new_url.id,
        user_id=user_id,
        event_type="url_created",
        details={"short_code": short_code, "original_url": original_url},
    )
    db.add(created_event)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        short_code = await _create_unique_short_code(db)
        new_url.short_code = short_code
        db.add(new_url)
        await db.commit()

    await db.refresh(new_url)
    await cache.set_url(new_url.short_code, new_url.original_url)
    logger.info("url_created", extra={"url_id": new_url.id, "short_code": new_url.short_code})
    return new_url


@router.get("/urls", response_model=list[URLOut])
async def list_urls(user_id: int | None = None, db: AsyncSession = Depends(get_db)):
    query = select(URL).order_by(URL.id)
    if user_id is not None:
        query = query.where(URL.user_id == user_id)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/urls/{url_id}", response_model=URLOut)
async def get_url(url_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(URL).where(URL.id == url_id))
    url = result.scalar_one_or_none()
    if url is None:
        raise HTTPException(status_code=404, detail="URL not found")
    return url


@router.put("/urls/{url_id}", response_model=URLOut)
async def update_url(url_id: int, payload: URLUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(URL).where(URL.id == url_id))
    url = result.scalar_one_or_none()
    if url is None:
        raise HTTPException(status_code=404, detail="URL not found")

    if payload.title is not None:
        url.title = payload.title

    if payload.is_active is not None:
        url.is_active = payload.is_active
        if payload.is_active is False:
            db.add(
                Event(
                    url_id=url.id,
                    user_id=url.user_id,
                    event_type="url_deactivated",
                    details={"short_code": url.short_code},
                )
            )

    url.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(url)

    if payload.is_active is False:
        await cache.delete_url(url.short_code)

    return url


@router.delete("/urls/{url_id}", response_model=URLOut)
async def delete_url(url_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(URL).where(URL.id == url_id))
    url = result.scalar_one_or_none()
    if url is None:
        raise HTTPException(status_code=404, detail="URL not found")

    if url.is_active:
        url.is_active = False
        url.updated_at = datetime.utcnow()
        db.add(
            Event(
                url_id=url.id,
                user_id=url.user_id,
                event_type="url_deactivated",
                details={"short_code": url.short_code},
            )
        )
        await db.commit()
        await db.refresh(url)

    await cache.delete_url(url.short_code)
    return url


@router.get("/{short_code}")
async def redirect_short_code(short_code: str, request: Request, db: AsyncSession = Depends(get_db)):
    cached_original_url = None
    try:
        cached_original_url = await cache.get_url(short_code)
    except Exception:
        pass

    try:
        result = await asyncio.wait_for(
            db.execute(select(URL).where(URL.short_code == short_code)),
            timeout=5.0
        )
        url = result.scalar_one_or_none()
    except asyncio.TimeoutError:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")
    except Exception:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")

    if url is None or url.is_active is False:
        logger.warning("url_not_found", extra={"short_code": short_code})
        raise HTTPException(status_code=404, detail="URL not found")

    cache_hit = cached_original_url is not None
    destination = cached_original_url or url.original_url
    if cached_original_url is None:
        try:
            await cache.set_url(short_code, destination)
        except Exception:
            pass

    try:
        db.add(
            Event(
                url_id=url.id,
                user_id=url.user_id,
                event_type="url_visited",
                details={"short_code": short_code, "path": str(request.url.path)},
            )
        )
        await db.commit()
    except Exception:
        pass

    headers = {
        "X-Cache": "HIT" if cache_hit else "MISS",
        "X-Cache-TTL": str(cache.ttl),
    }
    logger.info(
        "url_redirect",
        extra={
            "short_code": short_code,
            "user_agent": request.headers.get("user-agent"),
            "cache": headers["X-Cache"],
        },
    )
    return RedirectResponse(url=destination, status_code=302, headers=headers)
