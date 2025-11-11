#!/bin/bash

echo "📦 Installing real-time dependencies..."

# Backend dependencies
cd apps/backend
npm install socket.io @types/socket.io redis @types/redis ioredis socket.io-redis

# Frontend dependencies
cd ../frontend
npm install socket.io-client

echo "✅ Dependencies installed!"
