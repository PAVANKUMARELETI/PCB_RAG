# Deploy RAG Chatbot on EC2 via GHCR Images

This flow avoids local-vs-EC2 build differences by running the exact images published by GitHub Actions.

## 1. One-time setup on EC2

Install Docker and Compose plugin (if not installed):

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

Install Git LFS (required for large docs in this repository):

```bash
sudo apt-get update
sudo apt-get install -y git-lfs
```

## 2. Pull repository

```bash
git clone <YOUR_REPO_URL> rag-chatbot
cd rag-chatbot
```

## 3. Configure runtime env

Create your runtime .env file:

```bash
cp .env.example .env
```

Set required values in .env, at minimum:

```env
OPENAI_API_KEY=<your-key>
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_MODEL=text-embedding-3-small
HOST=0.0.0.0
PORT=8000
```

## 4. Authenticate to GHCR

Create a GitHub personal access token with read:packages scope.

```bash
export GHCR_USER=<github-username>
export GHCR_PAT=<github-token-with-read-packages>
echo "$GHCR_PAT" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
```

## 5. Configure image source

Set your repository owner in lowercase:

```bash
export GHCR_OWNER=<github-owner-lowercase>
```

Use one of these deployment modes:

- latest image:

```bash
export IMAGE_TAG=latest
```

- exact commit image (recommended):

```bash
export IMAGE_TAG=<full-git-sha-from-main>
```

## 6. Deploy from GHCR images

```bash
docker compose -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.ghcr.yml up -d
docker compose -f docker-compose.ghcr.yml ps
```

Check logs:

```bash
docker compose -f docker-compose.ghcr.yml logs -f --tail=200 backend
docker compose -f docker-compose.ghcr.yml logs -f --tail=200 frontend
```

Health check:

```bash
curl http://<EC2_PUBLIC_IP>/health
```

## 7. Updating deployment safely

For deterministic updates, deploy by commit SHA:

```bash
cd ~/rag-chatbot
git fetch --all --prune
git checkout main
git pull origin main
export GHCR_OWNER=<github-owner-lowercase>
export IMAGE_TAG=<target-full-git-sha>
docker compose -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.ghcr.yml up -d
```

## 8. Re-import docs after clean backend state

If backend metadata resets (for example after container recreation), reimport docs:

```bash
/tmp/import_docs.sh
```

Then verify count:

```bash
docker exec rag-backend sh -lc 'curl -sS http://localhost:8000/documents | python3 -c "import sys,json; d=json.load(sys.stdin); print(\"documents:\", len(d.get(\"documents\", [])))"'
```
