import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrderStore } from '../store/orderStore';
import { useCustomerStore } from '../store/customerStore';
import { usePaymentStore } from '../store/paymentStore';
import { formatDate } from '../lib/utils';

export default function Dashboard() {
  const { orders, fetchOrders } = useOrderStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { payments, fetchPayments } = usePaymentStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchOrders(),
          fetchCustomers(),
          fetchPayments(),
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate statistics
  const totalCustomers = customers.length;
  const totalOrders = orders.length;
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const cuttingOrders = orders.filter((o) => o.status === 'cutting').length;
  const sewingOrders = orders.filter((o) => o.status === 'sewing').length;
  const readyOrders = orders.filter((o) => o.status === 'ready').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;

  // Get recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
    .slice(0, 5);

  // Get recent customers (last 5)
  const recentCustomers = [...customers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Get upcoming deliveries (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const upcomingDeliveries = orders
    .filter((order) => {
      const deliveryDate = new Date(order.delivery_date);
      return deliveryDate >= today && deliveryDate <= nextWeek && order.status !== 'delivered';
    })
    .sort((a, b) => new Date(a.delivery_date).getTime() - new Date(b.delivery_date).getTime())
    .slice(0, 5);

  // Calculate outstanding payments
  const outstandingAmount = orders.reduce((sum, order) => sum + order.remaining_amount, 0);

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

  const StatCard = ({ title, value, icon, color, link }: { title: string; value: string | number; icon: React.ReactNode; color: string; link?: string }) => {
    const content = (
      <div className={`bg-white rounded-lg border border-border shadow-sm p-6 hover:shadow-md transition-all duration-200 ${link ? 'cursor-pointer' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`${color} opacity-20 p-3 rounded-lg`}>
            {icon}
          </div>
        </div>
      </div>
    );

    if (link) {
      return <Link to={link}>{content}</Link>;
    }
    return content;
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary"></div>
            <p className="mt-4 text-text-secondary font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">Dashboard</h1>
          <p className="text-sm sm:text-base text-text-secondary">Overview of your tailoring business</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Customers"
            value={totalCustomers}
            icon={
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            }
            color="text-primary"
            link="/customers"
          />
          <StatCard
            title="Total Orders"
            value={totalOrders}
            icon={
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            }
            color="text-primary"
            link="/orders"
          />
          <StatCard
            title="Total Revenue"
            value={`৳${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            }
            color="text-success"
            link="/payments"
          />
          <StatCard
            title="Outstanding"
            value={`৳${outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            }
            color="text-yellow-600"
            link="/payments"
          />
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Order Status Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-800">{pendingOrders}</p>
              <p className="text-sm text-text-secondary mt-1">Pending</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-800">{cuttingOrders}</p>
              <p className="text-sm text-text-secondary mt-1">Cutting</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-800">{sewingOrders}</p>
              <p className="text-sm text-text-secondary mt-1">Sewing</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-800">{readyOrders}</p>
              <p className="text-sm text-text-secondary mt-1">Ready</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">{deliveredOrders}</p>
              <p className="text-sm text-text-secondary mt-1">Delivered</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Recent Orders</h2>
              <Link to="/orders" className="text-sm text-primary hover:text-[#2A4F7A] font-medium">
                View All →
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-text-secondary text-center py-8">No recent orders</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to="/orders"
                    className="block p-3 rounded-lg border border-border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-text-primary">Order #{order.id}</span>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary">{order.customer_name}</p>
                        <p className="text-xs text-text-secondary mt-1">
                          {formatDate(order.order_date)} • ৳{order.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deliveries */}
          <div className="bg-white rounded-lg border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">Upcoming Deliveries</h2>
              <Link to="/deliveries" className="text-sm text-primary hover:text-[#2A4F7A] font-medium">
                View All →
              </Link>
            </div>
            {upcomingDeliveries.length === 0 ? (
              <p className="text-text-secondary text-center py-8">No upcoming deliveries</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeliveries.map((order) => {
                  const deliveryDate = new Date(order.delivery_date);
                  const daysUntil = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <Link
                      key={order.id}
                      to="/orders"
                      className="block p-3 rounded-lg border border-border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-text-primary">Order #{order.id}</span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary">{order.customer_name}</p>
                          <p className="text-xs text-text-secondary mt-1">
                            {formatDate(order.delivery_date)} • {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">Recent Customers</h2>
            <Link to="/customers" className="text-sm text-primary hover:text-[#2A4F7A] font-medium">
              View All →
            </Link>
          </div>
          {recentCustomers.length === 0 ? (
            <p className="text-text-secondary text-center py-8">No recent customers</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {recentCustomers.map((customer) => (
                <Link
                  key={customer.id}
                  to="/customers"
                  className="block p-4 rounded-lg border border-border hover:bg-gray-50 transition-colors text-center"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="font-semibold text-text-primary">{customer.name}</p>
                  <p className="text-sm text-text-secondary mt-1">{customer.phone}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              to="/orders"
              className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
            >
              <svg className="w-8 h-8 text-text-secondary group-hover:text-primary mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-text-secondary group-hover:text-primary">New Order</span>
            </Link>
            <Link
              to="/customers"
              className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
            >
              <svg className="w-8 h-8 text-text-secondary group-hover:text-primary mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="text-sm font-medium text-text-secondary group-hover:text-primary">New Customer</span>
            </Link>
            <Link
              to="/measurements"
              className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
            >
              <svg className="w-8 h-8 text-text-secondary group-hover:text-primary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16M4 4h16" />
              </svg>
              <span className="text-sm font-medium text-text-secondary group-hover:text-primary">New Measurement</span>
            </Link>
            <Link
              to="/payments"
              className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
            >
              <svg className="w-8 h-8 text-text-secondary group-hover:text-primary mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-text-secondary group-hover:text-primary">Record Payment</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

