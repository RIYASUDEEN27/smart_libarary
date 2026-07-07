import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { BarChart3, TrendingUp, BookOpen, AlertTriangle, RefreshCw } from 'lucide-react';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [reportRes, statsRes] = await Promise.all([
        api.get('/admin/reports'),
        api.get('/admin/dashboard'),
      ]);
      setReportData(reportRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const maxBorrowCount = reportData?.most_borrowed?.length > 0
    ? Math.max(...reportData.most_borrowed.map((b) => b.count))
    : 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Library statistics and analytics overview.
          </p>
        </div>
        <button onClick={fetchData} className="btn-secondary text-sm">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Summary Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Books', value: stats.total_books, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Active Borrows', value: stats.borrowed_books, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Overdue', value: stats.overdue_books, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'Total Fine', value: `₹${stats.total_fine}`, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          ].map((item) => (
            <div key={item.label} className={`card p-4 text-center ${item.bg}`}>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Borrowed Books */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <h2 className="section-title">Most Borrowed Books</h2>
          </div>
          {reportData?.most_borrowed?.length > 0 ? (
            <div className="space-y-3">
              {reportData.most_borrowed.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-[200px]">
                      {item.book_name}
                    </span>
                    <span className="font-bold text-primary-600 shrink-0 ml-2">{item.count}x</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                      style={{ width: `${(item.count / maxBorrowCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state h-40">
              <BookOpen className="h-10 w-10 opacity-30 mb-2" />
              <p>No borrow data available</p>
            </div>
          )}
        </div>

        {/* Category Distribution */}
        {stats?.categories && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              <h2 className="section-title">Category Distribution</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(stats.categories)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([cat, count]) => {
                  const maxCount = Math.max(...Object.values(stats.categories));
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-200 font-medium">{cat}</span>
                        <span className="font-bold text-gray-600 dark:text-gray-300">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Stats */}
      {reportData?.monthly_stats?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            <h2 className="section-title">Monthly Borrowing Trend</h2>
          </div>
          <div className="flex items-end gap-3 h-40">
            {reportData.monthly_stats.map((m, idx) => {
              const maxVal = Math.max(...reportData.monthly_stats.map((s) => s.count));
              const h = maxVal > 0 ? (m.count / maxVal) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-primary-600">{m.count}</span>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-lg relative" style={{ height: '100px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 text-center leading-tight">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overdue List */}
      {reportData?.overdue_list?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="section-title text-red-600 dark:text-red-400">Overdue Books</h2>
            <span className="ml-auto badge-red">{reportData.overdue_list.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
              <thead className="table-header">
                <tr>
                  {['User', 'Book', 'Due Date', 'Days Late', 'Fine (₹)'].map((h) => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {reportData.overdue_list.map((r) => (
                  <tr key={r.id} className="table-row bg-red-50/30 dark:bg-red-900/10">
                    <td className="table-td">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{r.user_name}</div>
                      <div className="text-xs text-gray-400">{r.user_email}</div>
                    </td>
                    <td className="table-td font-medium text-sm text-gray-800 dark:text-gray-200">{r.book_name}</td>
                    <td className="table-td text-xs text-red-500 font-medium">
                      {new Date(r.due_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="table-td">
                      <span className="badge-red">{r.days_late}d</span>
                    </td>
                    <td className="table-td">
                      <span className="font-bold text-red-600 dark:text-red-400">₹{r.fine}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
