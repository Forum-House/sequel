import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import or_, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Event, User
from app.schemas import UserCreate, UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/bulk", status_code=status.HTTP_200_OK)
async def bulk_import_users(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    content = await file.read()
    text_stream = io.StringIO(content.decode("utf-8"))
    reader = csv.DictReader(text_stream)

    imported = 0
    for row in reader:
        id_val = (row.get("id") or "").strip()
        username = (row.get("username") or "").strip()
        email = (row.get("email") or "").strip()
        created_at_raw = (row.get("created_at") or "").strip()

        if not username or not email:
            continue

        if "@" not in email:
            continue

        created_at = datetime.utcnow()
        if created_at_raw:
            try:
                created_at = datetime.fromisoformat(created_at_raw)
            except ValueError:
                created_at = datetime.utcnow()

        try:
            if id_val and id_val.isdigit():
                user_id = int(id_val)
                user = User(id=user_id, username=username, email=email, created_at=created_at)
            else:
                user = User(username=username, email=email, created_at=created_at)
            
            db.add(user)
            await db.commit()
            await db.refresh(user)

            try:
                db.add(Event(
                    user_id=user.id,
                    url_id=None,
                    event_type="user_created",
                    details={"username": username, "email": email},
                ))
                await db.commit()
            except Exception:
                await db.rollback()
            imported += 1
        except IntegrityError:
            await db.rollback()
            continue

    # Reset sequence to max id after bulk import
    await db.execute(
        text("SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1))")
    )
    await db.commit()

    return {"imported_count": imported}


@router.get("", response_model=list[UserOut])
async def list_users(page: int | None = None, per_page: int | None = None, db: AsyncSession = Depends(get_db)):
    query = select(User).order_by(User.id)

    if page is not None or per_page is not None:
        current_page = page or 1
        current_per_page = per_page or 10
        offset = (current_page - 1) * current_per_page
        query = query.offset(offset).limit(current_per_page)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(or_(User.username == payload.username, User.email == payload.email)))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Username or email already exists")

    user = User(username=payload.username, email=payload.email)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    try:
        db.add(Event(
            user_id=user.id,
            url_id=None,
            event_type="user_created",
            details={"username": user.username, "email": user.email},
        ))
        await db.commit()
    except Exception:
        await db.rollback()
    await db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserOut)
async def update_user(user_id: int, payload: UserUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.username is not None:
        user.username = payload.username
    if payload.email is not None:
        user.email = payload.email

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Username or email already exists")

    await db.refresh(user)
    return user
