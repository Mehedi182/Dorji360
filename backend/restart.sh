#!/bin/bash
# Restart script for Dorji360 backend

echo "Stopping existing backend server..."
pkill -f "python.*main.py" || pkill -f "uvicorn.*main:app" || echo "No existing server found"

sleep 2

echo "Starting backend server..."
cd "$(dirname "$0")"
source venv/bin/activate
python main.py

