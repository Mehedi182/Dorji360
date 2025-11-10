<!-- 0bae6510-8825-4f8a-9a0a-d987160755be 6c9d219a-1b26-45f0-8de7-7a397a22cf7c -->
# Dorji360 - Tailor Management Software Implementation Plan

## Architecture Overview

**Tech Stack:**

- **Frontend:** React + TypeScript with Vite
- **UI Framework:** Tailwind CSS
- **State Management:** Zustand (lightweight, offline-friendly)
- **Database:** SQLite (via better-sqlite3) for local-first storage
- **Backend:** fastapi
- **Offline Support:** Service Worker + IndexedDB fallback
- **Printing:** React-to-Print for receipts
- **Date Handling:** date-fns with locale support

**Project Structure:**

```
tailor360/
├── frontend/          # React application
├── backend/           # fast API server
├── database/          # SQLite database & migrations
└── shared/            # Shared types & utilities
```

## Phase 1: Core Features (MUST-HAVE)

### 1. Customer Management

- **Database Schema:** `customers` table (id, name, phone, address, created_at, notes)
- **Features:**
  - Add/Edit/Delete customers
  - Search by name, phone, or ID
  - Customer detail view with order history
  - Quick payment/delivery status indicators

### 2. Measurement Book

- **Database Schema:** 
  - `measurements` table (id, customer_id, garment_type, template_id, measurements_json, created_at)
  - `measurement_templates` table (id, garment_type, gender, fields_json, display_name) - stores template definitions
- **Features:**
  - **Pre-defined Measurement Templates:** Select from templates (Blazer, Pant, Shirt, Salwar, Panjabi, Blouse, etc.)
  - **Template-Based Input:** Pick template → form dynamically shows only relevant measurement fields → fill values
  - **Template Examples:**
    - **Blazer:** Chest, Waist, Shoulder, Sleeve Length, Back Length, Front Length, etc.
    - **Pant:** Waist, Hip, Inseam, Outseam, Thigh, Cuff Width, etc.
    - **Shirt:** Chest, Waist, Shoulder, Sleeve Length, Neck, Shirt Length, etc.
    - **Salwar:** Waist, Hip, Length, Bottom Width, etc.
  - Male/Female specific templates (different measurement fields per gender)
  - Save multiple measurement sets per customer (for different garment types)
  - Print/export measurement slip with template name
  - Update measurements with version history
  - **Customizable Templates:** Admin can add/edit measurement templates if needed

### 3. Order Management

- **Database Schema:** 
  - `orders` table (id, customer_id, order_date, delivery_date, status, total_amount, notes)
  - `order_items` table (id, order_id, garment_type, quantity, price, fabric_details)
- **Features:**
  - Create order with customer selection
  - Add multiple clothing items per order
  - Track order status (Pending → Cutting → Sewing → Ready → Delivered)
  - Print order receipt with logo and contact info
  - Fabric details entry

### 4. Payments & Billing

- **Database Schema:** `payments` table (id, order_id, amount, payment_type, payment_method, date, notes)
- **Features:**
  - Record advance payments
  - Track remaining balance per order
  - Generate invoices/receipts
  - Support partial payments
  - Payment method tracking (Cash, Bkash, Nagad)

### 5. Delivery Tracking

- **Features:**
  - Calendar view of upcoming deliveries
  - List view with filters (today, tomorrow, this week)
  - Visual indicators for overdue orders
  - Quick status update from delivery view

## Phase 2: Bangladesh-Specific Customizations

### Localization

- **i18n Setup:** react-i18next for Bangla/English support
- **Date Format:** dd-mm-yyyy (Bangladesh standard)
- **Currency:** BDT (৳) formatting
- **Payment Methods:** Bkash, Nagad integration fields

### Offline-First Architecture

- **Service Worker:** Cache static assets and API responses
- **IndexedDB:** Local storage fallback for offline operations
- **Sync Queue:** Queue operations when offline, sync when online
- **Database:** SQLite runs locally, no internet required

### Printing Support

- **Receipt Templates:** 58mm/80mm receipt printer compatible
- **Print Components:** Order receipts, measurement slips, invoices
- **Print Preview:** Before printing

## Implementation Details

### Key Files to Create:

**Frontend Structure:**

- `src/pages/Customers.tsx` - Customer list and management
- `src/pages/Measurements.tsx` - Measurement book interface
- `src/pages/Orders.tsx` - Order creation and management
- `src/pages/Payments.tsx` - Payment tracking
- `src/pages/Deliveries.tsx` - Delivery calendar/list view
- `src/components/MeasurementForm.tsx` - Reusable measurement input
- `src/components/OrderReceipt.tsx` - Printable receipt component
- `src/hooks/useOfflineSync.ts` - Offline sync logic

**Database Schema Highlights:**

```sql
-- Core tables with relationships
customers → orders → order_items
customers → measurements
orders → payments
```

### UI/UX Considerations:

- Clean, simple interface suitable for non-technical users
- Large, readable fonts
- Bangla font support (Kalpurush, SolaimanLipi)
- Color-coded status indicators
- Keyboard shortcuts for common actions
- Mobile-responsive design

## Development Phases

**Phase 1.1:** Project setup + Database schema + Customer Management

**Phase 1.2:** Measurement Book implementation

**Phase 1.3:** Order Management system

**Phase 1.4:** Payments & Billing

**Phase 1.5:** Delivery Tracking + Calendar view

**Phase 1.6:** Offline support + Localization (Bangla)

**Phase 1.7:** Printing functionality + Receipt templates

**Phase 1.8:** Testing + Polish

## Technical Decisions

1. **SQLite for local-first:** Perfect for offline operation, no server required
2. **React + TypeScript:** Type safety and modern development experience
3. **Tailwind CSS:** Rapid UI development with consistent design
4. **PWA capabilities:** Can be installed as app, works offline
5. **Print-friendly:** CSS print styles for receipt printing

## Future Extensibility

The architecture allows easy addition of:

- Task Management (Phase 2)
- Expense Tracking (Phase 2)
- Reports & Analytics (Phase 2)
- SMS/WhatsApp integration (Phase 3)
- Cloud sync (Phase 3)
- Mobile app (Phase 4)