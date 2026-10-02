FROM python:3.11-slim

WORKDIR /app

# System deps needed for psycopg (libpq) and building some wheels.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/uploads /app/data/vector_store

EXPOSE 8000

# Run migrations then start the API. In production, prefer running
# `alembic upgrade head` as a separate release step instead.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
