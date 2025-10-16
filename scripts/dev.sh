#!/bin/bash

echo "🚀 Starting MotosMuñoz Development Environment..."

# Start database
echo "📊 Starting database..."
./scripts/start-db.sh

# Wait a bit more for database to be fully ready
echo "⏳ Waiting for database to be fully ready..."
sleep 10

# Start Next.js development server
echo "🌐 Starting Next.js development server..."
npm run dev
