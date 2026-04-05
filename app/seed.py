import csv
import json
import logging
import os
from datetime import datetime
from pathlib import Path

from sqlalchemy import text

from app.cache import cache
from app.database import SessionLocal

SEED_DIR = Path(os.getenv("SEED_DIR", "/app/seed"))
if not SEED_DIR.exists():
    SEED_DIR = Path(__file__).resolve().parents[1] / "backend" / "data"

logger = logging.getLogger("url_shortener")


async def load_seed_data():
    """Load seed data from CSV files into the database."""
    try:
        async with SessionLocal() as db:
            print("Starting seed: users...")
            existing_user_ids = set()
            
            # Get any pre-existing user IDs
            result = await db.execute(text("SELECT id FROM users"))
            for row in result:
                existing_user_ids.add(row[0])
            
            # Seed users first
            user_ids = await _seed_users(db)
            existing_user_ids.update(user_ids)
            await db.commit()
            
            print("Starting seed: urls...")
            existing_url_ids = set()
            
            # Get any pre-existing URL IDs
            result = await db.execute(text("SELECT id FROM urls"))
            for row in result:
                existing_url_ids.add(row[0])
            
            # Seed URLs (only for existing users)
            url_ids = await _seed_urls(db, existing_user_ids)
            existing_url_ids.update(url_ids)
            await db.commit()
            
            print("Starting seed: events...")
            # Seed events (only for existing users and URLs)
            await _seed_events(db, existing_user_ids, existing_url_ids)
            await db.commit()
            
            # Reset all sequences after seeding
            await db.execute(text("SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1))"))
            await db.execute(text("SELECT setval('urls_id_seq', COALESCE((SELECT MAX(id) FROM urls), 1))"))
            await db.execute(text("SELECT setval('events_id_seq', COALESCE((SELECT MAX(id) FROM events), 1))"))
            await db.commit()
            print("Seed complete.")
    except Exception as e:
        logger.error("seed_failed", extra={"error": str(e)})
        print(f"SEED FAILED: {e}")
        raise


async def _seed_users(db) -> set[int]:
    """Load users from users.csv. Returns set of successfully inserted user IDs."""
    csv_path = SEED_DIR / "users.csv"
    if not csv_path.exists():
        print(f"Users CSV not found at {csv_path}")
        return set()

    inserted_ids = set()

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                user_id = int(row["id"])
                username = row["username"]
                email = row["email"]
                created_at = datetime.fromisoformat(row["created_at"])

                # Only treat this user as valid if this exact ID exists.
                existing = await db.execute(
                    text("SELECT id FROM users WHERE id = :id"),
                    {"id": user_id}
                )
                if existing.scalar_one_or_none() is not None:
                    inserted_ids.add(user_id)
                    continue

                await db.execute(
                    text("""
                        INSERT INTO users (id, username, email, created_at)
                        VALUES (:id, :username, :email, :created_at)
                    """),
                    {
                        "id": user_id,
                        "username": username,
                        "email": email,
                        "created_at": created_at,
                    },
                )
                await db.commit()
                inserted_ids.add(user_id)
            except Exception:
                await db.rollback()
                continue

    print(f"Seeded {len(inserted_ids)} users")
    return inserted_ids


async def _seed_urls(db, valid_user_ids: set[int]) -> set[int]:
    """Load URLs from urls.csv. Returns set of successfully inserted URL IDs."""
    csv_path = SEED_DIR / "urls.csv"
    if not csv_path.exists():
        print(f"URLs CSV not found at {csv_path}")
        return set()

    inserted_ids = set()
    urls_to_cache = []

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                url_id = int(row["id"])
                user_id = int(row["user_id"])
                short_code = row["short_code"]
                original_url = row["original_url"]
                title = row["title"] if row["title"] else None
                is_active = row["is_active"] == "True"
                created_at = datetime.fromisoformat(row["created_at"])
                updated_at = datetime.fromisoformat(row["updated_at"])

                # Skip if user doesn't exist
                if user_id not in valid_user_ids:
                    continue

                # Check if URL already exists
                existing = await db.execute(
                    text("SELECT id FROM urls WHERE id = :id OR short_code = :short_code"),
                    {"id": url_id, "short_code": short_code}
                )
                if existing.scalar_one_or_none() is not None:
                    inserted_ids.add(url_id)
                    if is_active:
                        urls_to_cache.append((short_code, original_url))
                    continue

                await db.execute(
                    text("""
                        INSERT INTO urls (id, user_id, short_code, original_url, title, is_active, created_at, updated_at)
                        VALUES (:id, :user_id, :short_code, :original_url, :title, :is_active, :created_at, :updated_at)
                    """),
                    {
                        "id": url_id,
                        "user_id": user_id,
                        "short_code": short_code,
                        "original_url": original_url,
                        "title": title,
                        "is_active": is_active,
                        "created_at": created_at,
                        "updated_at": updated_at,
                    },
                )
                await db.commit()
                inserted_ids.add(url_id)

                if is_active:
                    urls_to_cache.append((short_code, original_url))
            except Exception:
                await db.rollback()
                continue

    # Cache all active URLs in Redis
    for short_code, original_url in urls_to_cache:
        await cache.set_url(short_code, original_url)

    print(f"Seeded {len(inserted_ids)} urls, cached {len(urls_to_cache)}")
    return inserted_ids


async def _seed_events(db, valid_user_ids: set[int], valid_url_ids: set[int]):
    """Load events from events.csv."""
    csv_path = SEED_DIR / "events.csv"
    if not csv_path.exists():
        print(f"Events CSV not found at {csv_path}")
        return

    count = 0
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                event_id = int(row["id"])
                url_id = int(row["url_id"]) if row["url_id"] else None
                user_id = int(row["user_id"]) if row["user_id"] else None
                event_type = row["event_type"]
                timestamp = datetime.fromisoformat(row["timestamp"])
                
                # Skip if referenced url_id doesn't exist
                if url_id is not None and url_id not in valid_url_ids:
                    continue
                
                # Skip if referenced user_id doesn't exist
                if user_id is not None and user_id not in valid_user_ids:
                    continue

                # Check if event already exists
                existing = await db.execute(
                    text("SELECT id FROM events WHERE id = :id"),
                    {"id": event_id}
                )
                if existing.scalar_one_or_none() is not None:
                    count += 1
                    continue

                # Parse details JSON
                details_str = row["details"]
                try:
                    details = json.loads(details_str)
                except json.JSONDecodeError:
                    details = {}

                await db.execute(
                    text("""
                        INSERT INTO events (id, url_id, user_id, event_type, timestamp, details)
                        VALUES (:id, :url_id, :user_id, :event_type, :timestamp, :details)
                    """),
                    {
                        "id": event_id,
                        "url_id": url_id,
                        "user_id": user_id,
                        "event_type": event_type,
                        "timestamp": timestamp,
                        "details": json.dumps(details),
                    },
                )
                await db.commit()
                count += 1
            except Exception:
                await db.rollback()
                continue

    print(f"Seeded {count} events")
