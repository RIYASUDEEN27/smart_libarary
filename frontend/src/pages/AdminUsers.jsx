import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Users, Search, Trash2, BookOpen, Shield } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, borrowsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/borrows'),
      ]);
      setUsers(usersRes.data);
      setBorrows(borrowsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      showToast('User deleted successfully');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete user', 'error');
    }
  };

  const getUserBorrows = (userId) => borrows.filter((b) => b.user_id === userId);
  const getUserActiveBorrows = (userId) => borrows.filter((b) => b.user_id === userId && b.status === 'Borrowed');

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium toast-enter
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {users.length} registered member{users.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Admin Users', value: users.filter((u) => u.role === 'admin').length, icon: Shield, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Regular Users', value: users.filter((u) => u.role !== 'admin').length, icon: Users, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
        ].map((s) => (
          <div key={s.label} className={`card p-4 flex items-center gap-3 ${s.color}`}>
            <s.icon className="h-6 w-6 shrink-0" />
            <div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs opacity-70">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="form-input pl-10" placeholder="Search by name or email..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="loading-spinner">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
              <thead className="table-header">
                <tr>
                  {['User', 'Email', 'Role', 'Joined', 'Active Borrows', 'Total Borrows', 'Actions'].map((h) => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.length > 0 ? filtered.map((u) => {
                  const activeBorrows = getUserActiveBorrows(u._id);
                  const totalBorrows = getUserBorrows(u._id);
                  return (
                    <tr key={u._id} className="table-row">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">{u.name}</span>
                        </div>
                      </td>
                      <td className="table-td text-sm text-gray-500">{u.email}</td>
                      <td className="table-td">
                        <span className={`${u.role === 'admin' ? 'badge-blue' : 'text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} font-medium`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="table-td text-xs text-gray-400">
                        {new Date(u.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="table-td">
                        {activeBorrows.length > 0 ? (
                          <span className="badge-yellow">{activeBorrows.length} active</span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600 text-xs">none</span>
                        )}
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => setSelectedUser(selectedUser?._id === u._id ? null : u)}
                          className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          {totalBorrows.length} borrows
                        </button>
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => handleDelete(u._id, u.name)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-gray-400">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Borrow Detail Panel */}
      {selectedUser && (
        <div className="card overflow-hidden animate-fade-in">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="section-title">Borrow History — {selectedUser.name}</h2>
            <button onClick={() => setSelectedUser(null)} className="text-xs text-gray-400 hover:text-gray-600">Close ✕</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
              <thead className="table-header">
                <tr>
                  {['Book', 'Borrow Date', 'Due Date', 'Status', 'Fine'].map((h) => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {getUserBorrows(selectedUser._id).length > 0 ? (
                  getUserBorrows(selectedUser._id).map((b) => (
                    <tr key={b.id} className="table-row">
                      <td className="table-td font-medium text-sm text-gray-800 dark:text-gray-200">{b.book_name}</td>
                      <td className="table-td text-xs">{new Date(b.borrow_date).toLocaleDateString('en-IN')}</td>
                      <td className="table-td text-xs">{new Date(b.due_date).toLocaleDateString('en-IN')}</td>
                      <td className="table-td">
                        {b.status === 'Returned'
                          ? <span className="badge-green">Returned</span>
                          : <span className="badge-yellow">Borrowed</span>}
                      </td>
                      <td className="table-td">
                        <span className={b.fine > 0 ? 'text-red-500 font-semibold text-sm' : 'text-gray-400 text-sm'}>
                          ₹{b.fine}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="py-8 text-center text-gray-400 text-sm">No borrow history.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
