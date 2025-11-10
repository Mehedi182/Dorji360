#!/usr/bin/env python3
"""
Initialize the SQLite database with schema and default measurement templates.
"""

import sqlite3
import json
import os
from pathlib import Path

DB_PATH = Path(__file__).parent / "tailor360.db"

# Default measurement templates
DEFAULT_TEMPLATES = [
    {
        "garment_type": "blazer",
        "gender": "male",
        "display_name": "Blazer (Male)",
        "fields": {
            "chest": "Chest",
            "waist": "Waist",
            "shoulder": "Shoulder",
            "sleeve_length": "Sleeve Length",
            "back_length": "Back Length",
            "front_length": "Front Length",
            "collar": "Collar",
            "bicep": "Bicep"
        }
    },
    {
        "garment_type": "pant",
        "gender": "male",
        "display_name": "Pant (Male)",
        "fields": {
            "waist": "Waist",
            "hip": "Hip",
            "inseam": "Inseam",
            "outseam": "Outseam",
            "thigh": "Thigh",
            "cuff_width": "Cuff Width",
            "knee": "Knee"
        }
    },
    {
        "garment_type": "shirt",
        "gender": "male",
        "display_name": "Shirt (Male)",
        "fields": {
            "chest": "Chest",
            "waist": "Waist",
            "shoulder": "Shoulder",
            "sleeve_length": "Sleeve Length",
            "neck": "Neck",
            "shirt_length": "Shirt Length",
            "bicep": "Bicep"
        }
    },
    {
        "garment_type": "salwar",
        "gender": "female",
        "display_name": "Salwar",
        "fields": {
            "waist": "Waist",
            "hip": "Hip",
            "length": "Length",
            "bottom_width": "Bottom Width",
            "thigh": "Thigh"
        }
    },
    {
        "garment_type": "panjabi",
        "gender": "male",
        "display_name": "Panjabi",
        "fields": {
            "chest": "Chest",
            "waist": "Waist",
            "length": "Length",
            "shoulder": "Shoulder",
            "sleeve_length": "Sleeve Length"
        }
    },
    {
        "garment_type": "blouse",
        "gender": "female",
        "display_name": "Blouse",
        "fields": {
            "chest": "Chest",
            "waist": "Waist",
            "shoulder": "Shoulder",
            "sleeve_length": "Sleeve Length",
            "length": "Length",
            "bust": "Bust"
        }
    }
]


def init_database():
    """Initialize database with schema and default data."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Read and execute schema
    schema_path = Path(__file__).parent / "schema.sql"
    with open(schema_path, 'r') as f:
        schema = f.read()
        cursor.executescript(schema)
    
    # Insert default measurement templates
    for template in DEFAULT_TEMPLATES:
        cursor.execute("""
            INSERT OR IGNORE INTO measurement_templates 
            (garment_type, gender, fields_json, display_name)
            VALUES (?, ?, ?, ?)
        """, (
            template["garment_type"],
            template["gender"],
            json.dumps(template["fields"]),
            template["display_name"]
        ))
    
    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_PATH}")


if __name__ == "__main__":
    init_database()

