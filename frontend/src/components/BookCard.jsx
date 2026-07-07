import React from 'react';
import { BookOpen, Edit2, Trash2, Eye } from 'lucide-react';

const BookCard = ({ book, onBorrow, onReturn, userHistory, isAdmin, onEdit, onDelete, onView }) => {
  const isAvailable = book.available_copies > 0;
  const borrowedRecord = userHistory?.find(
    (h) => h.book_name === book.book_name && h.status === 'Borrowed'
  );

  return (
    <div className="card overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
      {/* Cover */}
      <div className="h-44 bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <BookOpen className="h-16 w-16 text-primary-200 dark:text-gray-600" />
        </div>
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm
            ${isAvailable
              ? 'bg-emerald-500/90 text-white'
              : 'bg-red-500/90 text-white'}`}>
            {isAvailable ? 'Available' : 'Out of Stock'}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-600/90 text-white shadow-sm">
            {book.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">{book.book_name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{book.author}</p>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
          <span>📚 {book.available_copies}/{book.total_copies} copies</span>
        </div>

        {/* Actions */}
        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
          {isAdmin ? (
            <div className="flex gap-1.5">
              {onView && (
                <button onClick={() => onView(book)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition-colors">
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
              )}
              <button onClick={() => onEdit(book)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>
              <button onClick={() => onDelete(book._id)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition-colors">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          ) : (
            borrowedRecord ? (
              <button onClick={() => onReturn(borrowedRecord.id)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors">
                Return Book
              </button>
            ) : (
              <button onClick={() => onBorrow(book._id)} disabled={!isAvailable}
                className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors
                  ${isAvailable
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
                {isAvailable ? 'Borrow Book' : 'Unavailable'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
