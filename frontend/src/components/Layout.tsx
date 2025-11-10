import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Combined Header & Navigation */}
      <header className="glass sticky top-0 z-40 shadow-lg shadow-black/5 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Dorji360 Logo" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dorji360
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Professional Tailoring Management</p>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex items-center space-x-1 overflow-x-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <span className="mr-1.5 text-base">{item.icon}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-8">{children}</main>
    </div>
  );
}

