import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { IndianRupee, AlertTriangle, CheckCircle, Search, TrendingUp } from 'lucide-react';

const FineManagement = () => {
  const [borrows, setBorrows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('overdue'); // 'overdue' | 'fined' | 'all'
  const [processing, setProcessing] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [borrowsRes, statsRes] = await Promise.all([
        api.get('/admin/borrows'),
        api.get('/admin/dashboard'),
      ]);
      setBorrows(borrowsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReturn = async (id, bookName, fine) => {
    const msg = fine > 0
      ? `Return "${bookName}" with fine of ₹${fine}?`
      : `Return "${bookName}"?`;
    if (!window.confirm(msg)) return;
    setProcessing(id);
    try {
      const res = await api.post(`/admin/return/${id}`);
      showToast(`Book returned. Fine collected: ₹${res.data.fine}`);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to process return', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const now = new Date();

  const filtered = borrows.filter((b) => {
    const matchSearch =
      b.book_name.toLowerCase().includes(search.toLowerCase()) ||
      b.user_name.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    const isOverdue = b.status === 'Borrowed' && new Date(b.due_date) < now;
    const hasFine = b.fine > 0;
    if (filter === 'overdue') return isOverdue;
    if (filter === 'fined') return hasFine;
    return true;
  });

  const totalCollected = borrows.filter((b) => b.status === 'Returned').reduce((s, b) => s + (b.fine || 0), 0);
  const totalPending = borrows
    .filter((b) => b.status === 'Borrowed' && new Date(b.due_date) < now)
    .reduce((s, b) => s + (b.fine || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium toast-enter
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="page-title">Fine Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track and manage library fines. Rate: ₹10 per day after the due date.
        </p>
      </div>

      {/* Fine Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 p-3 rounded-2xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fine Collected</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{totalCollected.toFixed(0)}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800">
          <div className="bg-red-100 dark:bg-red-900/40 text-red-600 p-3 rounded-2xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fine Pending</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{totalPending.toFixed(0)}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800">
          <div className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 p-3 rounded-2xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Fine</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              ₹{(totalCollected + totalPending).toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Fine Rate Info */}
      <div className="card p-4 flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
        <IndianRupee className="h-5 w-5 text-blue-600 shrink-0" />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Fine Policy:</strong> ₹10 per day is charged for every day a book is returned after the due date.
          Fines are automatically calculated based on the return date.
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="form-input pl-10" placeholder="Search by book or user..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden shrink-0">
          {[
            { key: 'overdue', label: 'Overdue' },
            { key: 'fined', label: 'With Fine' },
            { key: 'all', label: 'All' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${filter === tab.key ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
                  {['User', 'Book', 'Borrow Date', 'Due Date', 'Return Date', 'Days Late', 'Fine (₹)', 'Status', 'Action'].map((h) => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.length > 0 ? filtered.map((record) => {
                  const isOverdue = record.status === 'Borrowed' && new Date(record.due_date) < now;
                  const daysLate = isOverdue
                    ? Math.floor((now - new Date(record.due_date)) / (1000 * 60 * 60 * 24))
                    : record.status === 'Returned' && record.fine > 0
                      ? Math.round(record.fine / 10)
                      : 0;

                  return (
                    <tr key={record.id} className={`table-row ${isOverdue ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                      <td className="table-td">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{record.user_name}</div>
                        <div className="text-xs text-gray-400">{record.user_email}</div>
                      </td>
                      <td className="table-td">
                        <div className="font-medium text-gray-800 dark:text-gray-200 text-sm max-w-[150px] truncate">
                          {record.book_name}
                        </div>
                      </td>
                      <td className="table-td text-xs">{new Date(record.borrow_date).toLocaleDateString('en-IN')}</td>
                      <td className="table-td text-xs">
                        <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                          {new Date(record.due_date).toLocaleDateString('en-IN')}
                        </span>
                      </td>
                      <td className="table-td text-xs">
                        {record.return_date
                          ? new Date(record.return_date).toLocaleDateString('en-IN')
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="table-td">
                        <span className={`font-semibold text-sm ${daysLate > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                          {daysLate > 0 ? `${daysLate}d` : '—'}
                        </span>
                      </td>
                      <td className="table-td">
                        <span className={`font-bold text-sm ${record.fine > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                          {record.fine > 0 ? `₹${record.fine}` : '₹0'}
                        </span>
                      </td>
                      <td className="table-td">
                        {record.status === 'Returned' ? (
                          <span className="badge-green">Returned</span>
                        ) : isOverdue ? (
                          <span className="badge-red">Overdue</span>
                        ) : (
                          <span className="badge-yellow">Borrowed</span>
                        )}
                      </td>
                      <td className="table-td">
                        {record.status === 'Borrowed' && (
                          <button
                            onClick={() => handleReturn(record.id, record.book_name, record.fine)}
                            disabled={processing === record.id}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
                          >
                            <IndianRupee className="h-3.5 w-3.5" />
                            {processing === record.id ? 'Processing...' : 'Collect & Return'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="9" className="px-5 py-12 text-center text-gray-400">
                      No records found for selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FineManagement;
