import { create } from 'zustand';
import { api, type Staff, type StaffCreate, type StaffUpdate } from '../lib/api';

interface StaffState {
  staff: Staff[];
  loading: boolean;
  error: string | null;
  selectedStaff: Staff | null;
  fetchStaff: (role?: string) => Promise<void>;
  fetchStaffById: (id: number) => Promise<void>;
  createStaff: (staff: StaffCreate) => Promise<void>;
  updateStaff: (id: number, staff: StaffUpdate) => Promise<void>;
  deleteStaff: (id: number) => Promise<void>;
  setSelectedStaff: (staff: Staff | null) => void;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  staff: [],
  loading: false,
  error: null,
  selectedStaff: null,

  fetchStaff: async (role?: string) => {
    set({ loading: true, error: null });
    try {
      const staffList = await api.getStaff(role);
      set({ staff: staffList, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch staff',
        loading: false,
      });
    }
  },

  fetchStaffById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const staffMember = await api.getStaffById(id);
      set({ selectedStaff: staffMember, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch staff member',
        loading: false,
      });
      throw error;
    }
  },

  createStaff: async (staff: StaffCreate) => {
    set({ loading: true, error: null });
    try {
      await api.createStaff(staff);
      await get().fetchStaff();
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create staff member',
        loading: false,
      });
      throw error;
    }
  },

  updateStaff: async (id: number, staff: StaffUpdate) => {
    set({ loading: true, error: null });
    try {
      await api.updateStaff(id, staff);
      // Update selectedStaff if it's the one being updated
      const currentSelected = get().selectedStaff;
      if (currentSelected && currentSelected.id === id) {
        const updatedStaff = await api.getStaffById(id);
        set({ selectedStaff: updatedStaff });
      }
      await get().fetchStaff();
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update staff member',
        loading: false,
      });
      throw error;
    }
  },

  deleteStaff: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await api.deleteStaff(id);
      // Clear selectedStaff if it's the one being deleted
      const currentSelected = get().selectedStaff;
      if (currentSelected && currentSelected.id === id) {
        set({ selectedStaff: null });
      }
      await get().fetchStaff();
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete staff member',
        loading: false,
      });
      throw error;
    }
  },

  setSelectedStaff: (staff: Staff | null) => {
    set({ selectedStaff: staff });
  },
}));

