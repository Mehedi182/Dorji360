import { useEffect, useState } from 'react';
import { usePaymentStore } from '../store/paymentStore';
import { useOrderStore } from '../store/orderStore';

export default function Payments() {
  const { payments, loading, error, fetchPayments } = usePaymentStore();
  const { orders, fetchOrders } = useOrderStore();

  const [selectedOrderId, setSelectedOrderId] = useState<number | ''>('');

  useEffect(() => {
    fetchPayments();
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const orderId = selectedOrderId ? Number(selectedOrderId) : undefined;
    fetchPayments(orderId);
  }, [selectedOrderId, fetchPayments]);

  const getOrderInfo = (orderId: number) => {
    return orders.find((o) => o.id === orderId);
  };

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      cash: 'bg-green-100 text-green-800',
      bkash: 'bg-blue-100 text-blue-800',
      nagad: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 sm:mb-3">
            Payments & Billing
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Track payments and manage billing</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="glass p-4 sm:p-6 rounded-2xl shadow-lg shadow-black/5 card-hover">
            <div className="text-xs sm:text-sm text-gray-600 mb-2 font-medium">Total Payments</div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">৳{totalPayments.toFixed(2)}</div>
          </div>
          <div className="glass p-4 sm:p-6 rounded-2xl shadow-lg shadow-black/5 card-hover">
            <div className="text-xs sm:text-sm text-gray-600 mb-2 font-medium">Total Orders</div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{orders.length}</div>
          </div>
          <div className="glass p-4 sm:p-6 rounded-2xl shadow-lg shadow-black/5 card-hover sm:col-span-2 lg:col-span-1">
            <div className="text-xs sm:text-sm text-gray-600 mb-2 font-medium">Payment Records</div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">{payments.length}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-4 py-2.5 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Orders</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                Order #{order.id} - {order.customer_name}
              </option>
            ))}
          </select>
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

        {/* Payments List */}
        {!loading && (
          <div className="glass rounded-2xl shadow-xl shadow-black/5 overflow-hidden card-hover">
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No payments found</p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4 p-4">
                  {payments.map((payment) => {
                    const order = getOrderInfo(payment.order_id);
                    return (
                      <div
                        key={payment.id}
                        className="glass rounded-xl p-4 shadow-md border border-white/20"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900">Payment #{payment.id}</h3>
                            <p className="text-sm text-gray-600 mt-1">Order #{payment.order_id}</p>
                            {order && (
                              <p className="text-xs text-gray-500 mt-1">{order.customer_name}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">৳{payment.amount.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Type</p>
                            <p className="text-sm font-medium">{payment.payment_type.charAt(0).toUpperCase() + payment.payment_type.slice(1)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Method</p>
                            <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodColor(payment.payment_method)}`}>
                              {payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1)}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          Date: {new Date(payment.date).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => {
                        const order = getOrderInfo(payment.order_id);
                        return (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{payment.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Order #{payment.order_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order ? order.customer_name : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ৳{payment.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.payment_type.charAt(0).toUpperCase() + payment.payment_type.slice(1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodColor(payment.payment_method)}`}>
                                {payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(payment.date).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

