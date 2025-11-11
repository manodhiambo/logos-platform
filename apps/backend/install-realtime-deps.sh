#!/bin/bash

echo "📦 Installing real-time dependencies..."

# Backend dependencies
cd apps/backend
npm install socket.io@^4.7.2 ioredis@^5.3.2 @socket.io/redis-adapter@^8.2.1

# Frontend dependencies
cd ../frontend
npm install socket.io-client@^4.7.2

echo "✅ Dependencies installed!"
