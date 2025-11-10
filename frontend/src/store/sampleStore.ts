import { create } from 'zustand';
import { api, type Sample, type SampleCreate, type SampleUpdate } from '../lib/api';

interface SampleState {
  samples: Sample[];
  loading: boolean;
  error: string | null;
  selectedSample: Sample | null;
  fetchSamples: (garmentType?: string) => Promise<void>;
  fetchSample: (id: number) => Promise<void>;
  createSample: (sample: SampleCreate) => Promise<void>;
  updateSample: (id: number, sample: SampleUpdate) => Promise<void>;
  deleteSample: (id: number) => Promise<void>;
  setSelectedSample: (sample: Sample | null) => void;
}

export const useSampleStore = create<SampleState>((set, get) => ({
  samples: [],
  loading: false,
  error: null,
  selectedSample: null,

  fetchSamples: async (garmentType?: string) => {
    set({ loading: true, error: null });
    try {
      const samples = await api.getSamples(garmentType);
      set({ samples, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch samples',
        loading: false,
      });
    }
  },

  fetchSample: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const sample = await api.getSample(id);
      set({ selectedSample: sample, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch sample',
        loading: false,
      });
      throw error;
    }
  },

  createSample: async (sample: SampleCreate) => {
    set({ loading: true, error: null });
    try {
      await api.createSample(sample);
      await get().fetchSamples();
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create sample',
        loading: false,
      });
      throw error;
    }
  },

  updateSample: async (id: number, sample: SampleUpdate) => {
    set({ loading: true, error: null });
    try {
      await api.updateSample(id, sample);
      // Update selectedSample if it's the one being updated
      const currentSelected = get().selectedSample;
      if (currentSelected && currentSelected.id === id) {
        const updatedSample = await api.getSample(id);
        set({ selectedSample: updatedSample });
      }
      await get().fetchSamples();
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update sample',
        loading: false,
      });
      throw error;
    }
  },

  deleteSample: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await api.deleteSample(id);
      // Clear selectedSample if it's the one being deleted
      const currentSelected = get().selectedSample;
      if (currentSelected && currentSelected.id === id) {
        set({ selectedSample: null });
      }
      await get().fetchSamples();
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete sample',
        loading: false,
      });
      throw error;
    }
  },

  setSelectedSample: (sample: Sample | null) => {
    set({ selectedSample: sample });
  },
}));

