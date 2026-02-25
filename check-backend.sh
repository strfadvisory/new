#!/bin/bash

echo "🔍 Checking backend status..."
echo ""

echo "📊 Container Status:"
docker ps -a | grep strf

echo ""
echo "📝 Backend Logs (last 50 lines):"
docker logs strf-server --tail 50

echo ""
echo "🌐 Testing backend directly:"
curl -v http://localhost:5000/api/auth/login 2>&1 | head -20
