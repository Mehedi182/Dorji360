import { useEffect, useState } from 'react';
import { useOrderStore } from '../store/orderStore';
import { useCustomerStore } from '../store/customerStore';
import { useToastStore } from '../store/toastStore';
import OrderForm from '../components/OrderForm';
import OrderDetail from '../components/OrderDetail';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate } from '../lib/utils';

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
  const [searchTerm, setSearchTerm] = useState<string>('');
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by filtering the displayed orders
  };

  const filteredOrders = orders.filter((order) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toString().includes(searchLower) ||
        order.customer_name.toLowerCase().includes(searchLower) ||
        order.items.some((item) => item.garment_type.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

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
      delivered: 'bg-gray-100 text-text-secondary',
    };
    return colors[status] || 'bg-gray-100 text-text-secondary';
  };

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Main Card Container */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-6">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">Order Management</h1>
              <p className="text-sm sm:text-base text-text-secondary">Manage customer orders and track their status</p>
            </div>
            {/* Action Bar - Top Right */}
            <button
              onClick={() => setShowForm(true)}
              className="btn-success min-h-[44px] whitespace-nowrap"
            >
              + Create Order
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
                  placeholder="Search by order ID, customer name, or garment type..."
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

          {/* Orders List */}
          {!loading && (
            <div className="overflow-hidden">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary text-lg">No orders found</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-primary hover:text-[#2A4F7A]"
                >
                  Create your first order
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4 p-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="bg-white rounded-lg p-4 shadow-sm border border-border cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-text-primary">Order #{order.id}</h3>
                          <p className="text-sm text-text-secondary">{order.customer_name}</p>
                          <p className="text-xs text-text-secondary">{order.customer_phone}</p>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(order.id);
                            }}
                            className="p-2 text-primary hover:bg-blue-50 rounded-lg"
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
                          <p className="text-xs text-text-secondary">Items</p>
                          <p className="text-sm font-medium text-text-primary">{order.items.length} item(s)</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary">Total</p>
                          <p className="text-sm font-bold text-text-primary">৳{order.total_amount.toFixed(2)}</p>
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
                        <p className="text-xs text-text-secondary">
                          {formatDate(order.delivery_date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-gray-100 border-b-2 border-border">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-primary uppercase">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-primary uppercase">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-primary uppercase">Items</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-primary uppercase">Total</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-primary uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-text-primary uppercase">Delivery Date</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-text-primary uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-border">
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 cursor-pointer transition-all duration-150 group"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                            #{order.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                            <div>
                              <div className="font-semibold">{order.customer_name}</div>
                              <div className="text-text-secondary text-xs">{order.customer_phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">
                            {order.items.length} item(s)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-text-primary">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {formatDate(order.delivery_date)}
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
                                className="text-primary hover:text-[#2A4F7A] transition-all p-2 hover:bg-blue-50 rounded-lg relative z-10 pointer-events-auto"
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
      </div>
    </div>
  );
}

