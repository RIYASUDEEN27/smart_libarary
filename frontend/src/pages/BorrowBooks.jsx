import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Search, BookCopy, User, CheckCircle, X, Calendar } from 'lucide-react';

const BorrowBooks = () => {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [modalBook, setModalBook] = useState(null);

  const CATEGORIES = [
    'Python', 'Java', 'C', 'C++', 'Full Stack', 'React', 'Node.js',
    'MongoDB', 'IoT', 'OOPS', 'Data Structures', 'Engineering Graphics',
    'Physics', 'Mathematics',
  ];

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/books', { params: { search: search || undefined, category: category || undefined } });
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchBooks, 400);
    return () => clearTimeout(t);
  }, [fetchBooks]);

  useEffect(() => { fetchUsers(); }, []);

  const handleBorrow = async () => {
    if (!selectedUser) { showToast('Please select a user first.', 'error'); return; }
    if (!modalBook) return;
    setBorrowing(modalBook._id);
    try {
      await api.post(`/admin/borrow?book_id=${modalBook._id}&user_id=${selectedUser}`);
      showToast(`"${modalBook.book_name}" issued successfully!`);
      setModalBook(null);
      setSelectedUser('');
      fetchBooks();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to issue book', 'error');
    } finally {
      setBorrowing(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium toast-enter
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="page-title">Borrow Books</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Issue books to registered users. Due date: 14 days from today.</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="form-input pl-10" placeholder="Search books..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-input sm:w-48 appearance-none" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="loading-spinner">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {books.map((book) => (
            <div key={book._id} className="card overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="h-40 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 flex items-center justify-center overflow-hidden">
                {book.image ? (
                  <img src={book.image} alt={book.book_name} className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <BookCopy className="h-16 w-16 text-primary-300" />
                )}
              </div>
              <div className="p-4">
                <span className="badge-blue text-xs mb-2">{book.category}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mt-1 line-clamp-2">{book.book_name}</h3>
                <p className="text-xs text-gray-500 mt-1">{book.author}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs font-medium ${book.available_copies > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {book.available_copies > 0 ? `${book.available_copies} available` : 'Out of stock'}
                  </span>
                  <button
                    disabled={book.available_copies <= 0}
                    onClick={() => { setModalBook(book); setSelectedUser(''); setUserSearch(''); }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                      ${book.available_copies > 0
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                  >
                    Issue Book
                  </button>
                </div>
              </div>
            </div>
          ))}
          {books.length === 0 && (
            <div className="col-span-full empty-state">
              <BookCopy className="h-12 w-12 opacity-30 mb-3" />
              <p>No books found</p>
            </div>
          )}
        </div>
      )}

      {/* Issue Modal */}
      {modalBook && (
        <div className="modal-overlay">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="section-title">Issue Book</h3>
              <button onClick={() => setModalBook(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-5">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{modalBook.book_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{modalBook.author} · {modalBook.category}</p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                Due: {dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="form-label flex items-center gap-2"><User className="h-4 w-4" /> Select User</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input className="form-input pl-10" placeholder="Search user by name or email..."
                  value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
              </div>
              <div className="max-h-48 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-xl divide-y divide-gray-50 dark:divide-gray-700">
                {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => setSelectedUser(u._id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                      ${selectedUser === u._id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    {selectedUser === u._id && <CheckCircle className="h-4 w-4 text-primary-600 shrink-0" />}
                  </div>
                )) : (
                  <div className="py-6 text-center text-sm text-gray-400">No users found</div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModalBook(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button
                onClick={handleBorrow}
                disabled={!selectedUser || borrowing === modalBook._id}
                className="btn-primary flex-1 justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {borrowing === modalBook._id ? 'Issuing...' : 'Issue Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowBooks;
