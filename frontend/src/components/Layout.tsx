import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Combined Header & Navigation */}
      <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <img 
                src="/logo.png?v=2"
                alt="Dorji360 Logo" 
                className="h-8 sm:h-12 w-auto object-contain"
                key="logo"
              />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-primary">
                  Dorji360
                </h1>
                <p className="text-xs text-text-secondary hidden sm:block">Professional Tailoring Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-1.5 text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border animate-slideDown">
              <nav className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-center ${
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-2 text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-8">{children}</main>

      {/* Footer with Copyright */}
      <footer className="mt-auto py-4 border-t border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-text-secondary">
            <p>© {new Date().getFullYear()} Dorji360. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

