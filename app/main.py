import logging
import signal
import time
from contextlib import asynccontextmanager
from uuid import uuid4

import psutil
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from pythonjsonlogger.json import JsonFormatter

from app.cache import cache
from app.database import engine
from app.routers.events import router as events_router
from app.routers.urls import router as urls_router
from app.routers.users import router as users_router
from app.seed import load_seed_data


def setup_logging() -> None:
    root_logger = logging.getLogger()
    root_logger.handlers.clear()

    handler = logging.StreamHandler()
    formatter = JsonFormatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
        rename_fields={"asctime": "timestamp", "levelname": "level", "name": "logger"},
    )
    handler.setFormatter(formatter)
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)


setup_logging()
logger = logging.getLogger("url_shortener")
START_TIME = time.time()
request_count = 0


@asynccontextmanager
async def lifespan(_: FastAPI):
    await cache.connect()
    try:
        await load_seed_data()
    except Exception as exc:
        logger.error("seed_failed", extra={"error": str(exc)})
        raise

    def _sigterm_handler(*_args):
        logger.info("received_sigterm", extra={"extra": {"event": "shutdown"}})

    try:
        signal.signal(signal.SIGTERM, _sigterm_handler)
    except ValueError:
        pass

    yield

    await cache.close()
    await engine.dispose()


app = FastAPI(lifespan=lifespan, redirect_slashes=False)
Instrumentator().instrument(app).expose(app, endpoint="/metrics/prometheus")


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    global request_count
    request_id = request.headers.get("X-Request-ID") or str(uuid4())
    started = time.perf_counter()
    request_count += 1

    try:
        response = await call_next(request)
    except Exception as exc:
        duration_ms = round((time.perf_counter() - started) * 1000, 2)
        logger.exception(
            "request_failed",
            extra={
                "extra": {
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": 500,
                    "duration_ms": duration_ms,
                    "error": str(exc),
                }
            },
        )
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    duration_ms = round((time.perf_counter() - started) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    logger.info(
        "request_completed",
        extra={
            "extra": {
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            }
        },
    )
    return response


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/metrics")
async def metrics():
    virtual_mem = psutil.virtual_memory()
    return {
        "cpu_percent": psutil.cpu_percent(interval=0.1),
        "memory_percent": virtual_mem.percent,
        "memory_used_mb": round(virtual_mem.used / 1024 / 1024, 2),
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "total_requests": request_count,
        "status": "healthy",
    }


app.include_router(users_router)
app.include_router(events_router)
app.include_router(urls_router)
