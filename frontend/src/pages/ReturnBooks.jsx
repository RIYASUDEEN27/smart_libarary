import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { RotateCcw, Search, AlertTriangle, CheckCircle } from 'lucide-react';

const ReturnBooks = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('active'); // 'active' | 'overdue' | 'all'
  const [processing, setProcessing] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBorrows = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/borrows');
      setBorrows(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBorrows(); }, [fetchBorrows]);

  const handleReturn = async (id, bookName) => {
    if (!window.confirm(`Return "${bookName}"?`)) return;
    setProcessing(id);
    try {
      const res = await api.post(`/admin/return/${id}`);
      showToast(`Book returned. Fine: ₹${res.data.fine}`);
      fetchBorrows();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to return book', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const now = new Date();

  const filtered = borrows.filter((b) => {
    const matchSearch =
      b.book_name.toLowerCase().includes(search.toLowerCase()) ||
      b.user_name.toLowerCase().includes(search.toLowerCase()) ||
      b.user_email.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (filter === 'active') return b.status === 'Borrowed';
    if (filter === 'overdue') return b.status === 'Borrowed' && new Date(b.due_date) < now;
    return true;
  });

  const counts = {
    active: borrows.filter((b) => b.status === 'Borrowed').length,
    overdue: borrows.filter((b) => b.status === 'Borrowed' && new Date(b.due_date) < now).length,
    all: borrows.length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium toast-enter
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="page-title">Return Books</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Process book returns. Fine: ₹10 per day after due date.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Currently Borrowed', value: counts.active, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Overdue', value: counts.overdue, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Total Records', value: counts.all, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
        ].map((c) => (
          <div key={c.label} className={`card p-4 text-center ${c.bg}`}>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.label}</p>
          </div>
        ))}
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
            { key: 'active', label: 'Active' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'all', label: 'All' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${filter === tab.key ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
              {tab.label} ({counts[tab.key]})
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
                  {['User', 'Book', 'Borrow Date', 'Due Date', 'Days', 'Fine (₹)', 'Status', 'Action'].map((h) => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.length > 0 ? filtered.map((record) => {
                  const isOverdue = record.status === 'Borrowed' && new Date(record.due_date) < now;
                  return (
                    <tr key={record.id} className={`table-row ${isOverdue ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                      <td className="table-td">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{record.user_name}</div>
                        <div className="text-xs text-gray-400">{record.user_email}</div>
                      </td>
                      <td className="table-td">
                        <div className="font-medium text-gray-800 dark:text-gray-200 text-sm max-w-[160px] truncate">{record.book_name}</div>
                      </td>
                      <td className="table-td text-xs">{new Date(record.borrow_date).toLocaleDateString('en-IN')}</td>
                      <td className="table-td text-xs">
                        <span className={isOverdue ? 'text-red-500 font-semibold' : ''}>
                          {new Date(record.due_date).toLocaleDateString('en-IN')}
                        </span>
                      </td>
                      <td className="table-td text-xs">{record.duration_days}d</td>
                      <td className="table-td">
                        <span className={`font-semibold text-sm ${record.fine > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                          ₹{record.fine}
                        </span>
                      </td>
                      <td className="table-td">
                        {record.status === 'Returned' ? (
                          <span className="badge-green flex items-center gap-1"><CheckCircle className="h-3 w-3" />Returned</span>
                        ) : isOverdue ? (
                          <span className="badge-red flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Overdue</span>
                        ) : (
                          <span className="badge-yellow">Borrowed</span>
                        )}
                      </td>
                      <td className="table-td">
                        {record.status === 'Borrowed' && (
                          <button
                            onClick={() => handleReturn(record.id, record.book_name)}
                            disabled={processing === record.id}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            {processing === record.id ? 'Processing...' : 'Return'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="8" className="px-5 py-12 text-center text-gray-400">No records found.</td>
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

export default ReturnBooks;
