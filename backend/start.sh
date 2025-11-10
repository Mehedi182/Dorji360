#!/bin/bash
# Start script for Dorji360 backend (Django)

cd "$(dirname "$0")"
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000

