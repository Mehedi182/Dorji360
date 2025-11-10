# Dorji360 - Tailor Management Software

A comprehensive tailor management system built with React, TypeScript, FastAPI, and SQLite.

## Features

- ✅ Customer Management (Phase 1.1)
- 🔄 Measurement Book (Coming soon)
- 🔄 Order Management (Coming soon)
- 🔄 Payments & Billing (Coming soon)
- 🔄 Delivery Tracking (Coming soon)

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI:** Tailwind CSS
- **State Management:** Zustand
- **Backend:** FastAPI
- **Database:** SQLite
- **Routing:** React Router

## Getting Started

### Prerequisites

- Node.js 18+ and npm (tested with Node.js 18.20.8)
- Python 3.8+

### Installation

1. **Initialize Database:**
   ```bash
   python3 database/init_db.py
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start Backend:**
   ```bash
   cd backend
   source venv/bin/activate
   python main.py
   # Or: uvicorn main:app --reload
   ```
   Backend will run on http://localhost:8000

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

## Project Structure

```
tailor360/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand stores
│   │   └── lib/          # Utilities and API client
├── backend/           # FastAPI server
│   └── main.py        # API endpoints
├── database/          # SQLite database & migrations
│   ├── schema.sql     # Database schema
│   ├── init_db.py     # Database initialization
│   └── tailor360.db   # SQLite database file
└── shared/            # Shared types
    └── types.ts       # TypeScript types
```

## API Endpoints

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Customers
- `GET /api/customers` - List all customers (optional `?search=term`)
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Measurement Templates
- `GET /api/measurement-templates` - List all templates (optional filters: `?garment_type=X&gender=Y`)
- `GET /api/measurement-templates/{id}` - Get template by ID
- `POST /api/measurement-templates` - Create new template
- `PUT /api/measurement-templates/{id}` - Update template
- `DELETE /api/measurement-templates/{id}` - Delete template

### Measurements
- `GET /api/measurements` - List all measurements (optional filters: `?customer_id=X&garment_type=Y`)
- `GET /api/measurements/{id}` - Get measurement by ID
- `POST /api/measurements` - Create new measurement
- `PUT /api/measurements/{id}` - Update measurement
- `DELETE /api/measurements/{id}` - Delete measurement

### Health Check
- `GET /api/health` - Check API status

For detailed API documentation, see [API.md](./API.md)

## Development

The project follows the implementation plan in `plan.md`. Currently implementing Phase 1.1 (Customer Management).

## License

MIT

