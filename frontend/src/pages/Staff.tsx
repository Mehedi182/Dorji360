import { useEffect, useState } from 'react';
import { useStaffStore } from '../store/staffStore';
import { useToastStore } from '../store/toastStore';
import StaffForm from '../components/StaffForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate } from '../lib/utils';

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
  const [searchTerm, setSearchTerm] = useState<string>('');
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by filtering the displayed staff
  };

  const filteredStaff = staff.filter((staffMember) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        staffMember.id.toString().includes(searchLower) ||
        staffMember.name.toLowerCase().includes(searchLower) ||
        staffMember.phone.toLowerCase().includes(searchLower) ||
        getRoleLabel(staffMember.role).toLowerCase().includes(searchLower)
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
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">Staff Management</h1>
              <p className="text-sm sm:text-base text-text-secondary">Manage your staff members and their roles</p>
            </div>
            {/* Action Bar - Top Right */}
            <button
              onClick={() => setShowForm(true)}
              className="btn-success min-h-[44px] whitespace-nowrap"
            >
              + Add Staff
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
                  placeholder="Search by ID, name, phone, or role..."
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
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input-modern flex-1 min-h-[44px]"
              >
                <option value="">All Roles</option>
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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

          {/* Staff List */}
          {!loading && (
            <div className="overflow-hidden">
            {filteredStaff.length === 0 ? (
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
                  {filteredStaff.map((staffMember) => (
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
                      <p className="text-xs text-text-secondary">
                        Joined: {formatDate(staffMember.join_date)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200/50">
                    <thead className="bg-gray-100 border-b-2 border-border">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-primary uppercase">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-primary uppercase">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-primary uppercase">Phone</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-primary uppercase">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-primary uppercase">Join Date</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-text-primary uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-gray-200/30">
                      {filteredStaff.map((staffMember) => (
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {formatDate(staffMember.join_date)}
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

        {/* Staff Form Modal */}
        {showForm && (
          <StaffForm
            staffId={editingStaff}
            onClose={handleFormClose}
          />
        )}
      </div>
    </div>
  );
}

