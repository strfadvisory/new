#!/bin/bash

echo "🚀 Starting deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for containers to start
echo "⏳ Waiting for containers to start..."
sleep 5

# Check status
echo "✅ Checking container status..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🎉 Deployment complete!"
echo "📱 Frontend: http://$(hostname -I | awk '{print $1}')"
echo "🔌 Backend: http://$(hostname -I | awk '{print $1}'):5000"
echo ""
echo "📊 View logs: npm run logs"
echo "🔄 Restart: npm run restart"
echo "🛑 Stop: npm run stop"
