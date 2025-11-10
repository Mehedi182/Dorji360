#!/bin/bash
# Start script for Dorji360 backend

cd "$(dirname "$0")"
source venv/bin/activate
python main.py

