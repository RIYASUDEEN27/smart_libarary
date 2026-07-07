import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  BookOpen,
  LayoutDashboard,
  BookMarked,
  LogOut,
  Menu,
  X,
  Settings,
  Users,
  RotateCcw,
  RefreshCw,
  IndianRupee,
  BarChart3,
  BookCopy,
  Tag,
  ChevronRight,
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  const navSections = [
    {
      label: 'Main',
      items: [
        {
          name: 'Dashboard',
          path: isAdmin ? '/admin' : '/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: 'Library',
      items: [
        {
          name: 'Books',
          path: isAdmin ? '/admin/books' : '/books',
          icon: BookOpen,
        },
        {
          name: 'Categories',
          path: isAdmin ? '/admin/categories' : '/categories',
          icon: Tag,
        },
      ],
    },
    {
      label: 'Transactions',
      items: [
        {
          name: 'Borrow Books',
          path: isAdmin ? '/admin/borrow' : '/borrow',
          icon: BookCopy,
        },
        {
          name: 'Return Books',
          path: isAdmin ? '/admin/return' : '/return',
          icon: RotateCcw,
        },
        {
          name: 'Renew Books',
          path: isAdmin ? '/admin/renew' : '/renew',
          icon: RefreshCw,
        },
        {
          name: 'Fine Management',
          path: isAdmin ? '/admin/fines' : '/fines',
          icon: IndianRupee,
        },
      ],
    },
    ...(isAdmin
      ? [
          {
            label: 'Administration',
            items: [
              { name: 'Users', path: '/admin/users', icon: Users },
              { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
            ],
          },
        ]
      : []),
    {
      label: 'Account',
      items: [
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-white text-base leading-none">SmartLib</span>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Management System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-1.5">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`sidebar-link ${active ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" size={18} />
                      <span className="flex-1">{item.name}</span>
                      {active && <ChevronRight className="h-3.5 w-3.5 opacity-70" size={14} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="md:hidden sticky top-0 z-10 flex items-center justify-between h-14 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">SmartLib</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
