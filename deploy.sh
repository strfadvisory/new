#!/bin/bash

echo "🚀 Starting deployment..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# MongoDB Configuration
MONGO_URI=mongodb+srv://anupamurl:Espl%40123@strf.liiptbb.mongodb.net/simulator

# JWT Secret
JWT_SECRET=9f8c2d4a6e7b8c1d3f5a7b9c2d4e6f8a9b1c3d5e7f9a2b4c6d8e0f1a3b5c7d9e

# Client Configuration
CLIENT_URL=http://187.77.185.135
REACT_APP_API_URL=http://187.77.185.135/api

# Email Configuration
EMAIL_USER=strfadvisory@gmail.com
EMAIL_PASS=sqwpwenvliutmjcr
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=strfadvisory@gmail.com
MAIL_PASSWORD=sqwpwenvliutmjcr
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=strfadvisory@gmail.com
MAIL_FROM_NAME="Reserve Fund Advisors"

# Server Configuration
PORT=5000
NODE_ENV=production
EOF
    echo "✅ .env file created"
fi

# Install dependencies
echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

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
echo "📱 Frontend: http://187.77.185.135"
echo "🔌 Backend API: http://187.77.185.135/api"
echo ""
echo "📊 View logs: npm run logs"
echo "🔄 Restart: npm run restart"
echo "🛑 Stop: npm run stop"
