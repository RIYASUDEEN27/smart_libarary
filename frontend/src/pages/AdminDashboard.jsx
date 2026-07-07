import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  BookOpen, Users, CheckCircle, Database, AlertTriangle,
  RotateCcw, IndianRupee, TrendingUp, RefreshCw, Clock
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="stat-card animate-fade-in">
    <div className={`stat-icon ${color}`}>
      <Icon className="h-6 w-6" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value ?? '—'}</p>
      {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const [statsRes, historyRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/borrows'),
      ]);
      setStats(statsRes.data);
      setHistory(historyRes.data.slice(0, 20));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Books',
      value: stats?.total_books?.toLocaleString() ?? 0,
      icon: Database,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      subtext: `${stats?.total_unique_titles ?? 0} unique titles`,
    },
    {
      title: 'Available Books',
      value: stats?.available_books?.toLocaleString() ?? 0,
      icon: BookOpen,
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      subtext: 'Ready to borrow',
    },
    {
      title: 'Borrowed Books',
      value: stats?.borrowed_books?.toLocaleString() ?? 0,
      icon: BookOpen,
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      subtext: 'Currently checked out',
    },
    {
      title: 'Returned Books',
      value: stats?.returned_books?.toLocaleString() ?? 0,
      icon: CheckCircle,
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      subtext: 'Total returns all time',
    },
    {
      title: 'Overdue Books',
      value: stats?.overdue_books?.toLocaleString() ?? 0,
      icon: AlertTriangle,
      color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      subtext: 'Past due date',
    },
    {
      title: 'Total Users',
      value: stats?.total_users?.toLocaleString() ?? 0,
      icon: Users,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      subtext: 'Registered members',
    },
    {
      title: 'Total Fine',
      value: `₹${stats?.total_fine?.toLocaleString() ?? 0}`,
      icon: IndianRupee,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      subtext: `Collected: ₹${stats?.total_fine_collected ?? 0} | Pending: ₹${stats?.pending_fine ?? 0}`,
    },
  ];

  const categoryColors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500',
    'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-rose-500',
    'bg-violet-500', 'bg-sky-500',
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Smart Library Management System Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="btn-secondary text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Category Breakdown */}
      {stats?.categories && Object.keys(stats.categories).length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <h2 className="section-title">Books by Category</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.categories)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count], idx) => (
                <div
                  key={category}
                  className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-600 hover:border-primary-200 dark:hover:border-primary-700 transition-colors"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${categoryColors[idx % categoryColors.length]}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{category}</span>
                  <span className="ml-1 text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full font-semibold">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-primary-600" />
          <h2 className="section-title">Recent Borrowing Activity</h2>
          <span className="ml-auto text-xs text-gray-400">{history.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead className="table-header">
              <tr>
                {['User', 'Book', 'Borrow Date', 'Due Date', 'Status', 'Days', 'Fine (₹)'].map((h) => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {history.length > 0 ? (
                history.map((record) => {
                  const isOverdue =
                    record.status === 'Borrowed' && new Date(record.due_date) < new Date();
                  return (
                    <tr key={record.id} className="table-row">
                      <td className="table-td">
                        <div className="font-medium text-gray-900 dark:text-white">{record.user_name}</div>
                        <div className="text-xs text-gray-400">{record.user_email}</div>
                      </td>
                      <td className="table-td font-medium text-gray-800 dark:text-gray-200 max-w-[180px] truncate">
                        {record.book_name}
                      </td>
                      <td className="table-td">{new Date(record.borrow_date).toLocaleDateString('en-IN')}</td>
                      <td className="table-td">
                        <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                          {new Date(record.due_date).toLocaleDateString('en-IN')}
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
                      <td className="table-td">{record.duration_days}d</td>
                      <td className="table-td">
                        <span className={record.fine > 0 ? 'text-red-500 font-semibold' : 'text-gray-400'}>
                          ₹{record.fine}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-gray-400">
                    No borrowing activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
