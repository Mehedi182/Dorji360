// Zustand store for delivery management

import { create } from 'zustand';
import { api, type Delivery } from '../lib/api';

interface DeliveryState {
  deliveries: Delivery[];
  loading: boolean;
  error: string | null;
  fetchDeliveries: (startDate?: string, endDate?: string, status?: string) => Promise<void>;
}

export const useDeliveryStore = create<DeliveryState>((set) => ({
  deliveries: [],
  loading: false,
  error: null,

  fetchDeliveries: async (startDate?: string, endDate?: string, status?: string) => {
    set({ loading: true, error: null });
    try {
      const deliveries = await api.getDeliveries(startDate, endDate, status);
      set({ deliveries, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch deliveries',
        loading: false,
      });
    }
  },
}));

