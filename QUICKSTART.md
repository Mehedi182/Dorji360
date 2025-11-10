# Quick Start Guide

## Prerequisites

- Node.js 18+ and npm installed (tested with Node.js 18.20.8)
- Python 3.8+ installed

**Note:** The project uses Vite 5.x and React 18.x which are compatible with Node.js 18. If you have Node.js 20+, you can use newer versions, but Node.js 18 works fine.

## Setup Steps

### 1. Initialize Database

```bash
python3 database/init_db.py
```

This creates the SQLite database with all necessary tables and default measurement templates.

### 2. Start Backend Server

Open a terminal and run:

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

The backend will start on http://localhost:8000

### 3. Start Frontend Development Server

Open another terminal and run:

```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:5173

### 4. Access the Application

Open your browser and navigate to: http://localhost:5173

## Testing Customer Management

1. Click "Add Customer" to create a new customer
2. Fill in the customer details (name and phone are required)
3. Click "Create" to save
4. Click on a customer row to view details
5. Use the search bar to find customers by name, phone, or ID
6. Click "Edit" to modify customer information
7. Click "Delete Customer" to remove a customer

## API Documentation

Once the backend is running, you can access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Troubleshooting

### Database not found
Run `python3 database/init_db.py` to initialize the database.

### Backend won't start
- Make sure you're in the backend directory
- Activate the virtual environment: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

### Frontend won't start
- Make sure you're in the frontend directory
- Install dependencies: `npm install`
- Check that Node.js 18+ is installed

### CORS errors
Make sure the backend is running on port 8000 and frontend on port 5173. The backend is configured to allow CORS from these origins.

