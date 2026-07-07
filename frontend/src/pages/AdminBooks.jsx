import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Plus, X, Search, Filter, Edit2, Trash2, Eye, BookOpen, ChevronDown } from 'lucide-react';

const CATEGORIES = [
  'Python', 'Java', 'C', 'C++', 'Full Stack', 'React', 'Node.js',
  'MongoDB', 'IoT', 'OOPS', 'Data Structures', 'Engineering Graphics',
  'Physics', 'Mathematics',
];

const emptyForm = {
  book_name: '', author: '', book_id: '', category: '',
  publisher: '', edition: '', total_copies: 1, available_copies: 1,
};

const BookDetailModal = ({ book, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-container max-w-lg" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="section-title">Book Details</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div className="p-5 overflow-y-auto space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Book Name', book.book_name],
            ['Author', book.author],
            ['Book ID', book.book_id || book._id],
            ['Category', book.category],
            ['Publisher', book.publisher],
            ['Edition', book.edition],
            ['Total Copies', book.total_copies],
            ['Available Copies', book.available_copies],
          ].map(([label, val]) => (
            <div key={label} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const BookFormModal = ({ editMode, formData, setFormData, onSubmit, onClose, saving }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'total_copies' || name === 'available_copies' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h2 className="section-title">{editMode ? 'Edit Book' : 'Add New Book'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          <form id="bookForm" onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Book Name *</label>
              <input required name="book_name" value={formData.book_name} onChange={handleChange}
                className="form-input" placeholder="Enter book name" />
            </div>
            <div>
              <label className="form-label">Author</label>
              <input name="author" value={formData.author} onChange={handleChange}
                className="form-input" placeholder="Author name" />
            </div>
            <div>
              <label className="form-label">Book ID</label>
              <input name="book_id" value={formData.book_id} onChange={handleChange}
                className="form-input" placeholder="Leave empty for AUTO_GENERATED" />
            </div>
            <div>
              <label className="form-label">Category</label>
              <input name="category" value={formData.category} onChange={handleChange}
                className="form-input" placeholder="e.g. Programming" />
            </div>

            <div>
              <label className="form-label">Publisher</label>
              <input name="publisher" value={formData.publisher} onChange={handleChange}
                className="form-input" placeholder="Publisher name" />
            </div>
            <div>
              <label className="form-label">Edition</label>
              <input name="edition" value={formData.edition} onChange={handleChange}
                className="form-input" placeholder="e.g., 3rd Edition" />
            </div>
            <div>
              <label className="form-label">Total Copies *</label>
              <input required type="number" min="1" name="total_copies" value={formData.total_copies}
                onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Available Copies *</label>
              <input required type="number" min="0" name="available_copies" value={formData.available_copies}
                onChange={handleChange} className="form-input" />
            </div>
          </form>
        </div>
        <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" form="bookForm" disabled={saving} className="btn-primary bg-blue-600 hover:bg-blue-700">
            {saving ? 'Saving...' : editMode ? 'Update Book' : 'Add Book'}
          </button>
        </div>
      </div>
    </div>
  );
};

const BookRow = ({ book, onEdit, onDelete, onView }) => (
  <tr className="table-row">
    <td className="table-td">
      <div className="flex items-center gap-3">
        <div className="w-10 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
          <BookOpen className="h-5 w-5 text-primary-500" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{book.book_name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{book.book_id || book._id}</p>
        </div>
      </div>
    </td>
    <td className="table-td">{book.author}</td>
    <td className="table-td">
      <span className="badge-blue">{book.category}</span>
    </td>
    <td className="table-td">
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{book.available_copies}</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 dark:text-gray-300">{book.total_copies}</span>
      </div>
    </td>
    <td className="table-td">
      <div className="flex items-center gap-1.5">
        <button onClick={() => onView(book)} title="View"
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 transition-colors">
          <Eye className="h-4 w-4" />
        </button>
        <button onClick={() => onEdit(book)} title="Edit"
          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 transition-colors">
          <Edit2 className="h-4 w-4" />
        </button>
        <button onClick={() => onDelete(book._id)} title="Delete"
          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </td>
  </tr>
);

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewBook, setViewBook] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedCats, setExpandedCats] = useState({});
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'category'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/books', { params: { search: search || undefined, category: category || undefined } });
      setBooks(res.data);
    } catch (err) {
      console.error('Failed to fetch books', err);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(fetchBooks, 400);
    return () => clearTimeout(t);
  }, [fetchBooks]);

  const openAdd = (presetCategory = null) => {
    setEditMode(false);
    setCurrentBook(null);
    setFormData({ ...emptyForm, category: presetCategory || CATEGORIES[0] });
    setIsFormOpen(true);
  };

  const openEdit = (book) => {
    setEditMode(true);
    setCurrentBook(book);
    setFormData({ ...book });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editMode) {
        await api.put(`/books/${currentBook._id}`, formData);
        showToast('Book updated successfully!');
      } else {
        await api.post('/books', formData);
        showToast('Book added successfully!');
      }
      setIsFormOpen(false);
      fetchBooks();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to save book', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book? This cannot be undone.')) return;
    try {
      await api.delete(`/books/${id}`);
      showToast('Book deleted successfully!');
      fetchBooks();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete book', 'error');
    }
  };

  const toggleCat = (cat) => setExpandedCats((p) => ({ ...p, [cat]: !p[cat] }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium toast-enter
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Manage Books</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {books.length} book{books.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button onClick={() => openAdd()} className="btn-primary bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
          <Plus className="h-4 w-4" />
          Add Book
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, author, or ISBN..."
              className="form-input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative sm:w-52">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              className="form-input pl-10 appearance-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'category' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              By Category
            </button>
          </div>
        </div>
      </div>

      {/* Book List */}
      {loading ? (
        <div className="loading-spinner">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : viewMode === 'table' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
              <thead className="table-header">
                <tr>
                  {['Book', 'Author', 'Category', 'Copies', 'Actions'].map((h) => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {books.length > 0 ? (
                  books.map((book) => (
                    <BookRow key={book._id} book={book}
                      onEdit={openEdit} onDelete={handleDelete} onView={setViewBook} />
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-gray-400">
                      No books found. Add one to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Category View */
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const catBooks = books.filter((b) => b.category === cat);
            const isExpanded = expandedCats[cat] !== false; // default expanded
            return (
              <div key={cat} className="card overflow-hidden">
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  onClick={() => toggleCat(cat)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
                    <h3 className="font-semibold text-gray-800 dark:text-white">{cat}</h3>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                      {catBooks.length} books
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); openAdd(cat); }}
                      className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add {cat}
                    </button>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {isExpanded && catBooks.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-700 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-50 dark:divide-gray-700">
                      <thead className="table-header">
                        <tr>
                          {['Book', 'Author', 'Copies', 'Actions'].map((h) => (
                            <th key={h} className="table-th">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {catBooks.map((book) => (
                          <BookRow key={book._id} book={book}
                            onEdit={openEdit} onDelete={handleDelete} onView={setViewBook} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {isExpanded && catBooks.length === 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-700 py-6 text-center text-sm text-gray-400">
                    No books in this category.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <BookFormModal
          editMode={editMode}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setIsFormOpen(false)}
          saving={saving}
        />
      )}

      {/* Detail Modal */}
      {viewBook && <BookDetailModal book={viewBook} onClose={() => setViewBook(null)} />}
    </div>
  );
};

export default AdminBooks;
