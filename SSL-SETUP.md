# SSL Setup for reportdemo.online

## Quick Setup

### 1. Deploy Application
```bash
npm run deploy:prod
```

### 2. Setup SSL Certificate
```bash
npm run setup:ssl
```

That's it! Your site will be available at both:
- **https://reportdemo.online** (secure)
- **http://reportdemo.online** (also works)

## Manual SSL Setup (Alternative)

If you prefer manual setup:

```bash
# Stop containers
docker-compose -f docker-compose.prod.yml down

# Install Certbot
sudo apt update
sudo apt install certbot -y

# Get certificate
sudo certbot certonly --standalone \
  -d reportdemo.online \
  -d www.reportdemo.online

# Create links
sudo mkdir -p /etc/nginx/ssl
sudo ln -sf /etc/letsencrypt/live/reportdemo.online/fullchain.pem /etc/nginx/ssl/cert.pem
sudo ln -sf /etc/letsencrypt/live/reportdemo.online/privkey.pem /etc/nginx/ssl/key.pem

# Restart containers
docker-compose -f docker-compose.prod.yml up -d
```

## Certificate Renewal

Certificates auto-renew via cron job. To manually renew:

```bash
sudo certbot renew
docker-compose -f docker-compose.prod.yml restart client
```

## Troubleshooting

### Port 80/443 already in use
```bash
sudo systemctl stop nginx
sudo fuser -k 80/tcp
sudo fuser -k 443/tcp
```

### Check certificate status
```bash
sudo certbot certificates
```

### View logs
```bash
npm run logs:client
```

## Configuration Files Updated

- ✅ `client/nginx.conf` - Supports both HTTP (80) and HTTPS (443)
- ✅ `client/Dockerfile.prod` - Exposes both ports
- ✅ `docker-compose.prod.yml` - Maps ports and SSL volumes
- ✅ `deploy.sh` - Uses HTTPS domain
- ✅ `package.json` - Added `setup:ssl` script
