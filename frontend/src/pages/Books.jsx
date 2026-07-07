import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { Plus, X, Search, Filter, Book as BookIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const CATEGORIES = [
  "Python", "Java", "C", "C++", "Full Stack", "React", "Node.js", 
  "MongoDB", "IoT", "OOPS", "Data Structures", "Engineering Graphics", 
  "Physics", "Mathematics"
];

const Books = () => {
  const [books, setBooks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    book_id: '',
    book_name: '',
    author: '',
    category: '',
    publisher: '',
    edition: '',
    total_copies: 1,
    available_copies: 1
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksRes, historyRes] = await Promise.all([
        api.get('/books', { params: { search, category } }),
        api.get('/borrow/history')
      ]);
      setBooks(booksRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, category]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleBorrow = async (bookId) => {
    try {
      await api.post('/borrow/borrow', { book_id: bookId });
      showMessage('Book borrowed successfully!');
      fetchData();
    } catch (error) {
      showMessage(error.response?.data?.detail || 'Failed to borrow book', 'error');
    }
  };

  const handleReturn = async (borrowId) => {
    try {
      const res = await api.post('/borrow/return', { borrow_id: borrowId });
      if (res.data.fine > 0) {
        showMessage(`Book returned. Fine: ₹${res.data.fine}`, 'warning');
      } else {
        showMessage('Book returned successfully!', 'success');
      }
      fetchData();
    } catch (error) {
      showMessage(error.response?.data?.detail || 'Failed to return book', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'total_copies' || name === 'available_copies' ? parseInt(value) || 0 : value
    });
  };

  const openModalForAdd = () => {
    setEditMode(false);
    setCurrentBook(null);
    setFormData({
      book_id: '', book_name: '', author: '', category: '',
      publisher: '', edition: '', total_copies: 1, available_copies: 1
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (book) => {
    setEditMode(true);
    setCurrentBook(book);
    setFormData({ ...book });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/books/${currentBook._id}`, formData);
        showMessage('Book updated successfully!');
      } else {
        await api.post('/books', formData);
        showMessage('Book added successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showMessage("Failed to save book: " + (error.response?.data?.detail || "Unknown error"), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await api.delete(`/books/${id}`);
        showMessage('Book deleted successfully!');
        fetchData();
      } catch (error) {
        showMessage('Failed to delete book', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 relative">
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm w-full transform transition-all duration-300 ease-in-out ${
          message.type === 'error' ? 'bg-red-500' : message.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
        } text-white`}>
          <div className="flex justify-between items-center">
            <p>{message.text}</p>
            <button onClick={() => setMessage({ text: '', type: '' })}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Library Collection</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 flex-1 md:justify-end">
          <div className="relative flex-1 sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search books..."
              className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="relative flex-1 sm:max-w-[180px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="pl-10 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white appearance-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={openModalForAdd}
            className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="whitespace-nowrap">Add Book</span>
          </button>
        </div>
      </div>

      {loading && books.length === 0 ? (
        <div className="flex justify-center h-64 items-center">Loading...</div>
      ) : (
        <div className="space-y-12">
          {CATEGORIES.map(cat => {
            const categoryBooks = books.filter(b => b.category === cat);
            // Hide the category ONLY if a search filter or specific category is selected and there's no match
            if ((search || category) && categoryBooks.length === 0) return null;
            
            return (
              <div key={cat} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary-600 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{cat}</h2>
                  </div>
                  <button
                    onClick={() => {
                      openModalForAdd();
                      setFormData(prev => ({ ...prev, category: cat }));
                    }}
                    className="flex items-center space-x-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1.5 rounded-full font-semibold transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add {cat} Book</span>
                  </button>
                </div>
                
                {categoryBooks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                    {categoryBooks.map(book => (
                      <BookCard
                        key={book._id}
                        book={book}
                        userHistory={history}
                        onBorrow={handleBorrow}
                        onReturn={handleReturn}
                        onEdit={openModalForEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic py-6 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    No books available in this section. Click the blue Add button to create one!
                  </div>
                )}
              </div>
            );
          })}
          
          {(() => {
            const otherBooks = books.filter(b => !CATEGORIES.includes(b.category));
            if (otherBooks.length === 0) return null;
            return (
              <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-gray-400 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Other Books</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                  {otherBooks.map(book => (
                    <BookCard
                      key={book._id}
                      book={book}
                      userHistory={history}
                      onBorrow={handleBorrow}
                      onReturn={handleReturn}
                      onEdit={openModalForEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editMode ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="bookForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Book Name</label>
                  <input required type="text" name="book_name" value={formData.book_name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm py-2 px-3 border" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Author</label>
                  <input type="text" name="author" value={formData.author} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm py-2 px-3 border" />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <input type="text" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. Programming" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm py-2 px-3 border" />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Publisher</label>
                  <input type="text" name="publisher" value={formData.publisher} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm py-2 px-3 border" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Edition</label>
                  <input type="text" name="edition" value={formData.edition} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm py-2 px-3 border" />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Copies</label>
                  <input required type="number" min="1" name="total_copies" value={formData.total_copies} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm py-2 px-3 border" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Available Copies</label>
                  <input required type="number" min="0" name="available_copies" value={formData.available_copies} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm py-2 px-3 border" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Book ID</label>
                  <input type="text" name="book_id" placeholder="Leave empty for AUTO_GENERATED" value={formData.book_id} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm py-2 px-3 border" />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 mt-auto">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
                Cancel
              </button>
              <button type="submit" form="bookForm" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                {editMode ? 'Update Book' : 'Save Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
