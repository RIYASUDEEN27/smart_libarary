import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { RefreshCw, Search, Calendar, CheckCircle } from 'lucide-react';

const RenewBooks = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
      // Only show active (Borrowed) records that can be renewed
      setBorrows(res.data.filter((b) => b.status === 'Borrowed'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBorrows(); }, [fetchBorrows]);

  const handleRenew = async (id, bookName) => {
    if (!window.confirm(`Renew "${bookName}" for 14 more days?`)) return;
    setProcessing(id);
    try {
      await api.post(`/admin/renew/${id}`);
      showToast(`"${bookName}" renewed for 14 more days!`);
      fetchBorrows();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to renew book', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = borrows.filter((b) =>
    b.book_name.toLowerCase().includes(search.toLowerCase()) ||
    b.user_name.toLowerCase().includes(search.toLowerCase())
  );

  const now = new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium toast-enter
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="page-title">Renew Books</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Extend the due date by 14 days for currently borrowed books.
        </p>
      </div>

      {/* Info Card */}
      <div className="card p-5 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-200 text-sm">Renewal Policy</p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Each renewal extends the due date by <strong>14 days</strong> from the current due date.
              Books can be renewed only while in "Borrowed" status.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="form-input pl-10" placeholder="Search by book name or user..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  {['User', 'Book', 'Borrow Date', 'Current Due Date', 'New Due Date', 'Status', 'Action'].map((h) => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.length > 0 ? filtered.map((record) => {
                  const dueDate = new Date(record.due_date);
                  const newDueDate = new Date(dueDate);
                  newDueDate.setDate(newDueDate.getDate() + 14);
                  const isOverdue = dueDate < now;

                  return (
                    <tr key={record.id} className="table-row">
                      <td className="table-td">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{record.user_name}</div>
                        <div className="text-xs text-gray-400">{record.user_email}</div>
                      </td>
                      <td className="table-td">
                        <div className="font-medium text-gray-800 dark:text-gray-200 text-sm max-w-[160px] truncate">{record.book_name}</div>
                      </td>
                      <td className="table-td text-xs">{new Date(record.borrow_date).toLocaleDateString('en-IN')}</td>
                      <td className="table-td text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                            {dueDate.toLocaleDateString('en-IN')}
                          </span>
                          {isOverdue && <span className="badge-red ml-1 text-[10px]">Overdue</span>}
                        </div>
                      </td>
                      <td className="table-td text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {newDueDate.toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className="badge-yellow">Borrowed</span>
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => handleRenew(record.id, record.book_name)}
                          disabled={processing === record.id}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${processing === record.id ? 'animate-spin' : ''}`} />
                          {processing === record.id ? 'Renewing...' : 'Renew +14d'}
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-gray-400">
                      No active borrows to renew.
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

export default RenewBooks;
