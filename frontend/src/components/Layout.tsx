import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Handle window resize - auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Icon components - Modern filled style
  const DashboardIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  );

  const CustomersIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  );

  const MeasurementsIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16M4 4h16" />
    </svg>
  );

  const TemplatesIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
  );

  const SamplesIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
    </svg>
  );

  const OrdersIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
    </svg>
  );

  const StaffIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
    </svg>
  );

  const PaymentsIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
  );

  const DeliveriesIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
    </svg>
  );

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/customers', label: 'Customers', icon: CustomersIcon },
    { path: '/measurements', label: 'Measurements', icon: MeasurementsIcon },
    { path: '/templates', label: 'Templates', icon: TemplatesIcon },
    { path: '/samples', label: 'Samples', icon: SamplesIcon },
    { path: '/orders', label: 'Orders', icon: OrdersIcon },
    { path: '/staff', label: 'Staff', icon: StaffIcon },
    { path: '/payments', label: 'Payments', icon: PaymentsIcon },
    { path: '/deliveries', label: 'Deliveries', icon: DeliveriesIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          bg-white border-r border-border shadow-lg lg:shadow-sm
          transition-all duration-300 ease-in-out
          flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'lg:w-20' : 'w-64'}
        `}
      >
        {/* Logo & Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
          <div className={`flex items-center space-x-3 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
            <img 
              src="/logo.png?v=2"
              alt="Dorji360 Logo" 
              className="h-8 w-auto object-contain"
              key="logo"
            />
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-primary">Dorji360</h1>
                <p className="text-xs text-text-secondary">Professional Tailoring</p>
              </div>
            )}
          </div>
          {/* Collapse button - desktop only */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto min-h-0">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${sidebarCollapsed ? 'justify-center' : ''}
                    ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                    }
                  `}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="ml-3">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer in Sidebar */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-border flex-shrink-0">
            <div className="text-center text-xs text-text-secondary">
              <p>© {new Date().getFullYear()} Dorji360</p>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Header Bar - Mobile */}
        <header className="lg:hidden bg-white sticky top-0 z-30 shadow-sm border-b border-border">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.png?v=2"
                alt="Dorji360 Logo" 
                className="h-8 w-auto object-contain"
              />
              <h1 className="text-lg font-bold text-primary">Dorji360</h1>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-8 px-4 sm:px-6 lg:px-8 pt-4 lg:pt-8">
          {children}
        </main>

        {/* Footer - Desktop only (mobile footer is in sidebar) */}
        <footer className="hidden lg:block mt-auto py-4 border-t border-border bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-text-secondary">
              <p>© {new Date().getFullYear()} Dorji360. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

