// Shared types between frontend and backend

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  created_at: string;
}

export interface MeasurementTemplate {
  id: number;
  garment_type: string;
  gender: 'male' | 'female' | 'unisex';
  fields_json: Record<string, string>; // field_name -> display_name
  display_name: string;
}

export interface Measurement {
  id: number;
  customer_id: number;
  garment_type: string;
  template_id: number;
  measurements_json: Record<string, number>; // field_name -> value
  created_at: string;
}

export interface Order {
  id: number;
  customer_id: number;
  order_date: string;
  delivery_date: string;
  status: 'pending' | 'cutting' | 'sewing' | 'ready' | 'delivered';
  total_amount: number;
  notes?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  garment_type: string;
  quantity: number;
  price: number;
  fabric_details?: string;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  payment_type: 'advance' | 'partial' | 'full';
  payment_method: 'cash' | 'bkash' | 'nagad' | 'other';
  date: string;
  notes?: string;
}

