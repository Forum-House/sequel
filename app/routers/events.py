from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Event
from app.schemas import EventOut

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventOut])
async def list_events(
    user_id: Optional[int] = Query(default=None),
    url_id: Optional[int] = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Event).order_by(Event.id)
    if user_id is not None:
        query = query.where(Event.user_id == user_id)
    if url_id is not None:
        query = query.where(Event.url_id == url_id)
    try:
        result = await db.execute(query)
        return result.scalars().all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
