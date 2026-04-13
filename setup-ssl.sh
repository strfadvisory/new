#!/bin/bash

echo "🔒 Setting up SSL for reportdemo.online..."

# Stop containers
echo "🛑 Stopping containers..."
docker-compose -f docker-compose.prod.yml down

# Install Certbot
echo "📦 Installing Certbot..."
sudo apt update
sudo apt install certbot -y

# Create SSL directory
echo "📁 Creating SSL directory..."
sudo mkdir -p /etc/nginx/ssl

# Get SSL certificate (standalone mode)
echo "🔐 Obtaining SSL certificate..."
sudo certbot certonly --standalone \
  -d reportdemo.online \
  -d www.reportdemo.online \
  --non-interactive \
  --agree-tos \
  --email strfadvisory@gmail.com

# Create symbolic links for nginx
echo "🔗 Creating certificate links..."
sudo ln -sf /etc/letsencrypt/live/reportdemo.online/fullchain.pem /etc/nginx/ssl/cert.pem
sudo ln -sf /etc/letsencrypt/live/reportdemo.online/privkey.pem /etc/nginx/ssl/key.pem

# Set permissions
sudo chmod 755 /etc/letsencrypt/live
sudo chmod 755 /etc/letsencrypt/archive

# Restart containers
echo "🚀 Restarting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Setup auto-renewal
echo "⏰ Setting up auto-renewal..."
(sudo crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'docker-compose -f $(pwd)/docker-compose.prod.yml restart client'") | sudo crontab -

echo ""
echo "✅ SSL setup complete!"
echo "🌐 Your site is now available at:"
echo "   - http://reportdemo.online"
echo "   - http://reportdemo.online (redirects to http)"
echo ""
echo "📝 Certificate will auto-renew every 90 days"
