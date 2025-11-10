#!/bin/bash
# Convenience script to run both backend and frontend
# Usage: ./run.sh [backend|frontend|both]

set -e

case "${1:-both}" in
  backend)
    echo "🚀 Starting Backend Server..."
    cd backend
    source venv/bin/activate
    python main.py
    ;;
  frontend)
    echo "🚀 Starting Frontend Server..."
    cd frontend
    npm run dev
    ;;
  both)
    echo "🚀 Starting Dorji360..."
    echo ""
    
    # Check if database exists
    if [ ! -f "database/tailor360.db" ]; then
      echo "📦 Initializing database..."
      python3 database/init_db.py
      echo ""
    fi
    
    echo "⚠️  You need to run backend and frontend in separate terminals:"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "  cd backend"
    echo "  source venv/bin/activate"
    echo "  python main.py"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "  cd frontend"
    echo "  npm run dev"
    echo ""
    echo "Then open http://localhost:5173 in your browser"
    ;;
  *)
    echo "Usage: ./run.sh [backend|frontend|both]"
    exit 1
    ;;
esac

