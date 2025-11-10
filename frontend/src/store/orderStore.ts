// Zustand store for order management

import { create } from 'zustand';
import {
  api,
  type OrderWithDetails,
  type OrderCreate,
  type OrderUpdate,
} from '../lib/api';

interface OrderState {
  orders: OrderWithDetails[];
  loading: boolean;
  error: string | null;
  selectedOrder: OrderWithDetails | null;
  fetchOrders: (customerId?: number, status?: string) => Promise<void>;
  fetchOrder: (id: number) => Promise<void>;
  createOrder: (order: OrderCreate) => Promise<void>;
  updateOrder: (id: number, order: OrderUpdate) => Promise<void>;
  deleteOrder: (id: number) => Promise<void>;
  setSelectedOrder: (order: OrderWithDetails | null) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  selectedOrder: null,

  fetchOrders: async (customerId?: number, status?: string) => {
    set({ loading: true, error: null });
    try {
      const orders = await api.getOrders(customerId, status);
      set({ orders, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
        loading: false,
      });
    }
  },

  fetchOrder: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const order = await api.getOrder(id);
      set({ selectedOrder: order, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch order',
        loading: false,
      });
    }
  },

  createOrder: async (order: OrderCreate) => {
    set({ loading: true, error: null });
    try {
      await api.createOrder(order);
      await get().fetchOrders();
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create order',
        loading: false,
      });
      throw error;
    }
  },

  updateOrder: async (id: number, order: OrderUpdate) => {
    set({ loading: true, error: null });
    try {
      await api.updateOrder(id, order);
      // Update selectedOrder if it's the one being updated
      const currentSelected = get().selectedOrder;
      if (currentSelected && currentSelected.id === id) {
        const updatedOrder = await api.getOrder(id);
        set({ selectedOrder: updatedOrder });
      }
      await get().fetchOrders();
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update order',
        loading: false,
      });
      throw error;
    }
  },

  deleteOrder: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await api.deleteOrder(id);
      set((state) => ({
        orders: state.orders.filter((o) => o.id !== id),
        selectedOrder: state.selectedOrder?.id === id ? null : state.selectedOrder,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete order',
        loading: false,
      });
      throw error;
    }
  },

  setSelectedOrder: (order: OrderWithDetails | null) => {
    set({ selectedOrder: order });
  },
}));

