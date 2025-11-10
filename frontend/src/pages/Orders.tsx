import { useEffect, useState } from 'react';
import { useOrderStore } from '../store/orderStore';
import { useCustomerStore } from '../store/customerStore';
import { useToastStore } from '../store/toastStore';
import OrderForm from '../components/OrderForm';
import OrderDetail from '../components/OrderDetail';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Orders() {
  const {
    orders,
    loading,
    error,
    fetchOrders,
    selectedOrder,
    setSelectedOrder,
    deleteOrder,
    updateOrder,
    fetchOrder,
  } = useOrderStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { showToast } = useToastStore();

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number | null }>({ show: false, id: null });

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const customerId = selectedCustomerId ? Number(selectedCustomerId) : undefined;
    fetchOrders(customerId, selectedStatus || undefined);
  }, [selectedCustomerId, selectedStatus, fetchOrders]);

  const handleEdit = async (id: number) => {
    // Close details modal if open
    setSelectedOrder(null);
    // Fetch order data first, then open form
    await fetchOrder(id);
    setEditingOrder(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingOrder(null);
    const customerId = selectedCustomerId ? Number(selectedCustomerId) : undefined;
    fetchOrders(customerId, selectedStatus || undefined);
  };

  const handleDelete = (id: number) => {
    console.log('Delete button clicked for order:', id);
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      try {
        await deleteOrder(deleteConfirm.id);
        // Refresh orders list after deletion
        const customerId = selectedCustomerId ? Number(selectedCustomerId) : undefined;
        await fetchOrders(customerId, selectedStatus || undefined);
        showToast('Order deleted successfully', 'success');
        setDeleteConfirm({ show: false, id: null });
        // Close order detail if it was open
        if (selectedOrder?.id === deleteConfirm.id) {
          setSelectedOrder(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
        showToast(error instanceof Error ? error.message : 'Failed to delete order', 'error');
        setDeleteConfirm({ show: false, id: null });
      }
    }
  };

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

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            Order Management
          </h1>
          <p className="text-gray-600 text-lg">Manage customer orders and track their status</p>
        </div>

        {/* Filters and Add Button */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : '')}
              className="input-modern flex-1 min-h-[44px]"
            >
              <option value="">All Customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-modern flex-1 min-h-[44px]"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="cutting">Cutting</option>
              <option value="sewing">Sewing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-success whitespace-nowrap min-h-[44px]"
          >
            + Create Order
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

        {/* Orders List */}
        {!loading && (
          <div className="glass rounded-2xl shadow-xl shadow-black/5 overflow-hidden card-hover">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No orders found</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Create your first order
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4 p-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="glass rounded-xl p-4 shadow-md border border-white/20 cursor-pointer hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">Order #{order.id}</h3>
                          <p className="text-sm text-gray-600">{order.customer_name}</p>
                          <p className="text-xs text-gray-500">{order.customer_phone}</p>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(order.id);
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
                              handleDelete(order.id);
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
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Items</p>
                          <p className="text-sm font-medium">{order.items.length} item(s)</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-sm font-bold">৳{order.total_amount.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <select
                          value={order.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateOrder(order.id, { status: e.target.value as any });
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-0 cursor-pointer shadow-sm ${getStatusColor(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="cutting">Cutting</option>
                          <option value="sewing">Sewing</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <p className="text-xs text-gray-500">
                          {new Date(order.delivery_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200/50">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Items</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Delivery Date</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-gray-200/30">
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-blue-50/50 cursor-pointer transition-all duration-150 group"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            #{order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-semibold">{order.customer_name}</div>
                              <div className="text-gray-600 text-xs">{order.customer_phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {order.items.length} item(s)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            ৳{order.total_amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={order.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateOrder(order.id, { status: e.target.value as any });
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-0 cursor-pointer shadow-sm transition-all hover:shadow-md ${getStatusColor(order.status)}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="cutting">Cutting</option>
                              <option value="sewing">Sewing</option>
                              <option value="ready">Ready</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(order.delivery_date).toLocaleDateString()}
                          </td>
                          <td 
                            className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(order.id);
                                }}
                                className="text-blue-600 hover:text-blue-700 transition-all p-2 hover:bg-blue-50 rounded-lg relative z-10 pointer-events-auto"
                                title="Edit order"
                                type="button"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(order.id);
                                }}
                                className="text-red-600 hover:text-red-700 transition-all p-2 hover:bg-red-50 rounded-lg relative z-10 pointer-events-auto"
                                title="Delete order"
                                type="button"
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

        {/* Order Form Modal */}
        {showForm && (
          <OrderForm
            orderId={editingOrder}
            customerId={selectedCustomerId ? Number(selectedCustomerId) : undefined}
            onClose={handleFormClose}
          />
        )}

        {/* Order Detail Modal - Only show when clicking on row, not when editing */}
        {selectedOrder && !showForm && (
          <OrderDetail
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onEdit={() => {
              setSelectedOrder(null);
              handleEdit(selectedOrder.id);
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm.show && (
          <ConfirmDialog
            title="Delete Order"
            message={`Are you sure you want to delete order #${deleteConfirm.id}? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={confirmDelete}
            onCancel={() => setDeleteConfirm({ show: false, id: null })}
            type="danger"
          />
        )}
      </div>
    </div>
  );
}

