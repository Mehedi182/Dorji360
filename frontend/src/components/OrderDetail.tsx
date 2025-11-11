import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { usePaymentStore } from '../store/paymentStore';
import { useOrderStore } from '../store/orderStore';
import { useStaffStore } from '../store/staffStore';
import { useToastStore } from '../store/toastStore';
import { api } from '../lib/api';
import PaymentForm from './PaymentForm';
import type { OrderWithDetails } from '../lib/api';
import { useEffect, useState } from 'react';

interface OrderDetailProps {
  order: OrderWithDetails;
  onClose: () => void;
  onEdit: () => void;
}

export default function OrderDetail({ order, onClose, onEdit }: OrderDetailProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { payments, fetchPayments, loading: paymentsLoading } = usePaymentStore();
  const { updateOrder, selectedOrder, fetchOrder } = useOrderStore();
  const { staff, fetchStaff } = useStaffStore();
  const { showToast } = useToastStore();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showStaffAssignment, setShowStaffAssignment] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | ''>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assigningStaff, setAssigningStaff] = useState(false);
  
  // Use selectedOrder if available (updated), otherwise use prop
  const displayOrder = selectedOrder && selectedOrder.id === order.id ? selectedOrder : order;
  const [currentStatus, setCurrentStatus] = useState(displayOrder.status);

  useEffect(() => {
    fetchPayments(displayOrder.id);
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayOrder.id]);

  useEffect(() => {
    setCurrentStatus(displayOrder.status);
  }, [displayOrder.status]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Order_${displayOrder.customer_name}_${displayOrder.id}`,
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      cutting: 'bg-blue-100 text-blue-800',
      sewing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateOrder(displayOrder.id, { status: newStatus as any });
      setCurrentStatus(newStatus);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedStaffId) return;
    
    setAssigningStaff(true);
    try {
      await api.assignStaffToOrder(displayOrder.id, {
        staff_id: Number(selectedStaffId),
        notes: assignmentNotes || undefined,
      });
      // Refresh order to get updated staff assignments
      await fetchOrder(displayOrder.id);
      setSelectedStaffId('');
      setAssignmentNotes('');
      setShowStaffAssignment(false);
      showToast('Staff assigned successfully', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign staff';
      showToast(errorMessage, 'error');
    } finally {
      setAssigningStaff(false);
    }
  };

  const handleRemoveStaff = async (assignmentId: number) => {
    try {
      await api.removeStaffFromOrder(displayOrder.id, assignmentId);
      // Refresh order to get updated staff assignments
      await fetchOrder(displayOrder.id);
      showToast('Staff removed successfully', 'success');
    } catch (error) {
      showToast('Failed to remove staff', 'error');
    }
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      master_tailor: 'Master Tailor',
      tailor: 'Tailor',
      assistant_tailor: 'Assistant Tailor',
      cutting_master: 'Cutting Master',
      sewing_operator: 'Sewing Operator',
      finishing: 'Finishing',
      receptionist: 'Receptionist',
      delivery_person: 'Delivery Person',
      accountant: 'Accountant',
      other: 'Other',
    };
    return roleMap[role] || role;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="glass rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 animate-slideUp">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/50">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Order Details</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Printable Content */}
            <div ref={printRef} className="print:p-8">
              {/* Professional Card Container */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 print:shadow-none print:border-0 print:p-0">
                <div className="mb-4 print:mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 print:text-xl">Order Receipt</h3>
                </div>

                <div className="space-y-4 print:space-y-4">
                  {/* Customer Info */}
                  <div className="border-b border-gray-100 pb-3 print:pb-3">
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 print:text-xs">Customer Information</h4>
                    <div className="grid grid-cols-2 gap-4 print:gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5 print:text-xs">Name</p>
                        <p className="text-base font-bold text-gray-900 print:text-lg">{displayOrder.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5 print:text-xs">Phone</p>
                        <p className="text-base font-bold text-gray-900 print:text-lg">{displayOrder.customer_phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="border-b border-gray-100 pb-3 print:pb-3">
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 print:text-xs">Order Information</h4>
                    <div className="grid grid-cols-4 gap-3 print:gap-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5 print:text-xs">Order ID</p>
                        <p className="text-base font-bold text-gray-900 print:text-lg">#{displayOrder.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5 print:text-xs">Order Date</p>
                        <p className="text-base font-bold text-gray-900 print:text-lg">
                          {new Date(displayOrder.order_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5 print:text-xs">Delivery Date</p>
                        <p className="text-base font-bold text-gray-900 print:text-lg">
                          {new Date(displayOrder.delivery_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1 print:text-xs">Status</p>
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(currentStatus)} print:hidden`}
                        >
                          <option value="pending">Pending</option>
                          <option value="cutting">Cutting</option>
                          <option value="sewing">Sewing</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(currentStatus)} hidden print:inline-block`}>
                          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-b border-gray-100 pb-3 print:pb-3">
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 print:text-xs">Order Items</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50 print:bg-transparent">
                          <tr>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide print:text-xs">
                              Garment Type
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide print:text-xs">
                              Qty
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide print:text-xs">
                              Price
                            </th>
                            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wide print:text-xs">
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayOrder.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="px-2 py-1.5 text-sm font-semibold text-gray-900 print:text-sm">
                                {item.garment_type}
                                {item.fabric_details && (
                                  <div className="text-xs text-gray-500 font-normal print:text-xs mt-0.5">({item.fabric_details})</div>
                                )}
                              </td>
                              <td className="px-2 py-1.5 text-sm font-semibold text-gray-900 print:text-sm">{item.quantity}</td>
                              <td className="px-2 py-1.5 text-sm font-semibold text-gray-900 print:text-sm">৳{item.price.toFixed(2)}</td>
                              <td className="px-2 py-1.5 text-sm font-bold text-gray-900 print:text-sm">
                                ৳{(item.price * item.quantity).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-gray-200">
                            <td colSpan={3} className="px-2 py-1.5 text-right text-xs font-medium text-gray-400 print:text-sm">
                              Total:
                            </td>
                            <td className="px-2 py-1.5 text-base font-bold text-gray-900 print:text-lg">৳{displayOrder.total_amount.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="border-b border-gray-100 pb-3 print:pb-3">
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 print:text-xs">Payment Summary</h4>
                    <div className="grid grid-cols-2 gap-4 print:gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5 print:text-xs">Paid Amount</p>
                        <p className="text-lg font-bold text-green-600 print:text-xl">
                          ৳{displayOrder.paid_amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5 print:text-xs">Remaining Amount</p>
                        <p className="text-lg font-bold text-red-600 print:text-xl">
                          ৳{displayOrder.remaining_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Staff */}
                  {displayOrder.assigned_staff && displayOrder.assigned_staff.length > 0 && (
                    <div className="border-b border-gray-100 pb-3 print:pb-3">
                      <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 print:text-xs">Assigned Staff</h4>
                      <div className="space-y-1 print:space-y-1">
                        {displayOrder.assigned_staff.map((assignment) => (
                          <div key={assignment.id} className="flex justify-between items-center p-1.5 bg-gray-50 rounded print:bg-transparent print:p-0.5">
                            <div>
                              <span className="font-semibold text-xs text-gray-900 print:text-sm">{assignment.staff_name}</span>
                              <span className="text-xs text-gray-400 ml-1 print:text-xs">({getRoleLabel(assignment.staff_role)})</span>
                              {assignment.notes && (
                                <div className="text-xs text-gray-500 print:text-xs mt-0.5">{assignment.notes}</div>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveStaff(assignment.id)}
                              className="text-red-600 hover:text-red-700 p-0.5 hover:bg-red-50 rounded print:hidden"
                              title="Remove staff"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {displayOrder.notes && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1 print:text-xs">Notes</h4>
                      <p className="text-xs font-medium text-gray-900 print:text-sm">{displayOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assigned Staff Section */}
            <div className="mt-8 border-t pt-6 print:hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Assigned Staff</h3>
                <button
                  onClick={() => setShowStaffAssignment(!showStaffAssignment)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  {showStaffAssignment ? 'Cancel' : '+ Assign Staff'}
                </button>
              </div>
              
              {showStaffAssignment && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Staff Member
                      </label>
                      <select
                        value={selectedStaffId}
                        onChange={(e) => setSelectedStaffId(e.target.value ? Number(e.target.value) : '')}
                        className="input-modern w-full"
                      >
                        <option value="">Choose staff member...</option>
                        {staff
                          .filter(s => !displayOrder.assigned_staff?.some(as => as.staff_id === s.id))
                          .map((staffMember) => (
                            <option key={staffMember.id} value={staffMember.id}>
                              {staffMember.name} - {getRoleLabel(staffMember.role)}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={assignmentNotes}
                        onChange={(e) => setAssignmentNotes(e.target.value)}
                        rows={2}
                        className="input-modern w-full"
                        placeholder="Assignment notes..."
                      />
                    </div>
                    <button
                      onClick={handleAssignStaff}
                      disabled={!selectedStaffId || assigningStaff}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {assigningStaff ? 'Assigning...' : 'Assign Staff'}
                    </button>
                  </div>
                </div>
              )}

              {displayOrder.assigned_staff && displayOrder.assigned_staff.length > 0 ? (
                <div className="space-y-2">
                  {displayOrder.assigned_staff.map((assignment) => (
                    <div key={assignment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{assignment.staff_name}</div>
                        <div className="text-sm text-gray-500">
                          {getRoleLabel(assignment.staff_role)} - Assigned on {new Date(assignment.assigned_date).toLocaleDateString()}
                        </div>
                        {assignment.notes && (
                          <div className="text-sm text-gray-600 mt-1">{assignment.notes}</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveStaff(assignment.id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg"
                        title="Remove staff"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No staff assigned to this order</p>
              )}
            </div>

            {/* Payment History */}
            <div className="mt-8 border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  + Add Payment
                </button>
              </div>
              {paymentsLoading ? (
                <div className="text-center py-4">Loading payments...</div>
              ) : payments.length === 0 ? (
                <p className="text-gray-500 text-sm">No payments recorded yet</p>
              ) : (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">৳{payment.amount.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">
                          {payment.payment_type} via {payment.payment_method} -{' '}
                          {new Date(payment.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3 print:hidden pt-6 border-t border-gray-200/50">
              <button
                onClick={handlePrint}
                className="btn-primary flex-1"
              >
                Print Receipt
              </button>
              <button
                onClick={onEdit}
                className="btn-success flex-1"
              >
                Edit Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <PaymentForm orderId={displayOrder.id} onClose={() => setShowPaymentForm(false)} />
      )}
    </>
  );
}

