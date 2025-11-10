// Zustand store for payment management

import { create } from 'zustand';
import {
  api,
  type Payment,
  type PaymentCreate,
} from '../lib/api';

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  fetchPayments: (orderId?: number) => Promise<void>;
  createPayment: (payment: PaymentCreate) => Promise<void>;
  deletePayment: (id: number) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  loading: false,
  error: null,

  fetchPayments: async (orderId?: number) => {
    set({ loading: true, error: null });
    try {
      const payments = await api.getPayments(orderId);
      set({ payments, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch payments',
        loading: false,
      });
    }
  },

  createPayment: async (payment: PaymentCreate) => {
    set({ loading: true, error: null });
    try {
      await api.createPayment(payment);
      await get().fetchPayments(payment.order_id);
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create payment',
        loading: false,
      });
      throw error;
    }
  },

  deletePayment: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const payment = get().payments.find((p) => p.id === id);
      await api.deletePayment(id);
      await get().fetchPayments(payment?.order_id);
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete payment',
        loading: false,
      });
      throw error;
    }
  },
}));

