"""
Dorji360 FastAPI Backend
"""

import json
from pathlib import Path
from typing import List, Optional

import aiosqlite
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Database path
DB_PATH = Path(__file__).parent.parent / "database" / "tailor360.db"

# Ensure database directory exists
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Dorji360 API",
    description="Comprehensive tailor management system API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database dependency
async def get_db():
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            yield db
    except Exception as e:
        print(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")


# Pydantic models
class CustomerCreate(BaseModel):
    name: str
    phone: str
    address: Optional[str] = None
    notes: Optional[str] = None


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class CustomerResponse(BaseModel):
    id: int
    name: str
    phone: str
    address: Optional[str]
    notes: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


# Customer endpoints
@app.get("/api/customers", response_model=List[CustomerResponse])
async def get_customers(search: Optional[str] = None, db: aiosqlite.Connection = Depends(get_db)):
    """Get all customers, optionally filtered by search term."""
    try:
        print(f"[DEBUG] Getting customers, search: {search}")
        print(f"[DEBUG] DB path: {DB_PATH}, exists: {DB_PATH.exists()}")
        
        if search:
            query = """
                SELECT * FROM customers 
                WHERE name LIKE ? OR phone LIKE ? OR id = ?
                ORDER BY id DESC
            """
            search_term = f"%{search}%"
            cursor = await db.execute(query, (search_term, search_term, search))
            rows = await cursor.fetchall()
        else:
            query = "SELECT * FROM customers ORDER BY id DESC"
            cursor = await db.execute(query)
            rows = await cursor.fetchall()
        
        print(f"[DEBUG] Found {len(rows)} customers")
        
        # Convert Row objects to dictionaries
        customers = []
        for row in rows:
            customers.append({
                "id": row["id"],
                "name": row["name"],
                "phone": row["phone"],
                "address": row["address"],
                "notes": row["notes"],
                "created_at": row["created_at"]
            })
        
        return customers
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[ERROR] Database error: {e}")
        print(f"[ERROR] Traceback: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Get a specific customer by ID."""
    async with db.execute("SELECT * FROM customers WHERE id = ?", (customer_id,)) as cursor:
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Customer not found")
        return {
            "id": row["id"],
            "name": row["name"],
            "phone": row["phone"],
            "address": row["address"],
            "notes": row["notes"],
            "created_at": row["created_at"]
        }


@app.post("/api/customers", response_model=CustomerResponse)
async def create_customer(customer: CustomerCreate, db: aiosqlite.Connection = Depends(get_db)):
    """Create a new customer."""
    cursor = await db.execute(
        "INSERT INTO customers (name, phone, address, notes) VALUES (?, ?, ?, ?)",
        (customer.name, customer.phone, customer.address, customer.notes)
    )
    await db.commit()
    customer_id = cursor.lastrowid
    
    async with db.execute("SELECT * FROM customers WHERE id = ?", (customer_id,)) as cursor:
        row = await cursor.fetchone()
        return {
            "id": row["id"],
            "name": row["name"],
            "phone": row["phone"],
            "address": row["address"],
            "notes": row["notes"],
            "created_at": row["created_at"]
        }


@app.put("/api/customers/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: int,
    customer: CustomerUpdate,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Update an existing customer."""
    # Check if customer exists
    async with db.execute("SELECT * FROM customers WHERE id = ?", (customer_id,)) as cursor:
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Customer not found")
    
    # Build update query dynamically
    updates = []
    values = []
    if customer.name is not None:
        updates.append("name = ?")
        values.append(customer.name)
    if customer.phone is not None:
        updates.append("phone = ?")
        values.append(customer.phone)
    if customer.address is not None:
        updates.append("address = ?")
        values.append(customer.address)
    if customer.notes is not None:
        updates.append("notes = ?")
        values.append(customer.notes)
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    values.append(customer_id)
    query = f"UPDATE customers SET {', '.join(updates)} WHERE id = ?"
    
    await db.execute(query, values)
    await db.commit()
    
    async with db.execute("SELECT * FROM customers WHERE id = ?", (customer_id,)) as cursor:
        row = await cursor.fetchone()
        return {
            "id": row["id"],
            "name": row["name"],
            "phone": row["phone"],
            "address": row["address"],
            "notes": row["notes"],
            "created_at": row["created_at"]
        }


@app.delete("/api/customers/{customer_id}")
async def delete_customer(customer_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Delete a customer."""
    async with db.execute("SELECT * FROM customers WHERE id = ?", (customer_id,)) as cursor:
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Customer not found")
    
    await db.execute("DELETE FROM customers WHERE id = ?", (customer_id,))
    await db.commit()
    return {"message": "Customer deleted successfully"}


# Measurement Template models
class MeasurementTemplateResponse(BaseModel):
    id: int
    garment_type: str
    gender: str
    fields_json: dict
    display_name: str
    created_at: str

    class Config:
        from_attributes = True


# Measurement models
class MeasurementCreate(BaseModel):
    customer_id: int
    garment_type: str
    template_id: int
    measurements_json: dict


class MeasurementResponse(BaseModel):
    id: int
    customer_id: int
    garment_type: str
    template_id: int
    measurements_json: dict
    created_at: str

    class Config:
        from_attributes = True


class MeasurementWithCustomer(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    customer_phone: str
    garment_type: str
    template_id: int
    template_name: str
    measurements_json: dict
    created_at: str


# Measurement Template endpoints
@app.get("/api/measurement-templates", response_model=List[MeasurementTemplateResponse])
async def get_measurement_templates(
    garment_type: Optional[str] = None,
    gender: Optional[str] = None,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Get all measurement templates, optionally filtered by garment type or gender."""
    try:
        if garment_type and gender:
            query = "SELECT * FROM measurement_templates WHERE garment_type = ? AND gender = ? ORDER BY id DESC"
            cursor = await db.execute(query, (garment_type, gender))
        elif garment_type:
            query = "SELECT * FROM measurement_templates WHERE garment_type = ? ORDER BY id DESC"
            cursor = await db.execute(query, (garment_type,))
        elif gender:
            query = "SELECT * FROM measurement_templates WHERE gender = ? ORDER BY id DESC"
            cursor = await db.execute(query, (gender,))
        else:
            query = "SELECT * FROM measurement_templates ORDER BY id DESC"
            cursor = await db.execute(query)
        
        rows = await cursor.fetchall()
        
        templates = []
        for row in rows:
            templates.append({
                "id": row["id"],
                "garment_type": row["garment_type"],
                "gender": row["gender"],
                "fields_json": json.loads(row["fields_json"]),
                "display_name": row["display_name"],
                "created_at": row["created_at"]
            })
        
        return templates
    except Exception as e:
        import traceback
        print(f"[ERROR] Template error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching templates: {str(e)}")


@app.get("/api/measurement-templates/{template_id}", response_model=MeasurementTemplateResponse)
async def get_measurement_template(template_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Get a specific measurement template by ID."""
    async with db.execute("SELECT * FROM measurement_templates WHERE id = ?", (template_id,)) as cursor:
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Template not found")
        return {
            "id": row["id"],
            "garment_type": row["garment_type"],
            "gender": row["gender"],
            "fields_json": json.loads(row["fields_json"]),
            "display_name": row["display_name"],
            "created_at": row["created_at"]
        }


class MeasurementTemplateCreate(BaseModel):
    garment_type: str
    gender: str
    fields_json: dict
    display_name: str


class MeasurementTemplateUpdate(BaseModel):
    garment_type: Optional[str] = None
    gender: Optional[str] = None
    fields_json: Optional[dict] = None
    display_name: Optional[str] = None


@app.post("/api/measurement-templates", response_model=MeasurementTemplateResponse)
async def create_measurement_template(
    template: MeasurementTemplateCreate,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Create a new measurement template."""
    try:
        # Validate gender
        if template.gender not in ['male', 'female', 'unisex']:
            raise HTTPException(status_code=400, detail="Gender must be 'male', 'female', or 'unisex'")
        
        cursor = await db.execute(
            "INSERT INTO measurement_templates (garment_type, gender, fields_json, display_name) VALUES (?, ?, ?, ?)",
            (template.garment_type, template.gender, json.dumps(template.fields_json), template.display_name)
        )
        await db.commit()
        template_id = cursor.lastrowid
        
        async with db.execute("SELECT * FROM measurement_templates WHERE id = ?", (template_id,)) as cursor:
            row = await cursor.fetchone()
            return {
                "id": row["id"],
                "garment_type": row["garment_type"],
                "gender": row["gender"],
                "fields_json": json.loads(row["fields_json"]),
                "display_name": row["display_name"],
                "created_at": row["created_at"]
            }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"[ERROR] Create template error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error creating template: {str(e)}")


@app.put("/api/measurement-templates/{template_id}", response_model=MeasurementTemplateResponse)
async def update_measurement_template(
    template_id: int,
    template: MeasurementTemplateUpdate,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Update an existing measurement template."""
    try:
        # Check if template exists
        async with db.execute("SELECT * FROM measurement_templates WHERE id = ?", (template_id,)) as cursor:
            if not await cursor.fetchone():
                raise HTTPException(status_code=404, detail="Template not found")
        
        # Build update query dynamically
        updates = []
        values = []
        if template.garment_type is not None:
            updates.append("garment_type = ?")
            values.append(template.garment_type)
        if template.gender is not None:
            if template.gender not in ['male', 'female', 'unisex']:
                raise HTTPException(status_code=400, detail="Gender must be 'male', 'female', or 'unisex'")
            updates.append("gender = ?")
            values.append(template.gender)
        if template.fields_json is not None:
            updates.append("fields_json = ?")
            values.append(json.dumps(template.fields_json))
        if template.display_name is not None:
            updates.append("display_name = ?")
            values.append(template.display_name)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(template_id)
        query = f"UPDATE measurement_templates SET {', '.join(updates)} WHERE id = ?"
        
        await db.execute(query, values)
        await db.commit()
        
        async with db.execute("SELECT * FROM measurement_templates WHERE id = ?", (template_id,)) as cursor:
            row = await cursor.fetchone()
            return {
                "id": row["id"],
                "garment_type": row["garment_type"],
                "gender": row["gender"],
                "fields_json": json.loads(row["fields_json"]),
                "display_name": row["display_name"],
                "created_at": row["created_at"]
            }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"[ERROR] Update template error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error updating template: {str(e)}")


@app.delete("/api/measurement-templates/{template_id}")
async def delete_measurement_template(template_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Delete a measurement template."""
    # Check if template exists
    async with db.execute("SELECT * FROM measurement_templates WHERE id = ?", (template_id,)) as cursor:
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Template not found")
    
    # Check if template is being used by any measurements
    async with db.execute("SELECT COUNT(*) FROM measurements WHERE template_id = ?", (template_id,)) as cursor:
        count = (await cursor.fetchone())[0]
        if count > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete template: {count} measurement(s) are using this template"
            )
    
    await db.execute("DELETE FROM measurement_templates WHERE id = ?", (template_id,))
    await db.commit()
    return {"message": "Template deleted successfully"}


# Measurement endpoints
@app.get("/api/measurements", response_model=List[MeasurementWithCustomer])
async def get_measurements(
    customer_id: Optional[int] = None,
    garment_type: Optional[str] = None,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Get all measurements, optionally filtered by customer or garment type."""
    try:
        query_parts = [
            """SELECT m.*, c.name as customer_name, c.phone as customer_phone, 
               mt.display_name as template_name
               FROM measurements m
               JOIN customers c ON m.customer_id = c.id
               JOIN measurement_templates mt ON m.template_id = mt.id"""
        ]
        params = []
        
        if customer_id:
            query_parts.append("WHERE m.customer_id = ?")
            params.append(customer_id)
            if garment_type:
                query_parts.append("AND m.garment_type = ?")
                params.append(garment_type)
        elif garment_type:
            query_parts.append("WHERE m.garment_type = ?")
            params.append(garment_type)
        
        query_parts.append("ORDER BY m.id DESC")
        query = " ".join(query_parts)
        
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        
        measurements = []
        for row in rows:
            measurements.append({
                "id": row["id"],
                "customer_id": row["customer_id"],
                "customer_name": row["customer_name"],
                "customer_phone": row["customer_phone"],
                "garment_type": row["garment_type"],
                "template_id": row["template_id"],
                "template_name": row["template_name"],
                "measurements_json": json.loads(row["measurements_json"]),
                "created_at": row["created_at"]
            })
        
        return measurements
    except Exception as e:
        import traceback
        print(f"[ERROR] Measurement error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching measurements: {str(e)}")


@app.get("/api/measurements/{measurement_id}", response_model=MeasurementWithCustomer)
async def get_measurement(measurement_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Get a specific measurement by ID."""
    query = """SELECT m.*, c.name as customer_name, c.phone as customer_phone, 
               mt.display_name as template_name
               FROM measurements m
               JOIN customers c ON m.customer_id = c.id
               JOIN measurement_templates mt ON m.template_id = mt.id
               WHERE m.id = ?"""
    
    async with db.execute(query, (measurement_id,)) as cursor:
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Measurement not found")
        return {
            "id": row["id"],
            "customer_id": row["customer_id"],
            "customer_name": row["customer_name"],
            "customer_phone": row["customer_phone"],
            "garment_type": row["garment_type"],
            "template_id": row["template_id"],
            "template_name": row["template_name"],
            "measurements_json": json.loads(row["measurements_json"]),
            "created_at": row["created_at"]
        }


@app.post("/api/measurements", response_model=MeasurementResponse)
async def create_measurement(measurement: MeasurementCreate, db: aiosqlite.Connection = Depends(get_db)):
    """Create a new measurement."""
    try:
        # Verify customer exists
        async with db.execute("SELECT id FROM customers WHERE id = ?", (measurement.customer_id,)) as cursor:
            if not await cursor.fetchone():
                raise HTTPException(status_code=404, detail="Customer not found")
        
        # Verify template exists
        async with db.execute("SELECT id FROM measurement_templates WHERE id = ?", (measurement.template_id,)) as cursor:
            if not await cursor.fetchone():
                raise HTTPException(status_code=404, detail="Template not found")
        
        cursor = await db.execute(
            "INSERT INTO measurements (customer_id, garment_type, template_id, measurements_json) VALUES (?, ?, ?, ?)",
            (measurement.customer_id, measurement.garment_type, measurement.template_id, json.dumps(measurement.measurements_json))
        )
        await db.commit()
        measurement_id = cursor.lastrowid
        
        async with db.execute("SELECT * FROM measurements WHERE id = ?", (measurement_id,)) as cursor:
            row = await cursor.fetchone()
            return {
                "id": row["id"],
                "customer_id": row["customer_id"],
                "garment_type": row["garment_type"],
                "template_id": row["template_id"],
                "measurements_json": json.loads(row["measurements_json"]),
                "created_at": row["created_at"]
            }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"[ERROR] Create measurement error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error creating measurement: {str(e)}")


@app.put("/api/measurements/{measurement_id}", response_model=MeasurementResponse)
async def update_measurement(
    measurement_id: int,
    measurements_json: dict,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Update an existing measurement."""
    try:
        # Check if measurement exists
        async with db.execute("SELECT * FROM measurements WHERE id = ?", (measurement_id,)) as cursor:
            if not await cursor.fetchone():
                raise HTTPException(status_code=404, detail="Measurement not found")
        
        await db.execute(
            "UPDATE measurements SET measurements_json = ? WHERE id = ?",
            (json.dumps(measurements_json), measurement_id)
        )
        await db.commit()
        
        async with db.execute("SELECT * FROM measurements WHERE id = ?", (measurement_id,)) as cursor:
            row = await cursor.fetchone()
            return {
                "id": row["id"],
                "customer_id": row["customer_id"],
                "garment_type": row["garment_type"],
                "template_id": row["template_id"],
                "measurements_json": json.loads(row["measurements_json"]),
                "created_at": row["created_at"]
            }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"[ERROR] Update measurement error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error updating measurement: {str(e)}")


@app.delete("/api/measurements/{measurement_id}")
async def delete_measurement(measurement_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Delete a measurement."""
    async with db.execute("SELECT * FROM measurements WHERE id = ?", (measurement_id,)) as cursor:
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Measurement not found")
    
    await db.execute("DELETE FROM measurements WHERE id = ?", (measurement_id,))
    await db.commit()
    return {"message": "Measurement deleted successfully"}


# Order models
class OrderItemCreate(BaseModel):
    garment_type: str
    quantity: int
    price: float
    fabric_details: Optional[str] = None


class OrderCreate(BaseModel):
    customer_id: int
    order_date: Optional[str] = None
    delivery_date: str
    items: List[OrderItemCreate]
    notes: Optional[str] = None
    assigned_staff_ids: Optional[List[int]] = None


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    garment_type: str
    quantity: int
    price: float
    fabric_details: Optional[str]

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    order_date: str
    delivery_date: str
    status: str
    total_amount: float
    notes: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


class OrderWithDetails(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    customer_phone: str
    order_date: str
    delivery_date: str
    status: str
    total_amount: float
    notes: Optional[str]
    created_at: str
    items: List[OrderItemResponse]
    paid_amount: float
    remaining_amount: float
    assigned_staff: List[dict] = []  # Will be populated with staff assignment data


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    delivery_date: Optional[str] = None
    notes: Optional[str] = None


# Payment models
class PaymentCreate(BaseModel):
    order_id: int
    amount: float
    payment_type: str
    payment_method: str
    date: Optional[str] = None
    notes: Optional[str] = None


class PaymentResponse(BaseModel):
    id: int
    order_id: int
    amount: float
    payment_type: str
    payment_method: str
    date: str
    notes: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


# Order endpoints
@app.get("/api/orders", response_model=List[OrderWithDetails])
async def get_orders(
    customer_id: Optional[int] = None,
    status: Optional[str] = None,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Get all orders, optionally filtered by customer or status."""
    try:
        query_parts = [
            """SELECT o.*, c.name as customer_name, c.phone as customer_phone
               FROM orders o
               JOIN customers c ON o.customer_id = c.id"""
        ]
        params = []
        
        if customer_id:
            query_parts.append("WHERE o.customer_id = ?")
            params.append(customer_id)
            if status:
                query_parts.append("AND o.status = ?")
                params.append(status)
        elif status:
            query_parts.append("WHERE o.status = ?")
            params.append(status)
        
        query_parts.append("ORDER BY o.id DESC")
        query = " ".join(query_parts)
        
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        
        orders = []
        for row in rows:
            # Get order items
            items_cursor = await db.execute(
                "SELECT * FROM order_items WHERE order_id = ?",
                (row["id"],)
            )
            items_rows = await items_cursor.fetchall()
            items = [
                {
                    "id": item["id"],
                    "order_id": item["order_id"],
                    "garment_type": item["garment_type"],
                    "quantity": item["quantity"],
                    "price": item["price"],
                    "fabric_details": item["fabric_details"],
                }
                for item in items_rows
            ]
            
            # Calculate paid amount
            payments_cursor = await db.execute(
                "SELECT SUM(amount) as total FROM payments WHERE order_id = ?",
                (row["id"],)
            )
            payment_row = await payments_cursor.fetchone()
            paid_amount = payment_row["total"] if payment_row["total"] else 0.0
            
            # Get assigned staff
            staff_cursor = await db.execute(
                """SELECT osa.id, osa.staff_id, osa.assigned_date, osa.notes, 
                          s.name as staff_name, s.role as staff_role
                   FROM order_staff_assignments osa
                   JOIN staff s ON osa.staff_id = s.id
                   WHERE osa.order_id = ?
                   ORDER BY osa.assigned_date DESC, osa.id DESC""",
                (row["id"],)
            )
            staff_rows = await staff_cursor.fetchall()
            assigned_staff = [
                {
                    "id": s_row["id"],
                    "staff_id": s_row["staff_id"],
                    "staff_name": s_row["staff_name"],
                    "staff_role": s_row["staff_role"],
                    "assigned_date": s_row["assigned_date"],
                    "notes": s_row["notes"],
                }
                for s_row in staff_rows
            ]
            
            orders.append({
                "id": row["id"],
                "customer_id": row["customer_id"],
                "customer_name": row["customer_name"],
                "customer_phone": row["customer_phone"],
                "order_date": row["order_date"],
                "delivery_date": row["delivery_date"],
                "status": row["status"],
                "total_amount": row["total_amount"],
                "notes": row["notes"],
                "created_at": row["created_at"],
                "items": items,
                "paid_amount": paid_amount,
                "remaining_amount": row["total_amount"] - paid_amount,
                "assigned_staff": assigned_staff,
            })
        
        return orders
    except Exception as e:
        import traceback
        print(f"[ERROR] Order error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching orders: {str(e)}")


@app.get("/api/orders/{order_id}", response_model=OrderWithDetails)
async def get_order(order_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Get a specific order by ID."""
    query = """SELECT o.*, c.name as customer_name, c.phone as customer_phone
               FROM orders o
               JOIN customers c ON o.customer_id = c.id
               WHERE o.id = ?"""
    
    async with db.execute(query, (order_id,)) as cursor:
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Get order items
        items_cursor = await db.execute(
            "SELECT * FROM order_items WHERE order_id = ?",
            (order_id,)
        )
        items_rows = await items_cursor.fetchall()
        items = [
            {
                "id": item["id"],
                "order_id": item["order_id"],
                "garment_type": item["garment_type"],
                "quantity": item["quantity"],
                "price": item["price"],
                "fabric_details": item["fabric_details"],
            }
            for item in items_rows
        ]
        
        # Calculate paid amount
        payments_cursor = await db.execute(
            "SELECT SUM(amount) as total FROM payments WHERE order_id = ?",
            (order_id,)
        )
        payment_row = await payments_cursor.fetchone()
        paid_amount = payment_row["total"] if payment_row["total"] else 0.0
        
        # Get assigned staff
        staff_cursor = await db.execute(
            """SELECT osa.id, osa.staff_id, osa.assigned_date, osa.notes, 
                      s.name as staff_name, s.role as staff_role
               FROM order_staff_assignments osa
               JOIN staff s ON osa.staff_id = s.id
               WHERE osa.order_id = ?
               ORDER BY osa.assigned_date DESC, osa.id DESC""",
            (order_id,)
        )
        staff_rows = await staff_cursor.fetchall()
        assigned_staff = [
            {
                "id": s_row["id"],
                "staff_id": s_row["staff_id"],
                "staff_name": s_row["staff_name"],
                "staff_role": s_row["staff_role"],
                "assigned_date": s_row["assigned_date"],
                "notes": s_row["notes"],
            }
            for s_row in staff_rows
        ]
        
        return {
            "id": row["id"],
            "customer_id": row["customer_id"],
            "customer_name": row["customer_name"],
            "customer_phone": row["customer_phone"],
            "order_date": row["order_date"],
            "delivery_date": row["delivery_date"],
            "status": row["status"],
            "total_amount": row["total_amount"],
            "notes": row["notes"],
            "created_at": row["created_at"],
            "items": items,
            "paid_amount": paid_amount,
            "remaining_amount": row["total_amount"] - paid_amount,
            "assigned_staff": assigned_staff,
        }


@app.post("/api/orders", response_model=OrderResponse)
async def create_order(order: OrderCreate, db: aiosqlite.Connection = Depends(get_db)):
    """Create a new order."""
    try:
        # Verify customer exists
        async with db.execute("SELECT id FROM customers WHERE id = ?", (order.customer_id,)) as cursor:
            if not await cursor.fetchone():
                raise HTTPException(status_code=404, detail="Customer not found")
        
        # Calculate total amount
        total_amount = sum(item.price * item.quantity for item in order.items)
        
        # Use current date if not provided
        if not order.order_date:
            date_cursor = await db.execute("SELECT date('now')")
            order_date = (await date_cursor.fetchone())[0]
        else:
            order_date = order.order_date
        
        # Create order
        cursor = await db.execute(
            "INSERT INTO orders (customer_id, order_date, delivery_date, total_amount, notes) VALUES (?, ?, ?, ?, ?)",
            (order.customer_id, order_date, order.delivery_date, total_amount, order.notes)
        )
        await db.commit()
        order_id = cursor.lastrowid
        
        # Create order items
        for item in order.items:
            await db.execute(
                "INSERT INTO order_items (order_id, garment_type, quantity, price, fabric_details) VALUES (?, ?, ?, ?, ?)",
                (order_id, item.garment_type, item.quantity, item.price, item.fabric_details)
            )
        
        # Assign staff if provided
        if order.assigned_staff_ids:
            for staff_id in order.assigned_staff_ids:
                # Verify staff exists
                async with db.execute("SELECT id FROM staff WHERE id = ?", (staff_id,)) as cursor:
                    if not await cursor.fetchone():
                        continue  # Skip invalid staff IDs
                
                # Check if already assigned (shouldn't happen on create, but just in case)
                async with db.execute(
                    "SELECT * FROM order_staff_assignments WHERE order_id = ? AND staff_id = ?",
                    (order_id, staff_id)
                ) as cursor:
                    if not await cursor.fetchone():
                        date_cursor = await db.execute("SELECT date('now')")
                        assigned_date = (await date_cursor.fetchone())[0]
                        await db.execute(
                            "INSERT INTO order_staff_assignments (order_id, staff_id, assigned_date) VALUES (?, ?, ?)",
                            (order_id, staff_id, assigned_date)
                        )
        
        await db.commit()
        
        async with db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)) as cursor:
            row = await cursor.fetchone()
            return {
                "id": row["id"],
                "customer_id": row["customer_id"],
                "order_date": row["order_date"],
                "delivery_date": row["delivery_date"],
                "status": row["status"],
                "total_amount": row["total_amount"],
                "notes": row["notes"],
                "created_at": row["created_at"]
            }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"[ERROR] Create order error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")


@app.put("/api/orders/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order_update: OrderUpdate,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Update an existing order."""
    try:
        # Check if order exists
        async with db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)) as cursor:
            if not await cursor.fetchone():
                raise HTTPException(status_code=404, detail="Order not found")
        
        # Build update query dynamically
        updates = []
        values = []
        if order_update.status is not None:
            if order_update.status not in ['pending', 'cutting', 'sewing', 'ready', 'delivered']:
                raise HTTPException(status_code=400, detail="Invalid status")
            updates.append("status = ?")
            values.append(order_update.status)
        if order_update.delivery_date is not None:
            updates.append("delivery_date = ?")
            values.append(order_update.delivery_date)
        if order_update.notes is not None:
            updates.append("notes = ?")
            values.append(order_update.notes)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(order_id)
        query = f"UPDATE orders SET {', '.join(updates)} WHERE id = ?"
        
        await db.execute(query, values)
        await db.commit()
        
        async with db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)) as cursor:
            row = await cursor.fetchone()
            return {
                "id": row["id"],
                "customer_id": row["customer_id"],
                "order_date": row["order_date"],
                "delivery_date": row["delivery_date"],
                "status": row["status"],
                "total_amount": row["total_amount"],
                "notes": row["notes"],
                "created_at": row["created_at"]
            }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"[ERROR] Update order error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error updating order: {str(e)}")


@app.delete("/api/orders/{order_id}")
async def delete_order(order_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Delete an order."""
    async with db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)) as cursor:
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Order not found")
    
    await db.execute("DELETE FROM orders WHERE id = ?", (order_id,))
    await db.commit()
    return {"message": "Order deleted successfully"}


# Payment endpoints
@app.get("/api/payments", response_model=List[PaymentResponse])
async def get_payments(
    order_id: Optional[int] = None,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Get all payments, optionally filtered by order."""
    try:
        if order_id:
            query = "SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC"
            cursor = await db.execute(query, (order_id,))
        else:
            query = "SELECT * FROM payments ORDER BY id DESC"
            cursor = await db.execute(query)
        
        rows = await cursor.fetchall()
        
        payments = []
        for row in rows:
            payments.append({
                "id": row["id"],
                "order_id": row["order_id"],
                "amount": row["amount"],
                "payment_type": row["payment_type"],
                "payment_method": row["payment_method"],
                "date": row["date"],
                "notes": row["notes"],
                "created_at": row["created_at"]
            })
        
        return payments
    except Exception as e:
        import traceback
        print(f"[ERROR] Payment error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching payments: {str(e)}")


@app.get("/api/payments/{payment_id}", response_model=PaymentResponse)
async def get_payment(payment_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Get a specific payment by ID."""
    async with db.execute("SELECT * FROM payments WHERE id = ?", (payment_id,)) as cursor:
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Payment not found")
        return {
            "id": row["id"],
            "order_id": row["order_id"],
            "amount": row["amount"],
            "payment_type": row["payment_type"],
            "payment_method": row["payment_method"],
            "date": row["date"],
            "notes": row["notes"],
            "created_at": row["created_at"]
        }


@app.post("/api/payments", response_model=PaymentResponse)
async def create_payment(payment: PaymentCreate, db: aiosqlite.Connection = Depends(get_db)):
    """Create a new payment."""
    try:
        # Verify order exists
        async with db.execute("SELECT total_amount FROM orders WHERE id = ?", (payment.order_id,)) as cursor:
            order_row = await cursor.fetchone()
            if not order_row:
                raise HTTPException(status_code=404, detail="Order not found")
            
            order_total = order_row["total_amount"]
        
        # Validate payment type
        if payment.payment_type not in ['advance', 'partial', 'full']:
            raise HTTPException(status_code=400, detail="Invalid payment_type")
        
        # Validate payment method
        if payment.payment_method not in ['cash', 'bkash', 'nagad', 'other']:
            raise HTTPException(status_code=400, detail="Invalid payment_method")
        
        # Use current date if not provided
        if not payment.date:
            date_cursor = await db.execute("SELECT date('now')")
            payment_date = (await date_cursor.fetchone())[0]
        else:
            payment_date = payment.date
        
        cursor = await db.execute(
            "INSERT INTO payments (order_id, amount, payment_type, payment_method, date, notes) VALUES (?, ?, ?, ?, ?, ?)",
            (payment.order_id, payment.amount, payment.payment_type, payment.payment_method, payment_date, payment.notes)
        )
        await db.commit()
        payment_id = cursor.lastrowid
        
        async with db.execute("SELECT * FROM payments WHERE id = ?", (payment_id,)) as cursor:
            row = await cursor.fetchone()
            return {
                "id": row["id"],
                "order_id": row["order_id"],
                "amount": row["amount"],
                "payment_type": row["payment_type"],
                "payment_method": row["payment_method"],
                "date": row["date"],
                "notes": row["notes"],
                "created_at": row["created_at"]
            }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"[ERROR] Create payment error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error creating payment: {str(e)}")


@app.delete("/api/payments/{payment_id}")
async def delete_payment(payment_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Delete a payment."""
    async with db.execute("SELECT * FROM payments WHERE id = ?", (payment_id,)) as cursor:
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Payment not found")
    
    await db.execute("DELETE FROM payments WHERE id = ?", (payment_id,))
    await db.commit()
    return {"message": "Payment deleted successfully"}


@app.get("/api/deliveries")
async def get_deliveries(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    status: Optional[str] = None,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Get deliveries for calendar/list view."""
    try:
        query_parts = [
            """SELECT o.*, c.name as customer_name, c.phone as customer_phone
               FROM orders o
               JOIN customers c ON o.customer_id = c.id"""
        ]
        params = []
        
        conditions = []
        if start_date:
            conditions.append("o.delivery_date >= ?")
            params.append(start_date)
        if end_date:
            conditions.append("o.delivery_date <= ?")
            params.append(end_date)
        if status:
            conditions.append("o.status = ?")
            params.append(status)
        
        if conditions:
            query_parts.append("WHERE " + " AND ".join(conditions))
        
        query_parts.append("ORDER BY o.id DESC")
        query = " ".join(query_parts)
        
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        
        deliveries = []
        for row in rows:
            # Calculate paid amount
            payments_cursor = await db.execute(
                "SELECT SUM(amount) as total FROM payments WHERE order_id = ?",
                (row["id"],)
            )
            payment_row = await payments_cursor.fetchone()
            paid_amount = payment_row["total"] if payment_row["total"] else 0.0
            
            deliveries.append({
                "id": row["id"],
                "customer_id": row["customer_id"],
                "customer_name": row["customer_name"],
                "customer_phone": row["customer_phone"],
                "order_date": row["order_date"],
                "delivery_date": row["delivery_date"],
                "status": row["status"],
                "total_amount": row["total_amount"],
                "notes": row["notes"],
                "created_at": row["created_at"],
                "paid_amount": paid_amount,
                "remaining_amount": row["total_amount"] - paid_amount,
            })
        
        return deliveries
    except Exception as e:
        import traceback
        print(f"[ERROR] Delivery error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching deliveries: {str(e)}")


# Sample models
class SampleImageResponse(BaseModel):
    id: int
    sample_id: int
    image_url: str
    display_order: int
    created_at: str

    class Config:
        from_attributes = True


class SampleCreate(BaseModel):
    garment_type: str
    title: str
    description: Optional[str] = None
    images: List[str]  # List of image URLs (base64 or URLs)


class SampleUpdate(BaseModel):
    garment_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None  # List of image URLs


class SampleResponse(BaseModel):
    id: int
    garment_type: str
    title: str
    description: Optional[str]
    images: List[SampleImageResponse]
    created_at: str

    class Config:
        from_attributes = True


# Sample endpoints
@app.get("/api/samples", response_model=List[SampleResponse])
async def get_samples(
    garment_type: Optional[str] = None,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Get all samples, optionally filtered by garment type."""
    try:
        if garment_type:
            query = "SELECT * FROM samples WHERE garment_type = ? ORDER BY id DESC"
            cursor = await db.execute(query, (garment_type,))
        else:
            query = "SELECT * FROM samples ORDER BY id DESC"
            cursor = await db.execute(query)
        
        rows = await cursor.fetchall()
        
        samples = []
        for row in rows:
            # Get images for this sample
            images_cursor = await db.execute(
                "SELECT * FROM sample_images WHERE sample_id = ? ORDER BY display_order, id",
                (row["id"],)
            )
            image_rows = await images_cursor.fetchall()
            
            images = []
            for img_row in image_rows:
                images.append({
                    "id": img_row["id"],
                    "sample_id": img_row["sample_id"],
                    "image_url": img_row["image_url"],
                    "display_order": img_row["display_order"],
                    "created_at": img_row["created_at"]
                })
            
            samples.append({
                "id": row["id"],
                "garment_type": row["garment_type"],
                "title": row["title"],
                "description": row["description"],
                "images": images,
                "created_at": row["created_at"]
            })
        
        return samples
    except Exception as e:
        import traceback
        print(f"[ERROR] Sample error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching samples: {str(e)}")


@app.get("/api/samples/{sample_id}", response_model=SampleResponse)
async def get_sample(sample_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Get a specific sample by ID."""
    async with db.execute("SELECT * FROM samples WHERE id = ?", (sample_id,)) as cursor:
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Sample not found")
        
        # Get images for this sample
        images_cursor = await db.execute(
            "SELECT * FROM sample_images WHERE sample_id = ? ORDER BY display_order, id",
            (sample_id,)
        )
        image_rows = await images_cursor.fetchall()
        
        images = []
        for img_row in image_rows:
            images.append({
                "id": img_row["id"],
                "sample_id": img_row["sample_id"],
                "image_url": img_row["image_url"],
                "display_order": img_row["display_order"],
                "created_at": img_row["created_at"]
            })
        
        return {
            "id": row["id"],
            "garment_type": row["garment_type"],
            "title": row["title"],
            "description": row["description"],
            "images": images,
            "created_at": row["created_at"]
        }


@app.post("/api/samples", response_model=SampleResponse)
async def create_sample(sample: SampleCreate, db: aiosqlite.Connection = Depends(get_db)):
    """Create a new sample."""
    if not sample.images:
        raise HTTPException(status_code=400, detail="At least one image is required")
    
    cursor = await db.execute(
        "INSERT INTO samples (garment_type, title, description) VALUES (?, ?, ?)",
        (sample.garment_type, sample.title, sample.description)
    )
    await db.commit()
    sample_id = cursor.lastrowid
    
    # Insert images
    for idx, image_url in enumerate(sample.images):
        await db.execute(
            "INSERT INTO sample_images (sample_id, image_url, display_order) VALUES (?, ?, ?)",
            (sample_id, image_url, idx)
        )
    await db.commit()
    
    # Return the created sample with images
    async with db.execute("SELECT * FROM samples WHERE id = ?", (sample_id,)) as cursor:
        row = await cursor.fetchone()
        
        # Get images
        images_cursor = await db.execute(
            "SELECT * FROM sample_images WHERE sample_id = ? ORDER BY display_order, id",
            (sample_id,)
        )
        image_rows = await images_cursor.fetchall()
        
        images = []
        for img_row in image_rows:
            images.append({
                "id": img_row["id"],
                "sample_id": img_row["sample_id"],
                "image_url": img_row["image_url"],
                "display_order": img_row["display_order"],
                "created_at": img_row["created_at"]
            })
        
        return {
            "id": row["id"],
            "garment_type": row["garment_type"],
            "title": row["title"],
            "description": row["description"],
            "images": images,
            "created_at": row["created_at"]
        }


@app.put("/api/samples/{sample_id}", response_model=SampleResponse)
async def update_sample(
    sample_id: int,
    sample: SampleUpdate,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Update a sample."""
    # Check if sample exists
    async with db.execute("SELECT * FROM samples WHERE id = ?", (sample_id,)) as cursor:
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Sample not found")
    
    # Build update query dynamically
    updates = []
    params = []
    
    if sample.garment_type is not None:
        updates.append("garment_type = ?")
        params.append(sample.garment_type)
    if sample.title is not None:
        updates.append("title = ?")
        params.append(sample.title)
    if sample.description is not None:
        updates.append("description = ?")
        params.append(sample.description)
    
    if updates:
        params.append(sample_id)
        query = f"UPDATE samples SET {', '.join(updates)} WHERE id = ?"
        await db.execute(query, params)
    
    # Update images if provided
    if sample.images is not None:
        # Delete existing images
        await db.execute("DELETE FROM sample_images WHERE sample_id = ?", (sample_id,))
        # Insert new images
        for idx, image_url in enumerate(sample.images):
            await db.execute(
                "INSERT INTO sample_images (sample_id, image_url, display_order) VALUES (?, ?, ?)",
                (sample_id, image_url, idx)
            )
    
    await db.commit()
    
    # Return updated sample
    async with db.execute("SELECT * FROM samples WHERE id = ?", (sample_id,)) as cursor:
        row = await cursor.fetchone()
        
        # Get images
        images_cursor = await db.execute(
            "SELECT * FROM sample_images WHERE sample_id = ? ORDER BY display_order, id",
            (sample_id,)
        )
        image_rows = await images_cursor.fetchall()
        
        images = []
        for img_row in image_rows:
            images.append({
                "id": img_row["id"],
                "sample_id": img_row["sample_id"],
                "image_url": img_row["image_url"],
                "display_order": img_row["display_order"],
                "created_at": img_row["created_at"]
            })
        
        return {
            "id": row["id"],
            "garment_type": row["garment_type"],
            "title": row["title"],
            "description": row["description"],
            "images": images,
            "created_at": row["created_at"]
        }


@app.delete("/api/samples/{sample_id}")
async def delete_sample(sample_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Delete a sample."""
    async with db.execute("SELECT * FROM samples WHERE id = ?", (sample_id,)) as cursor:
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Sample not found")
    
    await db.execute("DELETE FROM samples WHERE id = ?", (sample_id,))
    await db.commit()
    return {"message": "Sample deleted successfully"}


# Staff models
class StaffCreate(BaseModel):
    name: str
    phone: str
    address: Optional[str] = None
    role: str
    join_date: Optional[str] = None


class StaffUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    role: Optional[str] = None
    join_date: Optional[str] = None


class StaffResponse(BaseModel):
    id: int
    name: str
    phone: str
    address: Optional[str]
    role: str
    join_date: str
    created_at: str

    class Config:
        from_attributes = True


# Order-Staff Assignment models
class OrderStaffAssignmentCreate(BaseModel):
    staff_id: int
    assigned_date: Optional[str] = None
    notes: Optional[str] = None


class OrderStaffAssignmentResponse(BaseModel):
    id: int
    order_id: int
    staff_id: int
    staff_name: str
    staff_role: str
    assigned_date: str
    notes: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


# Staff endpoints
@app.get("/api/staff", response_model=List[StaffResponse])
async def get_staff(
    role: Optional[str] = None,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Get all staff, optionally filtered by role."""
    try:
        if role:
            query = "SELECT * FROM staff WHERE role = ? ORDER BY id DESC"
            cursor = await db.execute(query, (role,))
        else:
            query = "SELECT * FROM staff ORDER BY id DESC"
            cursor = await db.execute(query)
        
        rows = await cursor.fetchall()
        
        staff_list = []
        for row in rows:
            staff_list.append({
                "id": row["id"],
                "name": row["name"],
                "phone": row["phone"],
                "address": row["address"],
                "role": row["role"],
                "join_date": row["join_date"],
                "created_at": row["created_at"]
            })
        
        return staff_list
    except Exception as e:
        import traceback
        print(f"[ERROR] Staff error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error fetching staff: {str(e)}")


@app.get("/api/staff/{staff_id}", response_model=StaffResponse)
async def get_staff_member(staff_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Get a specific staff member by ID."""
    async with db.execute("SELECT * FROM staff WHERE id = ?", (staff_id,)) as cursor:
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Staff member not found")
        return {
            "id": row["id"],
            "name": row["name"],
            "phone": row["phone"],
            "address": row["address"],
            "role": row["role"],
            "join_date": row["join_date"],
            "created_at": row["created_at"]
        }


@app.post("/api/staff", response_model=StaffResponse)
async def create_staff(staff: StaffCreate, db: aiosqlite.Connection = Depends(get_db)):
    """Create a new staff member."""
    # Use current date if not provided
    if not staff.join_date:
        date_cursor = await db.execute("SELECT date('now')")
        join_date = (await date_cursor.fetchone())[0]
    else:
        join_date = staff.join_date
    
    cursor = await db.execute(
        "INSERT INTO staff (name, phone, address, role, join_date) VALUES (?, ?, ?, ?, ?)",
        (staff.name, staff.phone, staff.address, staff.role, join_date)
    )
    await db.commit()
    staff_id = cursor.lastrowid
    
    async with db.execute("SELECT * FROM staff WHERE id = ?", (staff_id,)) as cursor:
        row = await cursor.fetchone()
        return {
            "id": row["id"],
            "name": row["name"],
            "phone": row["phone"],
            "address": row["address"],
            "role": row["role"],
            "join_date": row["join_date"],
            "created_at": row["created_at"]
        }


@app.put("/api/staff/{staff_id}", response_model=StaffResponse)
async def update_staff(
    staff_id: int,
    staff: StaffUpdate,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Update a staff member."""
    # Check if staff exists
    async with db.execute("SELECT * FROM staff WHERE id = ?", (staff_id,)) as cursor:
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Staff member not found")
    
    # Build update query dynamically
    updates = []
    params = []
    
    if staff.name is not None:
        updates.append("name = ?")
        params.append(staff.name)
    if staff.phone is not None:
        updates.append("phone = ?")
        params.append(staff.phone)
    if staff.address is not None:
        updates.append("address = ?")
        params.append(staff.address)
    if staff.role is not None:
        updates.append("role = ?")
        params.append(staff.role)
    if staff.join_date is not None:
        updates.append("join_date = ?")
        params.append(staff.join_date)
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    params.append(staff_id)
    query = f"UPDATE staff SET {', '.join(updates)} WHERE id = ?"
    await db.execute(query, params)
    await db.commit()
    
    async with db.execute("SELECT * FROM staff WHERE id = ?", (staff_id,)) as cursor:
        row = await cursor.fetchone()
        return {
            "id": row["id"],
            "name": row["name"],
            "phone": row["phone"],
            "address": row["address"],
            "role": row["role"],
            "join_date": row["join_date"],
            "created_at": row["created_at"]
        }


@app.delete("/api/staff/{staff_id}")
async def delete_staff(staff_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Delete a staff member."""
    async with db.execute("SELECT * FROM staff WHERE id = ?", (staff_id,)) as cursor:
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Staff member not found")
    
    # Check if staff is assigned to any orders
    async with db.execute("SELECT COUNT(*) as count FROM order_staff_assignments WHERE staff_id = ?", (staff_id,)) as cursor:
        count_row = await cursor.fetchone()
        if count_row and count_row["count"] > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete staff member. They are assigned to {count_row['count']} order(s)."
            )
    
    await db.execute("DELETE FROM staff WHERE id = ?", (staff_id,))
    await db.commit()
    return {"message": "Staff member deleted successfully"}


# Order-Staff Assignment endpoints
@app.get("/api/orders/{order_id}/staff", response_model=List[OrderStaffAssignmentResponse])
async def get_order_staff(
    order_id: int,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Get staff assigned to an order."""
    # Verify order exists
    async with db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)) as cursor:
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Order not found")
    
    query = """
        SELECT osa.*, s.name as staff_name, s.role as staff_role
        FROM order_staff_assignments osa
        JOIN staff s ON osa.staff_id = s.id
        WHERE osa.order_id = ?
        ORDER BY osa.assigned_date DESC, osa.id DESC
    """
    
    cursor = await db.execute(query, (order_id,))
    rows = await cursor.fetchall()
    
    assignments = []
    for row in rows:
        assignments.append({
            "id": row["id"],
            "order_id": row["order_id"],
            "staff_id": row["staff_id"],
            "staff_name": row["staff_name"],
            "staff_role": row["staff_role"],
            "assigned_date": row["assigned_date"],
            "notes": row["notes"],
            "created_at": row["created_at"]
        })
    
    return assignments


@app.post("/api/orders/{order_id}/staff", response_model=OrderStaffAssignmentResponse)
async def assign_staff_to_order(
    order_id: int,
    assignment: OrderStaffAssignmentCreate,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Assign staff to an order."""
    # Verify order exists
    async with db.execute("SELECT * FROM orders WHERE id = ?", (order_id,)) as cursor:
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Order not found")
    
    # Verify staff exists
    async with db.execute("SELECT * FROM staff WHERE id = ?", (assignment.staff_id,)) as cursor:
        staff_row = await cursor.fetchone()
        if not staff_row:
            raise HTTPException(status_code=404, detail="Staff member not found")
    
    # Check if already assigned
    async with db.execute(
        "SELECT * FROM order_staff_assignments WHERE order_id = ? AND staff_id = ?",
        (order_id, assignment.staff_id)
    ) as cursor:
        if await cursor.fetchone():
            raise HTTPException(status_code=400, detail="Staff member is already assigned to this order")
    
    # Use current date if not provided
    if not assignment.assigned_date:
        date_cursor = await db.execute("SELECT date('now')")
        assigned_date = (await date_cursor.fetchone())[0]
    else:
        assigned_date = assignment.assigned_date
    
    cursor = await db.execute(
        "INSERT INTO order_staff_assignments (order_id, staff_id, assigned_date, notes) VALUES (?, ?, ?, ?)",
        (order_id, assignment.staff_id, assigned_date, assignment.notes)
    )
    await db.commit()
    assignment_id = cursor.lastrowid
    
    # Return the assignment with staff details
    query = """
        SELECT osa.*, s.name as staff_name, s.role as staff_role
        FROM order_staff_assignments osa
        JOIN staff s ON osa.staff_id = s.id
        WHERE osa.id = ?
    """
    async with db.execute(query, (assignment_id,)) as cursor:
        row = await cursor.fetchone()
        return {
            "id": row["id"],
            "order_id": row["order_id"],
            "staff_id": row["staff_id"],
            "staff_name": row["staff_name"],
            "staff_role": row["staff_role"],
            "assigned_date": row["assigned_date"],
            "notes": row["notes"],
            "created_at": row["created_at"]
        }


@app.delete("/api/orders/{order_id}/staff/{assignment_id}")
async def remove_staff_from_order(
    order_id: int,
    assignment_id: int,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Remove staff assignment from an order."""
    # Verify assignment exists and belongs to the order
    async with db.execute(
        "SELECT * FROM order_staff_assignments WHERE id = ? AND order_id = ?",
        (assignment_id, order_id)
    ) as cursor:
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Staff assignment not found")
    
    await db.execute("DELETE FROM order_staff_assignments WHERE id = ?", (assignment_id,))
    await db.commit()
    return {"message": "Staff assignment removed successfully"}


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

