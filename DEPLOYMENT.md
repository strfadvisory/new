# Production Deployment Guide

## Quick Deploy on Server

### 1. Clone Repository
```bash
ssh root@187.77.185.135
cd /root
git clone YOUR_REPO_URL strf
cd strf
```

### 2. Configure Environment
```bash
cp .env.example .env
nano .env
```

### 3. Deploy
```bash
npm run deploy:prod
```

Done! ✅

## Access Application
- Frontend: http://187.77.185.135
- Backend: http://187.77.185.135:5000

## Other Commands
```bash
npm run logs      # View logs
npm run stop      # Stop containers
npm run restart   # Restart containers
npm run status    # Check status
```

## Update & Redeploy
```bash
git pull
npm run deploy:prod
```
