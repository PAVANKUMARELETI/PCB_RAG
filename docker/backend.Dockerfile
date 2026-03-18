FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.docker.txt /tmp/requirements.docker.txt
RUN pip install --upgrade pip \
    && pip install -r /tmp/requirements.docker.txt

COPY backend /app/backend
COPY chatbot /app/chatbot

RUN mkdir -p /app/docs /app/vector_store /app/models

ENV PYTHONPATH=/app/backend:/app/chatbot
WORKDIR /app/backend

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
