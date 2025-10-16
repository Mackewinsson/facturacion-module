#!/bin/bash

# Setup Local FTP Server for Development
# This script sets up a local FTP server using Docker

echo "🚀 Setting up Local FTP Server for Development"
echo "=============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create necessary directories
echo "📁 Creating FTP directories..."
mkdir -p ftp-data/uploads/orders
mkdir -p ftp-logs

# Set proper permissions
chmod 755 ftp-data
chmod 755 ftp-data/uploads
chmod 755 ftp-data/uploads/orders

echo "✅ FTP directories created"

# Start FTP server
echo "🐳 Starting FTP server containers..."
docker-compose up -d ftp-server ftp-http-server

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps ftp-server ftp-http-server | grep -q "Up"; then
    echo "✅ FTP server is running!"
    echo ""
    echo "📋 FTP Server Information:"
    echo "   Host: localhost"
    echo "   Port: 21"
    echo "   Username: usermw"
    echo "   Password: usermw"
    echo "   Passive Ports: 30000-30009"
    echo ""
    echo "🌐 HTTP Access (for viewing files):"
    echo "   URL: http://localhost:8080"
    echo "   Browse uploaded files at: http://localhost:8080/uploads/orders/"
    echo ""
    echo "📁 Local FTP Data Directory:"
    echo "   Path: ./ftp-data/uploads/orders/"
    echo ""
    echo "🔧 To stop the FTP server:"
    echo "   docker-compose stop ftp-server ftp-http-server"
    echo ""
    echo "📊 To view logs:"
    echo "   docker-compose logs -f ftp-server"
else
    echo "❌ Failed to start FTP server"
    echo "📊 Checking logs..."
    docker-compose logs ftp-server
    exit 1
fi

echo "🎉 Local FTP server setup complete!"
