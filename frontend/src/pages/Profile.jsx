import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { User, Book, CheckCircle, Clock } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/borrow/history');
        setHistory(res.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const borrowedCount = history.filter(h => h.status === 'Borrowed').length;
  const returnedCount = history.filter(h => h.status === 'Returned').length;
  const totalFines = history.reduce((sum, h) => sum + (h.fine || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-6">
        <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-full">
          <User className="h-12 w-12 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
          <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 text-center">
          <Book className="h-8 w-8 mx-auto text-blue-500 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Borrowed</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{history.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 text-center">
          <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Books Returned</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{returnedCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 text-center">
          <Clock className="h-8 w-8 mx-auto text-red-500 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Fines</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">₹{totalFines}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Full Borrow History</h3>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
          {history.length > 0 ? history.map((record) => (
            <li key={record.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                  {record.image ? (
                    <img src={record.image} alt={record.book_name} className="h-full w-full object-cover" />
                  ) : (
                    <Book className="h-full w-full p-2 text-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{record.book_name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Borrowed: {new Date(record.borrow_date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Due: {new Date(record.due_date).toLocaleDateString()}</p>
                  {record.return_date && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Returned: {new Date(record.return_date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  record.status === 'Returned' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {record.status}
                </span>
                {record.fine > 0 && (
                  <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">Fine: ₹{record.fine}</p>
                )}
              </div>
            </li>
          )) : (
            <li className="p-6 text-center text-gray-500 dark:text-gray-400">No borrowing history found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
