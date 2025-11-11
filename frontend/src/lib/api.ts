// API client for backend communication

// Use direct backend URL in development, or env variable in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  gender: 'male' | 'female' | 'unisex';
  address?: string;
  notes?: string;
  created_at: string;
}

export interface CustomerCreate {
  name: string;
  phone: string;
  gender?: 'male' | 'female' | 'unisex';
  address?: string;
  notes?: string;
}

export interface CustomerUpdate {
  name?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'unisex';
  address?: string;
  notes?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('[API] Request:', url, options.method || 'GET');
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Handle empty responses (204 No Content, etc.)
      const contentLength = response.headers.get('content-length');
      
      // If no content (204) or content-length is 0, return empty result
      if (response.status === 204 || contentLength === '0') {
        return undefined as T;
      }

      // Read response as text first to check if it's empty
      const text = await response.text();
      
      // If response is empty, return undefined
      if (!text || text.trim() === '') {
        return undefined as T;
      }

      // Try to parse JSON
      try {
        const data = JSON.parse(text);
        console.log('[API] Response:', endpoint, data);
        return data;
      } catch (parseError) {
        // If JSON parsing fails but status is OK (200-299), return empty
        // This handles cases where server returns empty body with 200 status
        if (response.status >= 200 && response.status < 300) {
          return undefined as T;
        }
        // For other status codes, throw the parse error
        throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[API] Error:', endpoint, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error: Failed to fetch');
    }
  }

  // Customer endpoints
  async getCustomers(search?: string): Promise<Customer[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<Customer[]>(`/api/customers${query}`);
  }

  async getCustomer(id: number): Promise<Customer> {
    return this.request<Customer>(`/api/customers/${id}`);
  }

  async createCustomer(customer: CustomerCreate): Promise<Customer> {
    return this.request<Customer>('/api/customers/', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async updateCustomer(id: number, customer: CustomerUpdate): Promise<Customer> {
    return this.request<Customer>(`/api/customers/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  }

  async deleteCustomer(id: number): Promise<void> {
    return this.request<void>(`/api/customers/${id}/`, {
      method: 'DELETE',
    });
  }

  // Measurement Template endpoints
  async getMeasurementTemplates(garmentType?: string, gender?: string): Promise<MeasurementTemplate[]> {
    const params = new URLSearchParams();
    if (garmentType) params.append('garment_type', garmentType);
    if (gender) params.append('gender', gender);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<MeasurementTemplate[]>(`/api/measurement-templates${query}`);
  }

  async getMeasurementTemplate(id: number): Promise<MeasurementTemplate> {
    return this.request<MeasurementTemplate>(`/api/measurement-templates/${id}`);
  }

  async createMeasurementTemplate(template: MeasurementTemplateCreate): Promise<MeasurementTemplate> {
    return this.request<MeasurementTemplate>('/api/measurement-templates/', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async updateMeasurementTemplate(
    id: number,
    template: MeasurementTemplateUpdate
  ): Promise<MeasurementTemplate> {
    return this.request<MeasurementTemplate>(`/api/measurement-templates/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  }

  async deleteMeasurementTemplate(id: number): Promise<void> {
    return this.request<void>(`/api/measurement-templates/${id}/`, {
      method: 'DELETE',
    });
  }

  // Measurement endpoints
  async getMeasurements(customerId?: number, garmentType?: string): Promise<MeasurementWithCustomer[]> {
    const params = new URLSearchParams();
    if (customerId) params.append('customer_id', customerId.toString());
    if (garmentType) params.append('garment_type', garmentType);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<MeasurementWithCustomer[]>(`/api/measurements${query}`);
  }

  async getMeasurement(id: number): Promise<MeasurementWithCustomer> {
    return this.request<MeasurementWithCustomer>(`/api/measurements/${id}`);
  }

  async createMeasurement(measurement: MeasurementCreate): Promise<Measurement> {
    return this.request<Measurement>('/api/measurements/', {
      method: 'POST',
      body: JSON.stringify(measurement),
    });
  }

  async updateMeasurement(id: number, measurementsJson: Record<string, number>): Promise<Measurement> {
    return this.request<Measurement>(`/api/measurements/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(measurementsJson),
    });
  }

  async deleteMeasurement(id: number): Promise<void> {
    return this.request<void>(`/api/measurements/${id}/`, {
      method: 'DELETE',
    });
  }

  // Order endpoints
  async getOrders(customerId?: number, status?: string): Promise<OrderWithDetails[]> {
    const params = new URLSearchParams();
    if (customerId) params.append('customer_id', customerId.toString());
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<OrderWithDetails[]>(`/api/orders${query}`);
  }

  async getOrder(id: number): Promise<OrderWithDetails> {
    return this.request<OrderWithDetails>(`/api/orders/${id}`);
  }

  async createOrder(order: OrderCreate): Promise<Order> {
    return this.request<Order>('/api/orders/', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrder(id: number, order: OrderUpdate): Promise<Order> {
    return this.request<Order>(`/api/orders/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  }

  async deleteOrder(id: number): Promise<void> {
    return this.request<void>(`/api/orders/${id}/`, {
      method: 'DELETE',
    });
  }

  // Payment endpoints
  async getPayments(orderId?: number): Promise<Payment[]> {
    const query = orderId ? `?order_id=${orderId}` : '';
    return this.request<Payment[]>(`/api/payments${query}`);
  }

  async getPayment(id: number): Promise<Payment> {
    return this.request<Payment>(`/api/payments/${id}`);
  }

  async createPayment(payment: PaymentCreate): Promise<Payment> {
    return this.request<Payment>('/api/payments/', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async deletePayment(id: number): Promise<void> {
    return this.request<void>(`/api/payments/${id}/`, {
      method: 'DELETE',
    });
  }

  // Delivery endpoints
  async getDeliveries(startDate?: string, endDate?: string, status?: string): Promise<Delivery[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Delivery[]>(`/api/deliveries${query}`);
  }

  // Sample endpoints
  async getSamples(garmentType?: string): Promise<Sample[]> {
    const query = garmentType ? `?garment_type=${garmentType}` : '';
    return this.request<Sample[]>(`/api/samples${query}`);
  }

  async getSample(id: number): Promise<Sample> {
    return this.request<Sample>(`/api/samples/${id}`);
  }

  async createSample(sample: SampleCreate): Promise<Sample> {
    return this.request<Sample>('/api/samples/', {
      method: 'POST',
      body: JSON.stringify(sample),
    });
  }

  async updateSample(id: number, sample: SampleUpdate): Promise<Sample> {
    return this.request<Sample>(`/api/samples/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(sample),
    });
  }

  async deleteSample(id: number): Promise<void> {
    return this.request<void>(`/api/samples/${id}/`, {
      method: 'DELETE',
    });
  }

  // Staff endpoints
  async getStaff(role?: string): Promise<Staff[]> {
    const query = role ? `?role=${role}` : '';
    return this.request<Staff[]>(`/api/staff${query}`);
  }

  async getStaffById(id: number): Promise<Staff> {
    return this.request<Staff>(`/api/staff/${id}`);
  }

  async createStaff(staff: StaffCreate): Promise<Staff> {
    return this.request<Staff>('/api/staff/', {
      method: 'POST',
      body: JSON.stringify(staff),
    });
  }

  async updateStaff(id: number, staff: StaffUpdate): Promise<Staff> {
    return this.request<Staff>(`/api/staff/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(staff),
    });
  }

  async deleteStaff(id: number): Promise<void> {
    return this.request<void>(`/api/staff/${id}/`, {
      method: 'DELETE',
    });
  }

  // Order-Staff Assignment endpoints
  async getOrderStaff(orderId: number): Promise<OrderStaffAssignment[]> {
    return this.request<OrderStaffAssignment[]>(`/api/orders/${orderId}/staff/`);
  }

  async assignStaffToOrder(orderId: number, assignment: OrderStaffAssignmentCreate): Promise<OrderStaffAssignment> {
    return this.request<OrderStaffAssignment>(`/api/orders/${orderId}/staff/`, {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  }

  async removeStaffFromOrder(orderId: number, assignmentId: number): Promise<void> {
    return this.request<void>(`/api/orders/${orderId}/staff/${assignmentId}/`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();

// Measurement types
export interface MeasurementTemplate {
  id: number;
  garment_type: string;
  gender: 'male' | 'female' | 'unisex';
  fields_json: Record<string, string | string[]>; // field_name -> display_name, or _order -> string[]
  display_name: string;
  created_at: string;
}

export interface Measurement {
  id: number;
  customer_id: number;
  garment_type: string;
  template_id: number;
  measurements_json: Record<string, number>; // field_name -> value
  created_at: string;
}

export interface MeasurementWithCustomer extends Measurement {
  customer_name: string;
  customer_phone: string;
  template_name: string;
}

export interface MeasurementCreate {
  customer_id: number;
  garment_type: string;
  template_id: number;
  measurements_json: Record<string, number>;
}

export interface MeasurementTemplateCreate {
  garment_type: string;
  gender: 'male' | 'female' | 'unisex';
  fields_json: Record<string, string>;
  display_name: string;
}

export interface MeasurementTemplateUpdate {
  garment_type?: string;
  gender?: 'male' | 'female' | 'unisex';
  fields_json?: Record<string, string>;
  display_name?: string;
}

// Order types
export interface OrderItem {
  id: number;
  order_id: number;
  garment_type: string;
  quantity: number;
  price: number;
  fabric_details?: string;
}

export interface OrderItemCreate {
  garment_type: string;
  quantity: number;
  price: number;
  fabric_details?: string;
}

export interface Order {
  id: number;
  customer_id: number;
  order_date: string;
  delivery_date: string;
  status: 'pending' | 'cutting' | 'sewing' | 'ready' | 'delivered';
  total_amount: number;
  notes?: string;
  created_at: string;
}

export interface OrderStaffAssignment {
  id: number;
  order_id: number;
  staff_id: number;
  staff_name: string;
  staff_role: string;
  assigned_date: string;
  notes?: string;
  created_at: string;
}

export interface OrderWithDetails extends Order {
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  paid_amount: number;
  remaining_amount: number;
  assigned_staff?: OrderStaffAssignment[];
}

export interface OrderCreate {
  customer_id: number;
  order_date?: string;
  delivery_date: string;
  items: OrderItemCreate[];
  notes?: string;
  assigned_staff_ids?: number[];
}

export interface OrderUpdate {
  status?: 'pending' | 'cutting' | 'sewing' | 'ready' | 'delivered';
  delivery_date?: string;
  notes?: string;
}

// Payment types
export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  payment_type: 'advance' | 'partial' | 'full';
  payment_method: 'cash' | 'bkash' | 'nagad' | 'other';
  date: string;
  notes?: string;
  created_at: string;
}

export interface PaymentCreate {
  order_id: number;
  amount: number;
  payment_type: 'advance' | 'partial' | 'full';
  payment_method: 'cash' | 'bkash' | 'nagad' | 'other';
  date?: string;
  notes?: string;
}

// Delivery types
export interface Delivery {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  order_date: string;
  delivery_date: string;
  status: 'pending' | 'cutting' | 'sewing' | 'ready' | 'delivered';
  total_amount: number;
  notes?: string;
  created_at: string;
  paid_amount: number;
  remaining_amount: number;
}

// Sample types
export interface SampleImage {
  id: number;
  sample_id: number;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface Sample {
  id: number;
  garment_type: string;
  title: string;
  description?: string;
  images: SampleImage[];
  created_at: string;
}

export interface SampleCreate {
  garment_type: string;
  title: string;
  description?: string;
  images: string[]; // Array of image URLs (base64 or URLs)
}

export interface SampleUpdate {
  garment_type?: string;
  title?: string;
  description?: string;
  images?: string[]; // Array of image URLs
}

// Staff types
export interface Staff {
  id: number;
  name: string;
  phone: string;
  address?: string;
  role: 'master_tailor' | 'tailor' | 'assistant_tailor' | 'cutting_master' | 'sewing_operator' | 'finishing' | 'receptionist' | 'delivery_person' | 'accountant' | 'other';
  join_date: string;
  created_at: string;
}

export interface StaffCreate {
  name: string;
  phone: string;
  address?: string;
  role: 'master_tailor' | 'tailor' | 'assistant_tailor' | 'cutting_master' | 'sewing_operator' | 'finishing' | 'receptionist' | 'delivery_person' | 'accountant' | 'other';
  join_date?: string;
}

export interface StaffUpdate {
  name?: string;
  phone?: string;
  address?: string;
  role?: 'master_tailor' | 'tailor' | 'assistant_tailor' | 'cutting_master' | 'sewing_operator' | 'finishing' | 'receptionist' | 'delivery_person' | 'accountant' | 'other';
  join_date?: string;
}

export interface OrderStaffAssignmentCreate {
  staff_id: number;
  assigned_date?: string;
  notes?: string;
}

