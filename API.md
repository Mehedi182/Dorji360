# Dorji360 API Documentation

Base URL: `http://localhost:8000`

## Interactive API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Endpoints

### Health Check

#### GET /api/health
Check if the API is running.

**Response:**
```json
{
  "status": "ok"
}
```

---

## Customer Endpoints

### List Customers
**GET** `/api/customers`

Get all customers, optionally filtered by search term.

**Query Parameters:**
- `search` (optional): Search by name, phone, or ID

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "phone": "1234567890",
    "address": "123 Main St",
    "notes": "Regular customer",
    "created_at": "2025-11-10 08:00:00"
  }
]
```

### Get Customer
**GET** `/api/customers/{customer_id}`

Get a specific customer by ID.

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "John Doe",
  "phone": "1234567890",
  "address": "123 Main St",
  "notes": "Regular customer",
  "created_at": "2025-11-10 08:00:00"
}
```

### Create Customer
**POST** `/api/customers`

Create a new customer.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "address": "123 Main St",
  "notes": "Regular customer"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "John Doe",
  "phone": "1234567890",
  "address": "123 Main St",
  "notes": "Regular customer",
  "created_at": "2025-11-10 08:00:00"
}
```

### Update Customer
**PUT** `/api/customers/{customer_id}`

Update an existing customer.

**Request Body:** (all fields optional)
```json
{
  "name": "Jane Doe",
  "phone": "0987654321",
  "address": "456 Oak Ave",
  "notes": "Updated notes"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Jane Doe",
  "phone": "0987654321",
  "address": "456 Oak Ave",
  "notes": "Updated notes",
  "created_at": "2025-11-10 08:00:00"
}
```

### Delete Customer
**DELETE** `/api/customers/{customer_id}`

Delete a customer.

**Response:** `200 OK`
```json
{
  "message": "Customer deleted successfully"
}
```

---

## Measurement Template Endpoints

### List Templates
**GET** `/api/measurement-templates`

Get all measurement templates, optionally filtered.

**Query Parameters:**
- `garment_type` (optional): Filter by garment type
- `gender` (optional): Filter by gender (male, female, unisex)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "garment_type": "blazer",
    "gender": "male",
    "fields_json": {
      "chest": "Chest",
      "waist": "Waist",
      "shoulder": "Shoulder"
    },
    "display_name": "Blazer (Male)",
    "created_at": "2025-11-10 08:00:00"
  }
]
```

### Get Template
**GET** `/api/measurement-templates/{template_id}`

Get a specific template by ID.

**Response:** `200 OK`
```json
{
  "id": 1,
  "garment_type": "blazer",
  "gender": "male",
  "fields_json": {
    "chest": "Chest",
    "waist": "Waist"
  },
  "display_name": "Blazer (Male)",
  "created_at": "2025-11-10 08:00:00"
}
```

### Create Template
**POST** `/api/measurement-templates`

Create a new measurement template.

**Request Body:**
```json
{
  "garment_type": "blazer",
  "gender": "male",
  "fields_json": {
    "chest": "Chest",
    "waist": "Waist",
    "shoulder": "Shoulder"
  },
  "display_name": "Blazer (Male)"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "garment_type": "blazer",
  "gender": "male",
  "fields_json": {
    "chest": "Chest",
    "waist": "Waist",
    "shoulder": "Shoulder"
  },
  "display_name": "Blazer (Male)",
  "created_at": "2025-11-10 08:00:00"
}
```

### Update Template
**PUT** `/api/measurement-templates/{template_id}`

Update an existing template.

**Request Body:** (all fields optional)
```json
{
  "garment_type": "blazer",
  "gender": "male",
  "fields_json": {
    "chest": "Chest",
    "waist": "Waist"
  },
  "display_name": "Blazer (Male)"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "garment_type": "blazer",
  "gender": "male",
  "fields_json": {
    "chest": "Chest",
    "waist": "Waist"
  },
  "display_name": "Blazer (Male)",
  "created_at": "2025-11-10 08:00:00"
}
```

### Delete Template
**DELETE** `/api/measurement-templates/{template_id}`

Delete a template. Cannot delete if template is in use by measurements.

**Response:** `200 OK`
```json
{
  "message": "Template deleted successfully"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "detail": "Cannot delete template: 5 measurement(s) are using this template"
}
```

---

## Measurement Endpoints

### List Measurements
**GET** `/api/measurements`

Get all measurements, optionally filtered.

**Query Parameters:**
- `customer_id` (optional): Filter by customer ID
- `garment_type` (optional): Filter by garment type

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "customer_id": 1,
    "customer_name": "John Doe",
    "customer_phone": "1234567890",
    "garment_type": "blazer",
    "template_id": 1,
    "template_name": "Blazer (Male)",
    "measurements_json": {
      "chest": 42,
      "waist": 36,
      "shoulder": 18
    },
    "created_at": "2025-11-10 08:00:00"
  }
]
```

### Get Measurement
**GET** `/api/measurements/{measurement_id}`

Get a specific measurement by ID.

**Response:** `200 OK`
```json
{
  "id": 1,
  "customer_id": 1,
  "customer_name": "John Doe",
  "customer_phone": "1234567890",
  "garment_type": "blazer",
  "template_id": 1,
  "template_name": "Blazer (Male)",
  "measurements_json": {
    "chest": 42,
    "waist": 36,
    "shoulder": 18
  },
  "created_at": "2025-11-10 08:00:00"
}
```

### Create Measurement
**POST** `/api/measurements`

Create a new measurement.

**Request Body:**
```json
{
  "customer_id": 1,
  "garment_type": "blazer",
  "template_id": 1,
  "measurements_json": {
    "chest": 42,
    "waist": 36,
    "shoulder": 18
  }
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "customer_id": 1,
  "garment_type": "blazer",
  "template_id": 1,
  "measurements_json": {
    "chest": 42,
    "waist": 36,
    "shoulder": 18
  },
  "created_at": "2025-11-10 08:00:00"
}
```

### Update Measurement
**PUT** `/api/measurements/{measurement_id}`

Update an existing measurement's values.

**Request Body:**
```json
{
  "chest": 43,
  "waist": 37,
  "shoulder": 18.5
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "customer_id": 1,
  "garment_type": "blazer",
  "template_id": 1,
  "measurements_json": {
    "chest": 43,
    "waist": 37,
    "shoulder": 18.5
  },
  "created_at": "2025-11-10 08:00:00"
}
```

### Delete Measurement
**DELETE** `/api/measurements/{measurement_id}`

Delete a measurement.

**Response:** `200 OK`
```json
{
  "message": "Measurement deleted successfully"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Error message describing what went wrong"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Database error: ..."
}
```

---

## Example Usage

### Using cURL

```bash
# Get all customers
curl http://localhost:8000/api/customers

# Create a customer
curl -X POST http://localhost:8000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","phone":"1234567890"}'

# Get all templates
curl http://localhost:8000/api/measurement-templates

# Create a measurement
curl -X POST http://localhost:8000/api/measurements \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "garment_type": "blazer",
    "template_id": 1,
    "measurements_json": {"chest": 42, "waist": 36}
  }'
```

### Using JavaScript/Fetch

```javascript
// Get all customers
const customers = await fetch('http://localhost:8000/api/customers')
  .then(res => res.json());

// Create a customer
const newCustomer = await fetch('http://localhost:8000/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    phone: '1234567890'
  })
}).then(res => res.json());
```

---

## Notes

- All timestamps are in ISO format: `YYYY-MM-DD HH:MM:SS`
- Measurement values are in centimeters (cm)
- Field keys in `fields_json` should be lowercase with underscores (e.g., `chest`, `sleeve_length`)
- Gender values must be: `male`, `female`, or `unisex`

