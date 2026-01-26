#!/bin/bash

# Easy Share Backend Startup Script

echo "🚀 Starting Easy Share Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration!"
fi

# Start the server
echo "✅ Starting server on http://localhost:8000"
echo "📚 API docs available at http://localhost:8000/docs"
echo ""
python -m app.main
