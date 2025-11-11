// Zustand store for measurement management

import { create } from 'zustand';
import {
  api,
  type MeasurementTemplate,
  type MeasurementWithCustomer,
  type MeasurementCreate,
  type MeasurementTemplateCreate,
  type MeasurementTemplateUpdate,
} from '../lib/api';

interface MeasurementState {
  templates: MeasurementTemplate[];
  measurements: MeasurementWithCustomer[];
  loading: boolean;
  error: string | null;
  selectedMeasurement: MeasurementWithCustomer | null;
  selectedTemplate: MeasurementTemplate | null;
  fetchTemplates: (garmentType?: string, gender?: string) => Promise<void>;
  fetchTemplate: (id: number) => Promise<void>;
  fetchMeasurements: (customerId?: number, garmentType?: string) => Promise<void>;
  fetchMeasurement: (id: number) => Promise<void>;
  createMeasurement: (measurement: MeasurementCreate) => Promise<void>;
  updateMeasurement: (id: number, measurementsJson: Record<string, number>) => Promise<void>;
  deleteMeasurement: (id: number) => Promise<void>;
  setSelectedMeasurement: (measurement: MeasurementWithCustomer | null) => void;
  createTemplate: (template: MeasurementTemplateCreate) => Promise<void>;
  updateTemplate: (id: number, template: MeasurementTemplateUpdate) => Promise<void>;
  deleteTemplate: (id: number) => Promise<void>;
}

export const useMeasurementStore = create<MeasurementState>((set, get) => ({
  templates: [],
  measurements: [],
  loading: false,
  error: null,
  selectedMeasurement: null,
  selectedTemplate: null,

  fetchTemplates: async (garmentType?: string, gender?: string) => {
    set({ loading: true, error: null });
    try {
      const templates = await api.getMeasurementTemplates(garmentType, gender);
      set({ templates, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch templates',
        loading: false,
      });
    }
  },

  fetchTemplate: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const template = await api.getMeasurementTemplate(id);
      set({ selectedTemplate: template, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch template',
        loading: false,
      });
    }
  },

  fetchMeasurements: async (customerId?: number, garmentType?: string) => {
    set({ loading: true, error: null });
    try {
      const measurements = await api.getMeasurements(customerId, garmentType);
      set({ measurements, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch measurements',
        loading: false,
      });
    }
  },

  fetchMeasurement: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const measurement = await api.getMeasurement(id);
      set({ selectedMeasurement: measurement, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch measurement',
        loading: false,
      });
    }
  },

  createMeasurement: async (measurement: MeasurementCreate) => {
    set({ loading: true, error: null });
    try {
      await api.createMeasurement(measurement);
      // Refresh measurements list
      await get().fetchMeasurements();
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create measurement',
        loading: false,
      });
      throw error;
    }
  },

  updateMeasurement: async (id: number, measurementsJson: Record<string, number>) => {
    set({ loading: true, error: null });
    try {
      await api.updateMeasurement(id, measurementsJson);
      // Refresh measurements list
      await get().fetchMeasurements();
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update measurement',
        loading: false,
      });
      throw error;
    }
  },

  deleteMeasurement: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await api.deleteMeasurement(id);
      set((state) => ({
        measurements: state.measurements.filter((m) => m.id !== id),
        selectedMeasurement:
          state.selectedMeasurement?.id === id ? null : state.selectedMeasurement,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete measurement',
        loading: false,
      });
      throw error;
    }
  },

  setSelectedMeasurement: (measurement: MeasurementWithCustomer | null) => {
    set({ selectedMeasurement: measurement });
  },

  createTemplate: async (template: MeasurementTemplateCreate) => {
    set({ loading: true, error: null });
    try {
      const newTemplate = await api.createMeasurementTemplate(template);
      set((state) => ({
        templates: [...state.templates, newTemplate],
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create template',
        loading: false,
      });
      throw error;
    }
  },

  updateTemplate: async (id: number, template: MeasurementTemplateUpdate) => {
    set({ loading: true, error: null });
    try {
      const updatedTemplate = await api.updateMeasurementTemplate(id, template);
      set((state) => ({
        templates: state.templates.map((t) => (t.id === id ? updatedTemplate : t)),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update template',
        loading: false,
      });
      throw error;
    }
  },

  deleteTemplate: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await api.deleteMeasurementTemplate(id);
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete template',
        loading: false,
      });
      throw error;
    }
  },
}));

