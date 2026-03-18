# Deploy RAG Chatbot on EC2 with Docker

This guide uses Docker Compose and deploys:
- `backend` (FastAPI)
- `frontend` (Vite static build served by Nginx)

Frontend listens on port `80` and proxies `/chat`, `/documents`, `/health` to backend.

## 1. Prerequisites on EC2

Use Ubuntu 22.04/24.04 instance and open Security Group inbound:
- `22` (SSH)
- `80` (HTTP)

Install Docker + Compose plugin:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

## 2. Pull code from GitHub

```bash
git clone <YOUR_GITHUB_REPO_URL> rag-chatbot
cd rag-chatbot
```

## 3. Configure environment

Create `.env` from `.env.example` and set production values:

```bash
cp .env.example .env
```

Minimum required values:

```env
HOST=0.0.0.0
PORT=8000
OPENAI_API_KEY=<your-openai-key>
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_MODEL=text-embedding-3-small
```

Optional but recommended for your domain:

```env
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
LOG_LEVEL=INFO
K=2
CHUNK_SIZE=1000
CHUNK_OVERLAP=50
```

## 4. Build and run

```bash
docker compose up -d --build
```

Check status:

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

Verify health:

```bash
curl http://<EC2_PUBLIC_IP>/health
```

Open app:
- `http://<EC2_PUBLIC_IP>/`

## 5. Update deployment after pushing new code

```bash
cd rag-chatbot
git pull
docker compose up -d --build
```

## 6. Useful operations

Stop:

```bash
docker compose down
```

Restart only backend:

```bash
docker compose up -d --build backend
```

Cleanup dangling images:

```bash
docker image prune -f
```
