// Zustand store for customer management

import { create } from 'zustand';
import { api, type Customer, type CustomerCreate, type CustomerUpdate } from '../lib/api';

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  selectedCustomer: Customer | null;
  fetchCustomers: (search?: string) => Promise<void>;
  fetchCustomer: (id: number) => Promise<void>;
  createCustomer: (customer: CustomerCreate) => Promise<void>;
  updateCustomer: (id: number, customer: CustomerUpdate) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
  setSelectedCustomer: (customer: Customer | null) => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  loading: false,
  error: null,
  selectedCustomer: null,

  fetchCustomers: async (search?: string) => {
    set({ loading: true, error: null });
    try {
      const customers = await api.getCustomers(search);
      set({ customers, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch customers', loading: false });
    }
  },

  fetchCustomer: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const customer = await api.getCustomer(id);
      set({ selectedCustomer: customer, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch customer', loading: false });
    }
  },

  createCustomer: async (customer: CustomerCreate) => {
    set({ loading: true, error: null });
    try {
      const newCustomer = await api.createCustomer(customer);
      set((state) => ({
        customers: [newCustomer, ...state.customers],
        loading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create customer', loading: false });
      throw error;
    }
  },

  updateCustomer: async (id: number, customer: CustomerUpdate) => {
    set({ loading: true, error: null });
    try {
      const updatedCustomer = await api.updateCustomer(id, customer);
      set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? updatedCustomer : c)),
        selectedCustomer: state.selectedCustomer?.id === id ? updatedCustomer : state.selectedCustomer,
        loading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update customer', loading: false });
      throw error;
    }
  },

  deleteCustomer: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await api.deleteCustomer(id);
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
        selectedCustomer: state.selectedCustomer?.id === id ? null : state.selectedCustomer,
        loading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete customer', loading: false });
      throw error;
    }
  },

  setSelectedCustomer: (customer: Customer | null) => {
    set({ selectedCustomer: customer });
  },
}));

