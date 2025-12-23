'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpen, Plus, Edit, Trash2, Upload, X, Check, 
  DollarSign, Eye, ArrowLeft
} from 'lucide-react';

interface DigitalBook {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  description?: string;
  coverImage: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminLibraryPage() {
  const [books, setBooks] = useState<DigitalBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<DigitalBook | null>(null);

  async function fetchBooks() {
    try {
      // Fetch all books (including inactive) for admin
      const res = await fetch('/api/admin/books');
      if (res.ok) {
        const data = await res.json();
        setBooks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch books:', err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to deactivate this book?')) return;
    
    await fetch(`/api/books/${id}`, { method: 'DELETE' });
    fetchBooks();
  }

  function openEditModal(book: DigitalBook) {
    setEditingBook(book);
    setShowModal(true);
  }

  function openCreateModal() {
    setEditingBook(null);
    setShowModal(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#222] px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-gold" />
                Digital Library
              </h1>
              <p className="text-gray-400 text-sm mt-1">Manage your digital book catalog</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-gold hover:bg-gold/90 text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Upload Book
          </button>
        </div>
      </header>

      <main className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111] p-5 rounded-xl border border-[#222]">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-5 h-5 text-gold" />
              <span className="text-xs text-gray-500">Total Books</span>
            </div>
            <div className="text-2xl font-bold text-gold">{books.length}</div>
          </div>
          <div className="bg-[#111] p-5 rounded-xl border border-[#222]">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-green-400" />
              <span className="text-xs text-gray-500">Active</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {books.filter(b => b.isActive).length}
            </div>
          </div>
          <div className="bg-[#111] p-5 rounded-xl border border-[#222]">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-gray-500">Avg Price</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              ${books.length > 0 
                ? (books.reduce((s, b) => s + b.price, 0) / books.length).toFixed(2)
                : '0.00'}
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className={`bg-[#111] rounded-xl border ${book.isActive ? 'border-[#222]' : 'border-red-900/50'} overflow-hidden`}
            >
              <div className="aspect-[3/4] relative bg-[#1a1a1a]">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-gray-600" />
                  </div>
                )}
                {!book.isActive && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="text-red-400 font-semibold">Inactive</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{book.title}</h3>
                {book.subtitle && (
                  <p className="text-gray-400 text-sm">{book.subtitle}</p>
                )}
                <p className="text-gold font-bold mt-2">${book.price.toFixed(2)}</p>
                <p className="text-gray-500 text-xs mt-1">by {book.author}</p>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEditModal(book)}
                    className="flex-1 bg-[#222] hover:bg-[#333] py-2 rounded flex items-center justify-center gap-1 text-sm transition"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="bg-red-900/30 hover:bg-red-900/50 text-red-400 py-2 px-3 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {books.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No books yet. Click "Upload Book" to add your first digital book.</p>
            </div>
          )}
        </div>
      </main>

      {/* Upload/Edit Modal */}
      {showModal && (
        <BookModal
          book={editingBook}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            fetchBooks();
          }}
        />
      )}
    </div>
  );
}

function BookModal({ 
  book, 
  onClose, 
  onSaved 
}: { 
  book: DigitalBook | null; 
  onClose: () => void; 
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(book?.title || '');
  const [subtitle, setSubtitle] = useState(book?.subtitle || '');
  const [author, setAuthor] = useState(book?.author || 'Eolles');
  const [description, setDescription] = useState(book?.description || '');
  const [coverImage, setCoverImage] = useState(book?.coverImage || '');
  const [fileUrl, setFileUrl] = useState('');
  const [price, setPrice] = useState(book?.price?.toString() || '9.99');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title,
      subtitle: subtitle || undefined,
      author,
      description: description || undefined,
      coverImage,
      fileUrl: fileUrl || (book ? undefined : ''), // Only required for new books
      price: parseFloat(price),
    };

    try {
      const res = book
        ? await fetch(`/api/books/${book.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, fileUrl: fileUrl || '/books/placeholder.epub' }),
          });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save book');
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save book');
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] rounded-xl border border-[#222] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#222]">
          <h2 className="text-xl font-semibold">
            {book ? 'Edit Book' : 'Upload New Book'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Subtitle</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Author</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Cover Image URL *</label>
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="/images/book-cover.jpg or https://..."
              className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload to /public/images or use external URL
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              EPUB File URL {!book && '*'}
            </label>
            <div className="flex gap-2">
              <input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder={book ? 'Leave empty to keep current file' : '/books/book.epub'}
                className="flex-1 bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white"
                required={!book}
              />
              <button
                type="button"
                className="bg-[#222] hover:bg-[#333] px-3 py-2 rounded flex items-center gap-1 text-sm"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ⚠️ In production, upload to private S3 bucket
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Price ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-white"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#222] hover:bg-[#333] py-2 rounded font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gold hover:bg-gold/90 text-black py-2 rounded font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : (
                <>
                  <Check className="w-4 h-4" />
                  {book ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
