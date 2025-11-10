import { useEffect, useState } from 'react';
import { useMeasurementStore } from '../store/measurementStore';
import { useToastStore } from '../store/toastStore';
import TemplateForm from '../components/TemplateForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate } from '../lib/utils';
import type { MeasurementTemplate } from '../lib/api';

export default function Templates() {
  const {
    templates,
    loading,
    error,
    fetchTemplates,
    deleteTemplate,
    fetchTemplate,
  } = useMeasurementStore();
  const { showToast } = useToastStore();

  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<number | null>(null);
  const [filterGender, setFilterGender] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number | null }>({ show: false, id: null });

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = async (id: number) => {
    // Fetch template data first, then open form
    await fetchTemplate(id);
    setEditingTemplate(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTemplate(null);
    fetchTemplates();
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      try {
        await deleteTemplate(deleteConfirm.id);
        showToast('Template deleted successfully', 'success');
        setDeleteConfirm({ show: false, id: null });
      } catch (error) {
        showToast('Failed to delete template', 'error');
        setDeleteConfirm({ show: false, id: null });
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by filtering the displayed templates
  };

  const filteredTemplates = templates.filter((template) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !template.id.toString().includes(searchLower) &&
        !template.display_name.toLowerCase().includes(searchLower) &&
        !template.garment_type.toLowerCase().includes(searchLower) &&
        !template.gender.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (filterGender && template.gender !== filterGender) return false;
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
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">Measurement Templates</h1>
              <p className="text-sm sm:text-base text-text-secondary">Manage measurement templates for different garment types</p>
            </div>
            {/* Action Bar - Top Right */}
            <button
              onClick={() => setShowForm(true)}
              className="btn-success min-h-[44px] whitespace-nowrap"
            >
              + Add Template
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
                  placeholder="Search by ID, display name, garment type, or gender..."
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
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="input-modern flex-1 min-h-[44px]"
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>
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

          {/* Templates List */}
          {!loading && (
            <div className="overflow-hidden">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No templates found</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Add your first template
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 border-b-2 border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider">
                        Display Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider">
                        Garment Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase tracking-wider">
                        Fields
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
                    {filteredTemplates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {template.id}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {template.display_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {template.garment_type.charAt(0).toUpperCase() + template.garment_type.slice(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {template.gender}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {Object.keys(template.fields_json).length} fields
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {formatDate(template.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(template.id)}
                              className="text-blue-600 hover:text-blue-700 transition-all p-2 hover:bg-blue-50 rounded-lg"
                              title="Edit template"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(template.id)}
                              className="text-red-600 hover:text-red-700 transition-all p-2 hover:bg-red-50 rounded-lg"
                              title="Delete template"
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
            )}
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {deleteConfirm.show && (
            <ConfirmDialog
              title="Delete Template"
              message="Are you sure you want to delete this template? This action cannot be undone."
              confirmText="Delete"
              cancelText="Cancel"
              type="danger"
              onConfirm={confirmDelete}
              onCancel={() => setDeleteConfirm({ show: false, id: null })}
            />
          )}
        </div>

        {/* Template Form Modal */}
        {showForm && (
          <TemplateForm templateId={editingTemplate} onClose={handleFormClose} />
        )}
      </div>
    </div>
  );
}

