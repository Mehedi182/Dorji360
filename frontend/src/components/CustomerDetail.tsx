import { useEffect, useState } from 'react';
import { useOrderStore } from '../store/orderStore';
import { useMeasurementStore } from '../store/measurementStore';
import { usePaymentStore } from '../store/paymentStore';
import { useDeliveryStore } from '../store/deliveryStore';
import OrderDetail from './OrderDetail';
import type { Customer, OrderWithDetails } from '../lib/api';

interface CustomerDetailProps {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
}

export default function CustomerDetail({ customer, onClose, onEdit }: CustomerDetailProps) {
  const { orders, fetchOrders, loading: ordersLoading } = useOrderStore();
  const { measurements, fetchMeasurements, loading: measurementsLoading } = useMeasurementStore();
  const { payments, fetchPayments, loading: paymentsLoading } = usePaymentStore();
  const { deliveries, fetchDeliveries, loading: deliveriesLoading } = useDeliveryStore();
  
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<OrderWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'measurements' | 'payments' | 'deliveries'>('orders');

  useEffect(() => {
    fetchOrders(customer.id);
    fetchMeasurements(customer.id);
    // Fetch all payments and deliveries, then filter client-side
    fetchPayments();
    fetchDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.id]);

  // Filter payments and deliveries for this customer
  const customerPayments = payments.filter(p => 
    orders.some(o => o.id === p.order_id)
  );
  
  const customerDeliveries = deliveries.filter(d => 
    d.customer_id === customer.id
  );

  const handleViewOrder = (order: OrderWithDetails) => {
    setSelectedOrderForDetail(order);
  };

  const handleCloseOrderDetail = () => {
    setSelectedOrderForDetail(null);
    setSelectedOrder(null);
  };

  const handleEditOrder = () => {
    // This will be handled by OrderDetail component
    handleCloseOrderDetail();
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

  const totalOrdersAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalPaidAmount = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalRemainingAmount = totalOrdersAmount - totalPaidAmount;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="glass rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-white/20 animate-slideUp">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200/50">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Customer Details
                </h2>
                <p className="text-gray-600">Complete history and information for {customer.name}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Customer Information */}
            <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200/50 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Customer ID</label>
                  <p className="text-lg font-semibold text-gray-900">#{customer.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                  <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-lg text-gray-900">{customer.phone}</p>
                </div>
                {customer.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                    <p className="text-lg text-gray-900">{customer.address}</p>
                  </div>
                )}
                {customer.notes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                    <p className="text-lg text-gray-900 whitespace-pre-wrap">{customer.notes}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                  <p className="text-lg text-gray-900">
                    {new Date(customer.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Total Orders</div>
                <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                <div className="text-2xl font-bold text-blue-600">৳{totalOrdersAmount.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Total Paid</div>
                <div className="text-2xl font-bold text-green-600">৳{totalPaidAmount.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Remaining</div>
                <div className="text-2xl font-bold text-red-600">৳{totalRemainingAmount.toFixed(2)}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'orders'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Orders ({orders.length})
                </button>
                <button
                  onClick={() => setActiveTab('measurements')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'measurements'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Measurements ({measurements.length})
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'payments'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Payments ({customerPayments.length})
                </button>
                <button
                  onClick={() => setActiveTab('deliveries')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'deliveries'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Deliveries ({customerDeliveries.length})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  {ordersLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                      <p className="mt-2 text-gray-600">Loading orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No orders found for this customer</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => handleViewOrder(order)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold text-gray-900">Order #{order.id}</span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Date: {new Date(order.order_date).toLocaleDateString()}</p>
                                <p>Delivery: {new Date(order.delivery_date).toLocaleDateString()}</p>
                                <p>Items: {order.items.length} item(s)</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">৳{order.total_amount.toFixed(2)}</div>
                              <div className="text-sm text-gray-600">
                                Paid: ৳{order.paid_amount.toFixed(2)}
                              </div>
                              <div className="text-sm text-red-600">
                                Remaining: ৳{order.remaining_amount.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Measurements Tab */}
              {activeTab === 'measurements' && (
                <div>
                  {measurementsLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                      <p className="mt-2 text-gray-600">Loading measurements...</p>
                    </div>
                  ) : measurements.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No measurements found for this customer</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {measurements.map((measurement) => (
                        <div
                          key={measurement.id}
                          className="p-4 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {measurement.garment_type.charAt(0).toUpperCase() + measurement.garment_type.slice(1)}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Created: {new Date(measurement.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                            {Object.entries(
                              typeof measurement.measurements_json === 'string' 
                                ? JSON.parse(measurement.measurements_json) 
                                : measurement.measurements_json
                            ).map(([key, value]) => (
                              <div key={key} className="text-sm">
                                <span className="text-gray-600">{key}:</span>{' '}
                                <span className="font-medium text-gray-900">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div>
                  {paymentsLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                      <p className="mt-2 text-gray-600">Loading payments...</p>
                    </div>
                  ) : customerPayments.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No payments found for this customer</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerPayments.map((payment) => {
                        const order = orders.find(o => o.id === payment.order_id);
                        return (
                          <div
                            key={payment.id}
                            className="p-4 bg-white rounded-lg border border-gray-200"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-gray-900 mb-1">
                                  ৳{payment.amount.toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p>Order #{payment.order_id}</p>
                                  <p>
                                    {payment.payment_type.charAt(0).toUpperCase() + payment.payment_type.slice(1)} via{' '}
                                    {payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1)}
                                  </p>
                                  <p>Date: {new Date(payment.date).toLocaleDateString()}</p>
                                  {payment.notes && <p className="text-gray-500">{payment.notes}</p>}
                                </div>
                              </div>
                              {order && (
                                <div className="text-right">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Deliveries Tab */}
              {activeTab === 'deliveries' && (
                <div>
                  {deliveriesLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                      <p className="mt-2 text-gray-600">Loading deliveries...</p>
                    </div>
                  ) : customerDeliveries.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No deliveries found for this customer</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerDeliveries.map((delivery) => (
                        <div
                          key={delivery.id}
                          className="p-4 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-gray-900 mb-1">
                                Order #{delivery.id}
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Delivery Date: {new Date(delivery.delivery_date).toLocaleDateString()}</p>
                                <p>Order Date: {new Date(delivery.order_date).toLocaleDateString()}</p>
                                <p>Amount: ৳{delivery.total_amount.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                                {delivery.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3 pt-6 border-t border-gray-200/50">
              <button
                onClick={onEdit}
                className="btn-success flex-1"
              >
                Edit Customer
              </button>
              <button
                onClick={onClose}
                className="btn-primary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrderForDetail && (
        <OrderDetail
          order={selectedOrderForDetail}
          onClose={handleCloseOrderDetail}
          onEdit={handleEditOrder}
        />
      )}
    </>
  );
}
