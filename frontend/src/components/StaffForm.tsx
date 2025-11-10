import { useEffect, useState } from 'react';
import { useStaffStore } from '../store/staffStore';

interface StaffFormProps {
  staffId?: number | null;
  onClose: () => void;
}

const ROLE_OPTIONS = [
  { value: 'master_tailor', label: 'Master Tailor' },
  { value: 'tailor', label: 'Tailor' },
  { value: 'assistant_tailor', label: 'Assistant Tailor' },
  { value: 'cutting_master', label: 'Cutting Master' },
  { value: 'sewing_operator', label: 'Sewing Operator' },
  { value: 'finishing', label: 'Finishing' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'delivery_person', label: 'Delivery Person' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'other', label: 'Other' },
];

export default function StaffForm({ staffId, onClose }: StaffFormProps) {
  const { createStaff, updateStaff, fetchStaffById, loading, selectedStaff } = useStaffStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    role: 'tailor' as const,
    join_date: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Set default join date to today
    if (!staffId && !formData.join_date) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, join_date: today }));
    }
  }, [staffId]);

  useEffect(() => {
    if (staffId && selectedStaff?.id === staffId) {
      setFormData({
        name: selectedStaff.name,
        phone: selectedStaff.phone,
        address: selectedStaff.address || '',
        role: selectedStaff.role,
        join_date: selectedStaff.join_date.split(' ')[0] || new Date().toISOString().split('T')[0],
      });
    } else if (staffId) {
      fetchStaffById(staffId);
    } else if (!staffId) {
      // Reset form when creating new staff
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        name: '',
        phone: '',
        address: '',
        role: 'tailor',
        join_date: today,
      });
    }
  }, [staffId, selectedStaff, fetchStaffById]);

  useEffect(() => {
    if (staffId && selectedStaff?.id === staffId) {
      setFormData({
        name: selectedStaff.name,
        phone: selectedStaff.phone,
        address: selectedStaff.address || '',
        role: selectedStaff.role,
        join_date: selectedStaff.join_date.split(' ')[0] || new Date().toISOString().split('T')[0],
      });
    }
  }, [staffId, selectedStaff]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    if (!formData.join_date) {
      newErrors.join_date = 'Join date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (staffId) {
        await updateStaff(staffId, formData);
      } else {
        await createStaff(formData);
      }
      onClose();
    } catch (error) {
      // Error is handled by store
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fadeIn">
      <div className="glass rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20 animate-slideUp">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/50">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {staffId ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`input-modern w-full ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Staff member name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`input-modern w-full ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="Phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="input-modern w-full"
                placeholder="Staff address"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className={`input-modern w-full ${errors.role ? 'border-red-500' : ''}`}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Join Date */}
            <div>
              <label htmlFor="join_date" className="block text-sm font-medium text-gray-700 mb-2">
                Join Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="join_date"
                value={formData.join_date}
                onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                className={`input-modern w-full ${errors.join_date ? 'border-red-500' : ''}`}
              />
              {errors.join_date && (
                <p className="mt-1 text-sm text-red-600">{errors.join_date}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200/50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-success flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : staffId ? 'Update Staff' : 'Add Staff'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

