FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy source code
COPY backend backend
COPY .env.example .env.example

ENV PYTHONPATH=/app
ENV PORT=8000

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]
