#!/bin/bash
# Restart script for Dorji360 backend (Django)

echo "Stopping existing backend server..."
pkill -f "python.*manage.py runserver" || echo "No existing server found"

sleep 2

echo "Starting backend server..."
cd "$(dirname "$0")"
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000

