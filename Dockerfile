FROM python:3.13-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
COPY app ./app

RUN pip install --no-cache-dir \
    fastapi \
    a2wsgi \
    uvicorn[standard] \
    asyncpg \
    sqlalchemy \
    redis \
    psutil \
    python-json-logger \
    prometheus-fastapi-instrumentator \
    python-dotenv \
    python-multipart \
    pydantic

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
