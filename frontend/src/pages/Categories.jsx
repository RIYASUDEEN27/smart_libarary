import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Tag, BookOpen, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  'Python', 'Java', 'C', 'C++', 'Full Stack', 'React', 'Node.js',
  'MongoDB', 'IoT', 'OOPS', 'Data Structures', 'Engineering Graphics',
  'Physics', 'Mathematics',
];

const CAT_COLORS = [
  { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600' },
  { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600' },
  { bg: 'from-amber-500 to-orange-500', light: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600' },
  { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600' },
  { bg: 'from-red-500 to-red-600', light: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600' },
  { bg: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600' },
  { bg: 'from-pink-500 to-rose-500', light: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600' },
  { bg: 'from-teal-500 to-cyan-500', light: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600' },
  { bg: 'from-orange-500 to-orange-600', light: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600' },
  { bg: 'from-cyan-500 to-sky-500', light: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600' },
  { bg: 'from-lime-500 to-green-500', light: 'bg-lime-50 dark:bg-lime-900/20', text: 'text-lime-600' },
  { bg: 'from-rose-500 to-pink-600', light: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600' },
  { bg: 'from-violet-500 to-purple-600', light: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600' },
  { bg: 'from-sky-500 to-blue-500', light: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-600' },
];

const Categories = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(null);
  const [catBooks, setCatBooks] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get('/books', { params: { limit: 1000 } });
        setBooks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const fetchCatBooks = async (cat) => {
    setSelectedCat(cat);
    setCatLoading(true);
    try {
      const res = await api.get('/books', { params: { category: cat, limit: 100 } });
      setCatBooks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCatLoading(false);
    }
  };

  const getCatCount = (cat) => books.filter((b) => b.category === cat).length;

  const filteredCats = CATEGORIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Categories</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Browse books organized by subject categories.
        </p>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input className="form-input pl-10" placeholder="Filter categories..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="loading-spinner">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCats.map((cat, idx) => {
            const color = CAT_COLORS[idx % CAT_COLORS.length];
            const count = getCatCount(cat);
            const isSelected = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => fetchCatBooks(cat)}
                className={`card p-5 text-left hover:shadow-md transition-all duration-200 hover:-translate-y-0.5
                  ${isSelected ? 'ring-2 ring-primary-500 shadow-md' : ''}`}
              >
                <div className={`w-11 h-11 bg-gradient-to-br ${color.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <Tag className="h-5 w-5 text-white" />
                </div>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">{cat}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {count} {count === 1 ? 'book' : 'books'}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Category Books Panel */}
      {selectedCat && (
        <div className="card overflow-hidden animate-fade-in">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-600" />
              <h2 className="section-title">{selectedCat} Books</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{catBooks.length} books</span>
              <button onClick={() => setSelectedCat(null)} className="text-xs text-gray-400 hover:text-gray-600">
                Close ✕
              </button>
            </div>
          </div>
          {catLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : catBooks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                <thead className="table-header">
                  <tr>
                    {['Book Name', 'Author', 'Copies'].map((h) => (
                      <th key={h} className="table-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {catBooks.map((book) => (
                    <tr key={book._id} className="table-row">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-primary-400" />
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white text-sm">{book.book_name}</span>
                        </div>
                      </td>
                      <td className="table-td text-sm">{book.author}</td>
                      <td className="table-td">
                        <span className={`font-medium text-sm ${book.available_copies > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {book.available_copies}/{book.total_copies}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">No books in this category.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Categories;
