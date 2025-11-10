import { useEffect, useState } from 'react';
import { useMeasurementStore } from '../store/measurementStore';
import { useCustomerStore } from '../store/customerStore';
import type { MeasurementTemplate, MeasurementCreate } from '../lib/api';

interface MeasurementFormProps {
  measurementId?: number | null;
  customerId?: number | null;
  onClose: () => void;
}

export default function MeasurementForm({ measurementId, customerId, onClose }: MeasurementFormProps) {
  const {
    templates,
    loading: templatesLoading,
    fetchTemplates,
    createMeasurement,
    updateMeasurement,
    selectedMeasurement,
    fetchMeasurement,
    loading,
  } = useMeasurementStore();
  const { customers, fetchCustomers } = useCustomerStore();

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>(customerId || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('');
  const [selectedTemplate, setSelectedTemplate] = useState<MeasurementTemplate | null>(null);
  const [measurements, setMeasurements] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCustomers();
    if (measurementId) {
      fetchMeasurement(measurementId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurementId]);

  // Fetch templates filtered by customer's gender when customer is selected
  useEffect(() => {
    if (selectedCustomerId) {
      const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
      if (selectedCustomer) {
        // Fetch templates matching customer's gender or unisex
        const genderFilter = selectedCustomer.gender === 'unisex' ? undefined : selectedCustomer.gender;
        fetchTemplates(undefined, genderFilter);
      } else {
        fetchTemplates();
      }
    } else {
      fetchTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomerId, customers]);

  useEffect(() => {
    if (selectedMeasurement && measurementId && selectedMeasurement.id === measurementId) {
      setSelectedCustomerId(selectedMeasurement.customer_id);
      setSelectedTemplateId(selectedMeasurement.template_id);
      setMeasurements(selectedMeasurement.measurements_json);
      const template = templates.find((t) => t.id === selectedMeasurement.template_id);
      if (template) setSelectedTemplate(template);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMeasurement, measurementId, templates]);

  const handleTemplateChange = (templateId: number) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((t) => t.id === templateId);
    setSelectedTemplate(template || null);
    // Reset measurements when template changes
    setMeasurements({});
  };

  const handleMeasurementChange = (field: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setMeasurements({ ...measurements, [field]: numValue });
      // Clear error for this field
      if (errors[field]) {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
      }
    } else if (value === '') {
      const newMeasurements = { ...measurements };
      delete newMeasurements[field];
      setMeasurements(newMeasurements);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedCustomerId) {
      newErrors.customer = 'Customer is required';
    }
    if (!selectedTemplateId) {
      newErrors.template = 'Template is required';
    }
    if (selectedTemplate) {
      // Check if all required fields are filled
      const requiredFields = Object.keys(selectedTemplate.fields_json);
      for (const field of requiredFields) {
        if (!measurements[field] || measurements[field] <= 0) {
          newErrors[field] = `${selectedTemplate.fields_json[field]} is required`;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const measurementData: MeasurementCreate = {
        customer_id: Number(selectedCustomerId),
        garment_type: selectedTemplate!.garment_type,
        template_id: Number(selectedTemplateId),
        measurements_json: measurements,
      };

      if (measurementId) {
        await updateMeasurement(measurementId, measurements);
      } else {
        await createMeasurement(measurementData);
      }
      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {measurementId ? 'Edit Measurement' : 'Add New Measurement'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Selection */}
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
                Customer *
              </label>
              <select
                id="customer"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : '')}
                disabled={!!customerId}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.customer ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
              {errors.customer && <p className="mt-1 text-sm text-red-600">{errors.customer}</p>}
            </div>

            {/* Template Selection */}
            <div>
              <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
                Garment Template *
              </label>
              {templatesLoading ? (
                <div className="text-gray-500">Loading templates...</div>
              ) : (
                <select
                  id="template"
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.template ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.display_name}
                    </option>
                  ))}
                </select>
              )}
              {errors.template && <p className="mt-1 text-sm text-red-600">{errors.template}</p>}
            </div>

            {/* Dynamic Measurement Fields */}
            {selectedTemplate && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Measurements ({selectedTemplate.display_name})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedTemplate.fields_json).map(([field, displayName]) => (
                    <div key={field}>
                      <label
                        htmlFor={field}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {displayName} (cm) *
                      </label>
                      <input
                        type="number"
                        id={field}
                        step="0.1"
                        min="0"
                        value={measurements[field] || ''}
                        onChange={(e) => handleMeasurementChange(field, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[field] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0.0"
                      />
                      {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : measurementId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

