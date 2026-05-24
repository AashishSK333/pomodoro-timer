FROM python:3.13-alpine AS builder
RUN apk add --no-cache gcc musl-dev libffi-dev
WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.13-alpine
COPY --from=builder /install /usr/local
WORKDIR /app
COPY . .
RUN mkdir -p /data
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
