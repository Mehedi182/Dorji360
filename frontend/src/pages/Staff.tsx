import { useEffect, useState } from 'react';
import { useStaffStore } from '../store/staffStore';
import { useToastStore } from '../store/toastStore';
import StaffForm from '../components/StaffForm';
import ConfirmDialog from '../components/ConfirmDialog';

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

const getRoleLabel = (role: string) => {
  return ROLE_OPTIONS.find(opt => opt.value === role)?.label || role;
};

export default function Staff() {
  const {
    staff,
    loading,
    error,
    fetchStaff,
    deleteStaff,
    fetchStaffById,
  } = useStaffStore();
  const { showToast } = useToastStore();

  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<number | null>(null);
  const [filterRole, setFilterRole] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number | null }>({ show: false, id: null });

  useEffect(() => {
    fetchStaff(filterRole || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole]);

  const handleEdit = async (id: number) => {
    await fetchStaffById(id);
    setEditingStaff(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingStaff(null);
    fetchStaff(filterRole || undefined);
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      try {
        await deleteStaff(deleteConfirm.id);
        showToast('Staff member deleted successfully', 'success');
        setDeleteConfirm({ show: false, id: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete staff member';
        showToast(errorMessage, 'error');
        setDeleteConfirm({ show: false, id: null });
      }
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 sm:mb-3">
            Staff Management
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Manage your staff members and their roles</p>
        </div>

        {/* Filters and Add Button */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input-modern w-full min-h-[44px]"
            >
              <option value="">All Roles</option>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-success whitespace-nowrap min-h-[44px]"
          >
            + Add Staff
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading...</p>
          </div>
        )}

        {/* Staff List */}
        {!loading && (
          <div className="glass rounded-2xl shadow-xl shadow-black/5 overflow-hidden card-hover">
            {staff.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No staff members found</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 btn-primary"
                >
                  Add your first staff member
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4 p-4">
                  {staff.map((staffMember) => (
                    <div
                      key={staffMember.id}
                      className="glass rounded-xl p-4 shadow-md border border-white/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">#{staffMember.id} - {staffMember.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{staffMember.phone}</p>
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {getRoleLabel(staffMember.role)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(staffMember.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            type="button"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(staffMember.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            type="button"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Joined: {new Date(staffMember.join_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200/50">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Phone</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Join Date</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-gray-200/30">
                      {staff.map((staffMember) => (
                        <tr
                          key={staffMember.id}
                          className="hover:bg-blue-50/50 transition-all duration-150 group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            #{staffMember.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {staffMember.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {staffMember.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {getRoleLabel(staffMember.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(staffMember.join_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(staffMember.id)}
                                className="text-blue-600 hover:text-blue-700 transition-all p-2 hover:bg-blue-50 rounded-lg"
                                title="Edit staff"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(staffMember.id)}
                                className="text-red-600 hover:text-red-700 transition-all p-2 hover:bg-red-50 rounded-lg"
                                title="Delete staff"
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

        {/* Staff Form Modal */}
        {showForm && (
          <StaffForm
            staffId={editingStaff}
            onClose={handleFormClose}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm.show && (
          <ConfirmDialog
            title="Delete Staff Member"
            message="Are you sure you want to delete this staff member? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
            onConfirm={confirmDelete}
            onCancel={() => setDeleteConfirm({ show: false, id: null })}
          />
        )}
      </div>
    </div>
  );
}

