import { useEffect, useState } from 'react';
import { usePaymentStore } from '../store/paymentStore';
import { useOrderStore } from '../store/orderStore';
import { formatDate } from '../lib/utils';

export default function Payments() {
  const { payments, loading, error, fetchPayments } = usePaymentStore();
  const { orders, fetchOrders } = useOrderStore();

  const [selectedOrderId, setSelectedOrderId] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by filtering the displayed payments
  };

  const filteredPayments = payments.filter((payment) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const order = getOrderInfo(payment.order_id);
      return (
        payment.id.toString().includes(searchLower) ||
        payment.order_id.toString().includes(searchLower) ||
        (order && order.customer_name.toLowerCase().includes(searchLower)) ||
        payment.payment_type.toLowerCase().includes(searchLower) ||
        payment.payment_method.toLowerCase().includes(searchLower) ||
        payment.amount.toString().includes(searchLower)
      );
    }
    return true;
  });

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
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Main Card Container */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-6">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">Payments & Billing</h1>
            <p className="text-sm sm:text-base text-text-secondary">Track payments and manage billing</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <div className="glass p-4 sm:p-6 rounded-lg shadow-sm card-hover">
              <div className="text-xs sm:text-sm text-text-secondary mb-2 font-medium">Total Payments</div>
              <div className="text-2xl sm:text-3xl font-bold text-success">৳{totalPayments.toFixed(2)}</div>
            </div>
            <div className="glass p-4 sm:p-6 rounded-lg shadow-sm card-hover">
              <div className="text-xs sm:text-sm text-text-secondary mb-2 font-medium">Total Orders</div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">{orders.length}</div>
            </div>
            <div className="glass p-4 sm:p-6 rounded-lg shadow-sm card-hover sm:col-span-2 lg:col-span-1">
              <div className="text-xs sm:text-sm text-text-secondary mb-2 font-medium">Payment Records</div>
              <div className="text-2xl sm:text-3xl font-bold text-text-primary">{payments.length}</div>
            </div>
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
                  placeholder="Search by payment ID, order ID, customer name, type, method, or amount..."
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
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value ? Number(e.target.value) : '')}
                className="input-modern flex-1 min-h-[44px]"
              >
                <option value="">All Orders</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    Order #{order.id} - {order.customer_name}
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading...</p>
          </div>
        )}

        {/* Payments List */}
        {!loading && (
          <div className="glass rounded-2xl shadow-xl shadow-black/5 overflow-hidden card-hover">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No payments found</p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4 p-4">
                  {filteredPayments.map((payment) => {
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
                        <p className="text-xs text-text-secondary mt-3">
                          Date: {formatDate(payment.date)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 border-b-2 border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase">Order</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPayments.map((payment) => {
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                              {formatDate(payment.date)}
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
    </div>
  );
}

