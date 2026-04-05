import os
from inspect import isawaitable

from redis import asyncio as redis


class RedisCache:
    def __init__(self) -> None:
        self.client: redis.Redis | None = None
        self.ttl = int(os.getenv("REDIS_CACHE_TTL_SECONDS", "60"))

    async def connect(self) -> None:
        socket_timeout = float(os.getenv("REDIS_SOCKET_TIMEOUT_SECONDS", "0.3"))
        socket_connect_timeout = float(os.getenv("REDIS_SOCKET_CONNECT_TIMEOUT_SECONDS", "0.3"))
        self.client = redis.Redis(
            host=os.getenv("REDIS_HOST", "redis"),
            port=int(os.getenv("REDIS_PORT", "6379")),
            db=int(os.getenv("REDIS_DB", "0")),
            password=os.getenv("REDIS_PASSWORD") or None,
            decode_responses=True,
            socket_timeout=socket_timeout,
            socket_connect_timeout=socket_connect_timeout,
            retry_on_timeout=False,
        )
        try:
            ping_result = self.client.ping()
            if isawaitable(ping_result):
                await ping_result
        except Exception:
            self.client = None

    async def close(self) -> None:
        if self.client is not None:
            await self.client.aclose()
            self.client = None

    async def get_url(self, short_code: str) -> str | None:
        if self.client is None:
            return None
        try:
            return await self.client.get(f"short:{short_code}")
        except Exception:
            return None

    async def set_url(self, short_code: str, original_url: str) -> None:
        if self.client is None:
            return
        try:
            await self.client.set(f"short:{short_code}", original_url, ex=self.ttl)
        except Exception:
            return

    async def delete_url(self, short_code: str) -> None:
        if self.client is None:
            return
        try:
            await self.client.delete(f"short:{short_code}")
        except Exception:
            return


cache = RedisCache()
