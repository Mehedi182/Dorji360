import { useEffect, useState } from 'react';
import { useMeasurementStore } from '../store/measurementStore';
import { useCustomerStore } from '../store/customerStore';
import { useToastStore } from '../store/toastStore';
import MeasurementForm from '../components/MeasurementForm';
import MeasurementDetail from '../components/MeasurementDetail';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate } from '../lib/utils';
import type { MeasurementWithCustomer } from '../lib/api';

export default function Measurements() {
  const {
    measurements,
    loading,
    error,
    fetchMeasurements,
    selectedMeasurement,
    setSelectedMeasurement,
    deleteMeasurement,
    fetchMeasurement,
  } = useMeasurementStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { showToast } = useToastStore();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number | null }>({ show: false, id: null });

  useEffect(() => {
    fetchMeasurements();
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = async (id: number) => {
    // Close details modal if open
    setSelectedMeasurement(null);
    // Fetch measurement data first, then open form
    await fetchMeasurement(id);
    setEditingMeasurement(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMeasurement(null);
    fetchMeasurements();
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      try {
        await deleteMeasurement(deleteConfirm.id);
        showToast('Measurement deleted successfully', 'success');
        setDeleteConfirm({ show: false, id: null });
      } catch (error) {
        showToast('Failed to delete measurement', 'error');
        setDeleteConfirm({ show: false, id: null });
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by filtering the displayed measurements
  };

  const filteredMeasurements = measurements.filter((measurement) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        measurement.id.toString().includes(searchLower) ||
        measurement.customer_name.toLowerCase().includes(searchLower) ||
        measurement.customer_phone.toLowerCase().includes(searchLower) ||
        measurement.garment_type.toLowerCase().includes(searchLower) ||
        measurement.template_name.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });


  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Main Card Container */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-6">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">Measurement Book</h1>
              <p className="text-sm sm:text-base text-text-secondary">Manage customer measurements for different garment types</p>
            </div>
            {/* Action Bar - Top Right */}
            <button
              onClick={() => setShowForm(true)}
              className="btn-success min-h-[44px] whitespace-nowrap"
            >
              + Add Measurement
            </button>
          </div>

          {/* Search/Filter Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3 mb-3">
              <div className="relative flex-[0.7]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <svg className="h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID, customer name, phone, garment type, or template..."
                  className="w-full px-4 py-2.5 pl-12 min-h-[44px] border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm hover:border-primary/50 transition-all duration-200 text-text-primary"
                />
              </div>
              <button
                type="submit"
                className="btn-primary min-h-[44px] px-6"
              >
                Search
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2.5 min-h-[44px] bg-gray-100 text-text-secondary rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 shadow-sm">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary"></div>
              <p className="mt-4 text-text-secondary font-medium">Loading...</p>
            </div>
          )}

          {/* Measurements List */}
          {!loading && (
            <div className="overflow-hidden">
            {measurements.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No measurements found</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 min-h-[44px] px-4 py-2"
                >
                  Add your first measurement
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4 p-4">
                  {filteredMeasurements.map((measurement) => (
                    <div
                      key={measurement.id}
                      onClick={() => setSelectedMeasurement(measurement)}
                      className="glass rounded-xl p-4 shadow-md border border-white/20 cursor-pointer hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">#{measurement.id}</h3>
                          <p className="text-sm font-medium text-gray-900 mt-1">{measurement.customer_name}</p>
                          <p className="text-xs text-gray-500 mt-1">{measurement.customer_phone}</p>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(measurement.id);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            type="button"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(measurement.id);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            type="button"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Garment Type</p>
                          <p className="text-sm font-medium">{measurement.garment_type.charAt(0).toUpperCase() + measurement.garment_type.slice(1)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Template</p>
                          <p className="text-sm font-medium">{measurement.template_name}</p>
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary mt-3">
                        Created: {formatDate(measurement.created_at)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 border-b-2 border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider">
                          Garment Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider">
                          Template
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-text-primary uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMeasurements.map((measurement) => (
                        <tr
                          key={measurement.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedMeasurement(measurement)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {measurement.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{measurement.customer_name}</div>
                              <div className="text-gray-500">{measurement.customer_phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {measurement.garment_type.charAt(0).toUpperCase() + measurement.garment_type.slice(1)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {measurement.template_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {formatDate(measurement.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(measurement.id);
                                }}
                                className="text-blue-600 hover:text-blue-700 transition-all p-2 hover:bg-blue-50 rounded-lg"
                                title="Edit measurement"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(measurement.id);
                                }}
                                className="text-red-600 hover:text-red-700 transition-all p-2 hover:bg-red-50 rounded-lg"
                                title="Delete measurement"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

          {/* Delete Confirmation Dialog */}
          {deleteConfirm.show && (
            <ConfirmDialog
              title="Delete Measurement"
              message="Are you sure you want to delete this measurement? This action cannot be undone."
              confirmText="Delete"
              cancelText="Cancel"
              type="danger"
              onConfirm={confirmDelete}
              onCancel={() => setDeleteConfirm({ show: false, id: null })}
            />
          )}
        </div>

        {/* Measurement Form Modal */}
        {showForm && (
          <MeasurementForm
            measurementId={editingMeasurement}
            customerId={undefined}
            onClose={handleFormClose}
          />
        )}

        {/* Measurement Detail Modal - Only show when clicking on row, not when editing */}
        {selectedMeasurement && !showForm && (
          <MeasurementDetail
            measurement={selectedMeasurement}
            onClose={() => setSelectedMeasurement(null)}
            onEdit={() => {
              setSelectedMeasurement(null);
              handleEdit(selectedMeasurement.id);
            }}
          />
        )}
      </div>
    </div>
  );
}

