#!/bin/bash

echo "🔍 Checking backend status..."
echo ""

echo "📊 Container Status:"
docker ps -a | grep strf

echo ""
echo "📝 Backend Logs (last 100 lines):"
docker logs strf-server --tail 100

echo ""
echo "🌐 Testing backend health:"
curl -s http://localhost:5000/health || echo "Health check failed"

echo ""
echo "🌐 Testing backend API:"
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' || echo "API test failed"
