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

  const navItems = [
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/measurements', label: 'Measurements', icon: '📏' },
    { path: '/templates', label: 'Templates', icon: '📐' },
    { path: '/samples', label: 'Samples', icon: '🖼️' },
    { path: '/orders', label: 'Orders', icon: '📋' },
    { path: '/staff', label: 'Staff', icon: '👔' },
    { path: '/payments', label: 'Payments', icon: '💰' },
    { path: '/deliveries', label: 'Deliveries', icon: '📅' },
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
                  <span className="text-lg">{item.icon}</span>
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

