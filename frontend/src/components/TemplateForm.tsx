import { useEffect, useState } from 'react';
import { useMeasurementStore } from '../store/measurementStore';
import type { MeasurementTemplateCreate, MeasurementTemplateUpdate } from '../lib/api';

interface TemplateFormProps {
  templateId?: number | null;
  onClose: () => void;
}

export default function TemplateForm({ templateId, onClose }: TemplateFormProps) {
  const {
    templates,
    loading,
    fetchTemplates,
    selectedTemplate,
    fetchTemplate,
    createTemplate,
    updateTemplate,
  } = useMeasurementStore();

  const [formData, setFormData] = useState({
    garment_type: '',
    gender: 'unisex' as 'male' | 'female' | 'unisex',
    display_name: '',
    fields: [] as Array<{ key: string; label: string }>,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');

  useEffect(() => {
    fetchTemplates();
    if (templateId) {
      fetchTemplate(templateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  useEffect(() => {
    if (selectedTemplate && templateId && selectedTemplate.id === templateId) {
      setFormData({
        garment_type: selectedTemplate.garment_type,
        gender: selectedTemplate.gender,
        display_name: selectedTemplate.display_name,
        fields: Object.entries(selectedTemplate.fields_json).map(([key, label]) => ({
          key,
          label,
        })),
      });
    }
  }, [selectedTemplate, templateId]);

  const handleAddField = () => {
    if (!newFieldKey.trim() || !newFieldLabel.trim()) {
      setErrors({ ...errors, newField: 'Both key and label are required' });
      return;
    }

    // Check if key already exists
    if (formData.fields.some((f) => f.key === newFieldKey.trim())) {
      setErrors({ ...errors, newField: 'Field key already exists' });
      return;
    }

    setFormData({
      ...formData,
      fields: [...formData.fields, { key: newFieldKey.trim(), label: newFieldLabel.trim() }],
    });
    setNewFieldKey('');
    setNewFieldLabel('');
    setErrors({ ...errors, newField: '' });
  };

  const handleRemoveField = (index: number) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter((_, i) => i !== index),
    });
  };

  const handleFieldChange = (index: number, field: 'key' | 'label', value: string) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], [field]: value };
    setFormData({ ...formData, fields: newFields });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.garment_type.trim()) {
      newErrors.garment_type = 'Garment type is required';
    }
    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Display name is required';
    }
    if (formData.fields.length === 0) {
      newErrors.fields = 'At least one measurement field is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const fieldsJson: Record<string, string> = {};
      formData.fields.forEach((field) => {
        fieldsJson[field.key] = field.label;
      });

      if (templateId) {
        const updateData: MeasurementTemplateUpdate = {
          garment_type: formData.garment_type,
          gender: formData.gender,
          display_name: formData.display_name,
          fields_json: fieldsJson,
        };
        await updateTemplate(templateId, updateData);
      } else {
        const createData: MeasurementTemplateCreate = {
          garment_type: formData.garment_type,
          gender: formData.gender,
          display_name: formData.display_name,
          fields_json: fieldsJson,
        };
        await createTemplate(createData);
      }
      onClose();
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {templateId ? 'Edit Template' : 'Add New Template'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="garment_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Garment Type *
                </label>
                <input
                  type="text"
                  id="garment_type"
                  value={formData.garment_type}
                  onChange={(e) => setFormData({ ...formData, garment_type: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.garment_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., blazer, pant, shirt"
                />
                {errors.garment_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.garment_type}</p>
                )}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'unisex' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.display_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Blazer (Male)"
              />
              {errors.display_name && (
                <p className="mt-1 text-sm text-red-600">{errors.display_name}</p>
              )}
            </div>

            {/* Measurement Fields */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Measurement Fields</h3>
              {errors.fields && <p className="mb-2 text-sm text-red-600">{errors.fields}</p>}

              {/* Existing Fields */}
              {formData.fields.map((field, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Field key (e.g., chest)"
                  />
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Display label (e.g., Chest)"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveField(index)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {/* Add New Field */}
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Field key (e.g., chest)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddField();
                    }
                  }}
                />
                <input
                  type="text"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Display label (e.g., Chest)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddField();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddField}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Add Field
                </button>
              </div>
              {errors.newField && <p className="mt-1 text-sm text-red-600">{errors.newField}</p>}
            </div>

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
                {loading ? 'Saving...' : templateId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

