import { useEffect, useState } from 'react';
import { useDeliveryStore } from '../store/deliveryStore';
import { useOrderStore } from '../store/orderStore';
import { format, startOfWeek, endOfWeek, addDays, isPast, isToday, isTomorrow } from 'date-fns';
import { formatDate } from '../lib/utils';

export default function Deliveries() {
  const { deliveries, loading, error, fetchDeliveries } = useDeliveryStore();
  const { updateOrder } = useOrderStore();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filter, setFilter] = useState<'all' | 'today' | 'tomorrow' | 'thisWeek' | 'overdue'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadDeliveries = () => {
    let startDate: string | undefined;
    let endDate: string | undefined;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'today':
        startDate = format(today, 'yyyy-MM-dd');
        endDate = format(today, 'yyyy-MM-dd');
        break;
      case 'tomorrow':
        const tomorrow = addDays(today, 1);
        startDate = format(tomorrow, 'yyyy-MM-dd');
        endDate = format(tomorrow, 'yyyy-MM-dd');
        break;
      case 'thisWeek':
        startDate = format(startOfWeek(today), 'yyyy-MM-dd');
        endDate = format(endOfWeek(today), 'yyyy-MM-dd');
        break;
      case 'overdue':
        endDate = format(addDays(today, -1), 'yyyy-MM-dd');
        break;
      default:
        // Show next 30 days
        startDate = format(today, 'yyyy-MM-dd');
        endDate = format(addDays(today, 30), 'yyyy-MM-dd');
    }

    fetchDeliveries(startDate, endDate, filter === 'overdue' ? undefined : undefined);
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await updateOrder(orderId, { status: newStatus as any });
      loadDeliveries();
    } catch (error) {
      // Error handled by store
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

  const isOverdue = (deliveryDate: string) => {
    const date = new Date(deliveryDate);
    return isPast(date) && !isToday(date) && date < new Date();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by filtering the displayed deliveries
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !delivery.id.toString().includes(searchLower) &&
        !delivery.customer_name.toLowerCase().includes(searchLower) &&
        !delivery.customer_phone.toLowerCase().includes(searchLower) &&
        !delivery.status.toLowerCase().includes(searchLower) &&
        !delivery.total_amount.toString().includes(searchLower)
      ) {
        return false;
      }
    }
    if (filter === 'overdue') {
      return isOverdue(delivery.delivery_date) && delivery.status !== 'delivered';
    }
    return true;
  });

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Main Card Container */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-6">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">Delivery Tracking</h1>
            <p className="text-sm sm:text-base text-text-secondary">Track upcoming deliveries and manage order status</p>
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
                  placeholder="Search by delivery ID, customer name, phone, status, or amount..."
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
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2.5 min-h-[44px] rounded-lg transition-colors text-sm ${
                  filter === 'all' ? 'bg-primary text-white' : 'bg-white text-text-primary hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('today')}
                className={`px-4 py-2.5 min-h-[44px] rounded-lg transition-colors text-sm ${
                  filter === 'today' ? 'bg-primary text-white' : 'bg-white text-text-primary hover:bg-gray-50'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setFilter('tomorrow')}
                className={`px-4 py-2.5 min-h-[44px] rounded-lg transition-colors text-sm ${
                  filter === 'tomorrow' ? 'bg-primary text-white' : 'bg-white text-text-primary hover:bg-gray-50'
                }`}
              >
                Tomorrow
              </button>
              <button
                onClick={() => setFilter('thisWeek')}
                className={`px-4 py-2.5 min-h-[44px] rounded-lg transition-colors text-sm ${
                  filter === 'thisWeek' ? 'bg-primary text-white' : 'bg-white text-text-primary hover:bg-gray-50'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setFilter('overdue')}
                className={`px-4 py-2.5 min-h-[44px] rounded-lg transition-colors text-sm ${
                  filter === 'overdue' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Overdue
              </button>
            </div>
          </form>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Deliveries List */}
        {!loading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filteredDeliveries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No deliveries found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 border-b-2 border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase">Delivery Date</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-text-primary uppercase">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDeliveries.map((delivery) => {
                      const overdue = isOverdue(delivery.delivery_date) && delivery.status !== 'delivered';
                      const deliveryDate = new Date(delivery.delivery_date);
                      const isTodayDelivery = isToday(deliveryDate);
                      const isTomorrowDelivery = isTomorrow(deliveryDate);

                      return (
                        <tr
                          key={delivery.id}
                          className={`hover:bg-gray-50 ${
                            overdue ? 'bg-red-50' : isTodayDelivery ? 'bg-yellow-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{delivery.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{delivery.customer_name}</div>
                              <div className="text-gray-500">{delivery.customer_phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                            <div>
                              {formatDate(delivery.delivery_date)}
                              {overdue && (
                                <span className="ml-2 text-xs text-red-600 font-medium">(Overdue)</span>
                              )}
                              {isTodayDelivery && (
                                <span className="ml-2 text-xs text-yellow-600 font-medium">(Today)</span>
                              )}
                              {isTomorrowDelivery && (
                                <span className="ml-2 text-xs text-blue-600 font-medium">(Tomorrow)</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={delivery.status}
                              onChange={(e) => handleStatusUpdate(delivery.id, e.target.value)}
                              className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(delivery.status)}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="cutting">Cutting</option>
                              <option value="sewing">Sewing</option>
                              <option value="ready">Ready</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ৳{delivery.total_amount.toFixed(2)}
                            {delivery.remaining_amount > 0 && (
                              <div className="text-xs text-red-600">
                                Remaining: ৳{delivery.remaining_amount.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {delivery.status !== 'delivered' && (
                              <button
                                onClick={() => handleStatusUpdate(delivery.id, 'delivered')}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
                              >
                                Mark Delivered
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

