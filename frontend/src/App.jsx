import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Books from './pages/Books';
import AdminBooks from './pages/AdminBooks';
import AdminUsers from './pages/AdminUsers';
import BorrowBooks from './pages/BorrowBooks';
import ReturnBooks from './pages/ReturnBooks';
import RenewBooks from './pages/RenewBooks';
import FineManagement from './pages/FineManagement';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const PrivateRoute = ({ children, requireAdmin }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => (
  <PrivateRoute requireAdmin={true}>
    <Layout>{children}</Layout>
  </PrivateRoute>
);

const UserRoute = ({ children }) => (
  <PrivateRoute>
    <Layout>{children}</Layout>
  </PrivateRoute>
);

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/books" element={<AdminRoute><AdminBooks /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/borrow" element={<AdminRoute><BorrowBooks /></AdminRoute>} />
          <Route path="/admin/return" element={<AdminRoute><ReturnBooks /></AdminRoute>} />
          <Route path="/admin/renew" element={<AdminRoute><RenewBooks /></AdminRoute>} />
          <Route path="/admin/fines" element={<AdminRoute><FineManagement /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><Categories /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />

          {/* Shared Routes */}
          <Route path="/settings" element={<UserRoute><Settings /></UserRoute>} />
          <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
          <Route path="/books" element={<UserRoute><Books /></UserRoute>} />
          <Route path="/borrow" element={<UserRoute><Books /></UserRoute>} />
          <Route path="/return" element={<UserRoute><Dashboard /></UserRoute>} />
          <Route path="/renew" element={<UserRoute><Dashboard /></UserRoute>} />
          <Route path="/fines" element={<UserRoute><Dashboard /></UserRoute>} />
          <Route path="/categories" element={<UserRoute><Categories /></UserRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
