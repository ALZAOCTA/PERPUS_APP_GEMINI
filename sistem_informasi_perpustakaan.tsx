import React, { useState, useEffect } from 'react';
import { 
  Book, 
  BookOpenCheck, 
  Settings, 
  Printer, 
  Library,
  Plus,
  Save,
  Search,
  Calendar,
  Edit,
  Trash2,
  X,
  FileSpreadsheet
} from 'lucide-react';

// --- MOCK DATA ---
const initialBooks = [
  { id: 1, title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', isbn: '9789799731234', ddc: '813', category: 'Fiksi', totalCopies: 3, availableCopies: 2 },
  { id: 2, title: 'Laskar Pelangi', author: 'Andrea Hirata', isbn: '9789793062792', ddc: '813', category: 'Fiksi', totalCopies: 5, availableCopies: 5 },
  { id: 3, title: 'Pengantar Ilmu Hukum', author: 'Mochtar Kusumaatmadja', isbn: '9789794140048', ddc: '340', category: 'Buku Pelajaran', totalCopies: 4, availableCopies: 3 },
  { id: 4, title: 'Matematika Diskrit', author: 'Rinaldi Munir', isbn: '9786028758789', ddc: '510', category: 'Non-Fiksi', totalCopies: 2, availableCopies: 2 },
];

const initialBorrowings = [
  { id: 1, bookId: 1, borrowerName: 'Budi Santoso', borrowerClass: 'XI IPA 1', borrowDate: '2023-10-01', dueDate: '2023-10-08', status: 'returned', returnDate: '2023-10-05' },
  { id: 2, bookId: 3, borrowerName: 'Siti Aminah', borrowerClass: 'XII IPS 2', borrowDate: '2023-10-25', dueDate: '2023-11-01', status: 'borrowed', returnDate: '' },
];

const AVAILABLE_CATEGORIES = [
  'Fiksi',
  'Buku Pelajaran',
  'Non-Fiksi',
  'Referensi',
  'Majalah / Jurnal',
  'Lainnya'
];

// --- MAIN APPLICATION COMPONENT ---
export default function LibraryApp() {
  // Global State
  const [activeTab, setActiveTab] = useState('katalog');
  const [books, setBooks] = useState(initialBooks);
  const [borrowings, setBorrowings] = useState(initialBorrowings);
  const [settings, setSettings] = useState({ borrowDurationDays: 7 });

  // --- VIEWS ---

  const renderContent = () => {
    switch (activeTab) {
      case 'katalog':
        return <KatalogView books={books} setBooks={setBooks} borrowings={borrowings} />;
      case 'peminjaman':
        return <PeminjamanView books={books} setBooks={setBooks} borrowings={borrowings} setBorrowings={setBorrowings} settings={settings} />;
      case 'label':
        return <LabelView books={books} />;
      case 'pengaturan':
        return <PengaturanView settings={settings} setSettings={setSettings} />;
      default:
        return <KatalogView books={books} setBooks={setBooks} borrowings={borrowings} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 flex items-center space-x-3 border-b border-indigo-800">
          <Library size={28} className="text-indigo-300" />
          <h1 className="text-xl font-bold tracking-wider">PerpusApp</h1>
        </div>
        
        <nav className="flex-1 py-6 space-y-2 px-4">
          <NavItem icon={<Book />} label="Katalog Buku" active={activeTab === 'katalog'} onClick={() => setActiveTab('katalog')} />
          <NavItem icon={<BookOpenCheck />} label="Peminjaman" active={activeTab === 'peminjaman'} onClick={() => setActiveTab('peminjaman')} />
          <NavItem icon={<Printer />} label="Label Buku" active={activeTab === 'label'} onClick={() => setActiveTab('label')} />
          <NavItem icon={<Settings />} label="Pengaturan" active={activeTab === 'pengaturan'} onClick={() => setActiveTab('pengaturan')} />
        </nav>
        
        <div className="p-4 border-t border-indigo-800 text-xs text-indigo-400 text-center">
          Versi 1.1.0 &copy; 2024
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center border-b border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-700 capitalize">
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <span className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full font-medium">
              Admin Perpustakaan
            </span>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-left ${
      active 
        ? 'bg-indigo-800 text-white shadow-inner' 
        : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

// --- MODULE: KATALOG BUKU ---

function KatalogView({ books, setBooks, borrowings }) {
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', ddc: '', category: 'Fiksi', totalCopies: 1 });
  const [isAdding, setIsAdding] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddBook = (e) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author || !newBook.ddc) return;
    
    const copies = parseInt(newBook.totalCopies) || 1;
    const book = { 
      ...newBook, 
      id: Date.now(), 
      totalCopies: copies,
      availableCopies: copies
    };
    setBooks([...books, book]);
    setNewBook({ title: '', author: '', isbn: '', ddc: '', category: 'Fiksi', totalCopies: 1 });
    setIsAdding(false);
  };

  const handleEditClick = (book) => {
    setEditingBook({ ...book });
    setIsAdding(false);
  };

  const handleUpdateBook = (e) => {
    e.preventDefault();
    if (!editingBook.title || !editingBook.author || !editingBook.ddc) return;
    
    const oldBook = books.find(b => b.id === editingBook.id);
    const diff = editingBook.totalCopies - oldBook.totalCopies;
    const newAvailable = Math.max(0, oldBook.availableCopies + diff);

    const updatedBook = {
      ...editingBook,
      totalCopies: parseInt(editingBook.totalCopies) || 1,
      availableCopies: newAvailable
    };

    setBooks(books.map(b => b.id === updatedBook.id ? updatedBook : b));
    setEditingBook(null);
  };

  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategoryFilter === 'Semua' || book.category === selectedCategoryFilter;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.ddc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {editingBook && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <form onSubmit={handleUpdateBook} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 w-full max-w-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Edit Data Buku</h3>
              <button type="button" onClick={() => setEditingBook(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-slate-600">Judul Buku <span className="text-red-500">*</span></label>
                <input required type="text" value={editingBook.title} onChange={e => setEditingBook({...editingBook, title: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Penulis <span className="text-red-500">*</span></label>
                <input required type="text" value={editingBook.author} onChange={e => setEditingBook({...editingBook, author: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Kategori Buku <span className="text-red-500">*</span></label>
                <select value={editingBook.category || 'Fiksi'} onChange={e => setEditingBook({...editingBook, category: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {AVAILABLE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">ISBN</label>
                <input type="text" value={editingBook.isbn} onChange={e => setEditingBook({...editingBook, isbn: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Kode DDC <span className="text-red-500">*</span></label>
                <input required type="text" value={editingBook.ddc} onChange={e => setEditingBook({...editingBook, ddc: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-slate-600">Total Eksemplar / Salinan <span className="text-red-500">*</span></label>
                <input required type="number" min="1" value={editingBook.totalCopies} onChange={e => setEditingBook({...editingBook, totalCopies: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <p className="text-xs text-slate-500 mt-1">Eksemplar tersedia saat ini: {editingBook.availableCopies} dari {editingBook.totalCopies} total.</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setEditingBook(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors">Batal</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center space-x-2 transition-colors">
                <Save size={18} /> <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari judul, penulis, DDC..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <select 
            value={selectedCategoryFilter}
            onChange={e => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="Semua">Semua Kategori</option>
            {AVAILABLE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={18} />
          <span>Tambah Buku Baru</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddBook} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">Judul Buku <span className="text-red-500">*</span></label>
            <input required type="text" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Misal: Laskar Pelangi" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">Penulis <span className="text-red-500">*</span></label>
            <input required type="text" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Misal: Andrea Hirata" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">Kategori Buku <span className="text-red-500">*</span></label>
            <select value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {AVAILABLE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">ISBN</label>
            <input type="text" value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="ISBN 13 digit" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">Kode DDC <span className="text-red-500">*</span></label>
            <input required type="text" value={newBook.ddc} onChange={e => setNewBook({...newBook, ddc: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Misal: 813" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">Jumlah Eksemplar / Salinan <span className="text-red-500">*</span></label>
            <input required type="number" min="1" value={newBook.totalCopies} onChange={e => setNewBook({...newBook, totalCopies: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="1" />
          </div>
          <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors">Batal</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center space-x-2 transition-colors">
              <Save size={18} /> <span>Simpan</span>
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
            <tr>
              <th className="p-4 font-semibold">Judul & Penulis</th>
              <th className="p-4 font-semibold">Kategori</th>
              <th className="p-4 font-semibold">ISBN / DDC</th>
              <th className="p-4 font-semibold text-center">Eksemplar</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {filteredBooks.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-500">Tidak ada data buku yang sesuai filter.</td></tr>
            ) : (
              filteredBooks.map(book => (
                <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{book.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Oleh: {book.author}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                      {book.category || 'Fiksi'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-800 font-mono font-medium text-xs">DDC: {book.ddc}</div>
                    <div className="text-slate-500 font-mono text-xs mt-0.5">{book.isbn || '-'}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        (book.availableCopies ?? book.totalCopies) > 0 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Tersedia: {book.availableCopies ?? book.totalCopies}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">Total: {book.totalCopies}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {deletingId === book.id ? (
                      <div className="flex items-center justify-center space-x-1 animate-in fade-in zoom-in">
                        <button onClick={() => { setBooks(books.filter(b => b.id !== book.id)); setDeletingId(null); }} className="text-xs font-medium bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors">Yakin?</button>
                        <button onClick={() => setDeletingId(null)} className="text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 py-1 rounded transition-colors">Batal</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleEditClick(book)} className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded transition-colors" title="Edit Buku">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => setDeletingId(book.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors" title="Hapus Buku">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- MODULE: PENCATATAN PEMINJAMAN ---

function PeminjamanView({ books, setBooks, borrowings, setBorrowings, settings }) {
  const [newLoan, setNewLoan] = useState({ bookId: '', borrowerName: '', borrowerClass: '', borrowDate: new Date().toISOString().split('T')[0] });
  const [isAdding, setIsAdding] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);

  // State untuk pencarian buku (Autocomplete)
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  
  const [editBookSearchTerm, setEditBookSearchTerm] = useState('');
  const [showEditBookDropdown, setShowEditBookDropdown] = useState(false);

  const calculateDueDate = (borrowDateStr, durationDays) => {
    if (!borrowDateStr) return '';
    const date = new Date(borrowDateStr);
    date.setDate(date.getDate() + durationDays);
    return date.toISOString().split('T')[0];
  };

  const handleAddLoan = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newLoan.bookId) {
      setErrorMessage('Silakan pilih buku dari daftar pencarian (klik judul buku yang sesuai).');
      return;
    }

    if (!newLoan.borrowerName || !newLoan.borrowerClass || !newLoan.borrowDate) return;

    const bookIdNum = parseInt(newLoan.bookId);
    const bookIndex = books.findIndex(b => b.id === bookIdNum);
    
    if (bookIndex === -1) {
      setErrorMessage('Buku tidak ditemukan.');
      return;
    }

    const targetBook = books[bookIndex];
    const available = targetBook.availableCopies ?? targetBook.totalCopies;

    if (available <= 0) {
      setErrorMessage(`Gagal: Eksemplar buku "${targetBook.title}" sedang habis dipinjam.`);
      return;
    }

    const dueDate = calculateDueDate(newLoan.borrowDate, settings.borrowDurationDays);
    const loan = {
      id: Date.now(),
      bookId: bookIdNum,
      borrowerName: newLoan.borrowerName,
      borrowerClass: newLoan.borrowerClass,
      borrowDate: newLoan.borrowDate,
      dueDate: dueDate,
      status: 'borrowed'
    };

    const updatedBooks = [...books];
    updatedBooks[bookIndex] = {
      ...targetBook,
      availableCopies: available - 1
    };

    setBooks(updatedBooks);
    setBorrowings([...borrowings, loan]);
    setNewLoan({ bookId: '', borrowerName: '', borrowerClass: '', borrowDate: new Date().toISOString().split('T')[0] });
    setBookSearchTerm('');
    setIsAdding(false);
  };

  const handleEditClick = (loan) => {
    setEditingLoan({ ...loan });
    const book = books.find(b => b.id === loan.bookId);
    setEditBookSearchTerm(book ? book.title : '');
    setIsAdding(false);
  };

  const handleUpdateLoan = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!editingLoan.bookId) {
      setErrorMessage('Silakan pilih buku dari daftar pencarian.');
      return;
    }

    if (!editingLoan.borrowerName || !editingLoan.borrowerClass || !editingLoan.borrowDate || !editingLoan.dueDate) return;

    // Handle book change if bookId changed
    const oldLoan = borrowings.find(b => b.id === editingLoan.id);
    if (!oldLoan) return;

    let updatedBooks = [...books];

    if (oldLoan.bookId !== editingLoan.bookId) {
      // Return copy to old book
      const oldBookIdx = updatedBooks.findIndex(b => b.id === oldLoan.bookId);
      if (oldBookIdx !== -1) {
        const b = updatedBooks[oldBookIdx];
        updatedBooks[oldBookIdx] = { ...b, availableCopies: Math.min(b.totalCopies, (b.availableCopies ?? b.totalCopies) + 1) };
      }

      // Take copy from new book
      const newBookIdx = updatedBooks.findIndex(b => b.id === parseInt(editingLoan.bookId));
      if (newBookIdx !== -1) {
        const b = updatedBooks[newBookIdx];
        const avail = b.availableCopies ?? b.totalCopies;
        if (avail <= 0) {
          setErrorMessage(`Gagal: Eksemplar buku "${b.title}" sedang habis.`);
          return;
        }
        updatedBooks[newBookIdx] = { ...b, availableCopies: avail - 1 };
      }
    }

    setBooks(updatedBooks);
    setBorrowings(borrowings.map(b => b.id === editingLoan.id ? { ...editingLoan, bookId: parseInt(editingLoan.bookId) } : b));
    setEditingLoan(null);
  };

  const handleReturn = (id) => {
    const loanToReturn = borrowings.find(b => b.id === id);
    if (!loanToReturn || loanToReturn.status === 'returned') return;

    const todayDate = new Date().toISOString().split('T')[0];

    setBorrowings(borrowings.map(b => b.id === id ? { ...b, status: 'returned', returnDate: todayDate } : b));

    setBooks(books.map(book => {
      if (book.id === loanToReturn.bookId) {
        const total = book.totalCopies;
        const currentAvail = book.availableCopies ?? total;
        return {
          ...book,
          availableCopies: Math.min(total, currentAvail + 1)
        };
      }
      return book;
    }));
  };

  const handleExportExcel = () => {
    let tableHtml = `
      <html xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="utf-8" />
          <style>
            table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
            th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }
            th { background-color: #0d9488; color: white; font-weight: bold; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Judul Buku</th>
                <th>Kategori Buku</th>
                <th>Peminjam</th>
                <th>Kelas</th>
                <th>Tanggal Pinjam</th>
                <th>Tenggat Waktu</th>
                <th>Tanggal Kembali</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    borrowings.forEach(loan => {
      const book = books.find(b => b.id === loan.bookId);
      const bookTitle = book ? book.title : 'Buku Dihapus';
      const bookCategory = book ? book.category : '-';
      const borrower = loan.borrowerName;
      const borrowerClass = loan.borrowerClass || '-';
      const statusText = loan.status === 'borrowed' ? 'Dipinjam' : 'Dikembalikan';
      const returnText = loan.returnDate || '-';
      
      tableHtml += `
        <tr>
          <td>${loan.id}</td>
          <td>${bookTitle}</td>
          <td>${bookCategory}</td>
          <td>${borrower}</td>
          <td>${borrowerClass}</td>
          <td>${loan.borrowDate}</td>
          <td>${loan.dueDate}</td>
          <td>${returnText}</td>
          <td>${statusText}</td>
        </tr>
      `;
    });

    tableHtml += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `data_peminjaman_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const overdueCount = borrowings.filter(loan => {
    return loan.status === 'borrowed' && loan.dueDate < todayStr;
  }).length;

  const filteredBorrowings = borrowings.filter(loan => {
    const book = books.find(b => b.id === loan.bookId);
    const bookTitle = book ? book.title.toLowerCase() : '';
    const borrower = loan.borrowerName.toLowerCase();
    const borrowerClass = (loan.borrowerClass || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = borrower.includes(query) || bookTitle.includes(query) || borrowerClass.includes(query);
    const isOverdue = loan.status === 'borrowed' && loan.dueDate < todayStr;

    if (filterOverdueOnly) {
      return matchesSearch && isOverdue;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {editingLoan && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <form onSubmit={handleUpdateLoan} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 w-full max-w-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">Edit Data Peminjaman</h3>
              <button type="button" onClick={() => setEditingLoan(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2 relative">
                <label className="text-sm font-medium text-slate-600">Ketik & Pilih Buku <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ketik judul buku yang dicari..."
                  value={editBookSearchTerm}
                  onChange={(e) => {
                    setEditBookSearchTerm(e.target.value);
                    setEditingLoan({...editingLoan, bookId: ''});
                    setShowEditBookDropdown(true);
                  }}
                  onFocus={() => setShowEditBookDropdown(true)}
                  onBlur={() => setTimeout(() => setShowEditBookDropdown(false), 200)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {showEditBookDropdown && (
                  <div className="absolute z-10 w-full mt-1 top-full left-0 bg-white border border-slate-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {books.filter(b => b.title.toLowerCase().includes(editBookSearchTerm.toLowerCase())).map(b => {
                      const avail = b.availableCopies ?? b.totalCopies;
                      return (
                        <div
                          key={b.id}
                          className="px-3 py-2 cursor-pointer text-sm hover:bg-teal-50 text-slate-700 border-b border-slate-100 last:border-0"
                          onClick={() => {
                            setEditingLoan({...editingLoan, bookId: b.id});
                            setEditBookSearchTerm(b.title);
                            setShowEditBookDropdown(false);
                          }}
                        >
                          <div className="font-medium">{b.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">Kategori: {b.category} | Tersedia: {avail}</div>
                        </div>
                      );
                    })}
                    {books.filter(b => b.title.toLowerCase().includes(editBookSearchTerm.toLowerCase())).length === 0 && (
                      <div className="px-3 py-2 text-sm text-slate-500">Buku tidak ditemukan.</div>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Nama Peminjam <span className="text-red-500">*</span></label>
                <input required type="text" value={editingLoan.borrowerName} onChange={e => setEditingLoan({...editingLoan, borrowerName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Kelas / Keterangan <span className="text-red-500">*</span></label>
                <input required type="text" value={editingLoan.borrowerClass || ''} onChange={e => setEditingLoan({...editingLoan, borrowerClass: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Misal: XI IPA 1" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Status Peminjaman</label>
                <select 
                  value={editingLoan.status} 
                  onChange={e => {
                    const newStatus = e.target.value;
                    setEditingLoan({
                      ...editingLoan, 
                      status: newStatus,
                      returnDate: newStatus === 'returned' && !editingLoan.returnDate ? new Date().toISOString().split('T')[0] : (newStatus === 'borrowed' ? '' : editingLoan.returnDate)
                    });
                  }} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="borrowed">Dipinjam</option>
                  <option value="returned">Dikembalikan</option>
                </select>
              </div>
              {editingLoan.status === 'returned' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">Tanggal Kembali <span className="text-red-500">*</span></label>
                  <input required type="date" value={editingLoan.returnDate || ''} onChange={e => setEditingLoan({...editingLoan, returnDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Tanggal Pinjam <span className="text-red-500">*</span></label>
                <input required type="date" value={editingLoan.borrowDate} onChange={e => setEditingLoan({...editingLoan, borrowDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600">Tenggat Waktu <span className="text-red-500">*</span></label>
                <input required type="date" value={editingLoan.dueDate} onChange={e => setEditingLoan({...editingLoan, dueDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setEditingLoan(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors">Batal</button>
              <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md flex items-center space-x-2 transition-colors">
                <Save size={18} /> <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex justify-between items-center">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="font-bold text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}

      {overdueCount > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 text-white p-2 rounded-full">
              <Calendar size={20} />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-sm">Pengingat Keterlambatan (Reminder)</h4>
              <p className="text-xs text-amber-700 mt-0.5">Terdapat <strong>{overdueCount} peminjaman</strong> yang melewati batas waktu pengembalian dan belum dikembalikan.</p>
            </div>
          </div>
          <button 
            onClick={() => setFilterOverdueOnly(!filterOverdueOnly)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterOverdueOnly 
                ? 'bg-amber-700 text-white' 
                : 'bg-amber-200 hover:bg-amber-300 text-amber-900'
            }`}
          >
            {filterOverdueOnly ? 'Tampilkan Semua Peminjaman' : `Tampilkan Terlambat Saja (${overdueCount})`}
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 w-full md:w-80">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama peminjam, kelas, atau judul..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <button 
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors shadow-sm whitespace-nowrap text-sm"
          >
            <FileSpreadsheet size={18} />
            <span>Export Excel</span>
          </button>

          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors shadow-sm whitespace-nowrap text-sm"
          >
            <Plus size={18} />
            <span>Catat Peminjaman Baru</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddLoan} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 border-t-4 border-t-teal-500">
          <div className="space-y-1 md:col-span-2 relative">
            <label className="text-sm font-medium text-slate-600">Ketik & Pilih Buku <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="Ketik judul buku yang dicari..."
              value={bookSearchTerm}
              onChange={(e) => {
                setBookSearchTerm(e.target.value);
                setNewLoan({...newLoan, bookId: ''});
                setShowBookDropdown(true);
              }}
              onFocus={() => setShowBookDropdown(true)}
              onBlur={() => setTimeout(() => setShowBookDropdown(false), 200)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {showBookDropdown && (
              <div className="absolute z-10 w-full mt-1 top-full left-0 bg-white border border-slate-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {books.filter(b => b.title.toLowerCase().includes(bookSearchTerm.toLowerCase())).map(b => {
                  const avail = b.availableCopies ?? b.totalCopies;
                  return (
                    <div
                      key={b.id}
                      className={`px-3 py-2 cursor-pointer text-sm border-b border-slate-100 last:border-0 ${avail <= 0 ? 'bg-slate-50 text-slate-400' : 'hover:bg-teal-50 text-slate-700'}`}
                      onClick={() => {
                        if (avail > 0) {
                          setNewLoan({...newLoan, bookId: b.id});
                          setBookSearchTerm(b.title);
                          setShowBookDropdown(false);
                        }
                      }}
                    >
                      <div className="font-medium">{b.title}</div>
                      <div className="text-xs mt-0.5">Kategori: {b.category} | Tersedia: {avail} {avail <= 0 ? '(Habis)' : ''}</div>
                    </div>
                  );
                })}
                {books.filter(b => b.title.toLowerCase().includes(bookSearchTerm.toLowerCase())).length === 0 && (
                  <div className="px-3 py-2 text-sm text-slate-500">Buku tidak ditemukan.</div>
                )}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">Nama Peminjam <span className="text-red-500">*</span></label>
            <input required type="text" value={newLoan.borrowerName} onChange={e => setNewLoan({...newLoan, borrowerName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Nama lengkap anggota" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600">Kelas / Keterangan <span className="text-red-500">*</span></label>
            <input required type="text" value={newLoan.borrowerClass} onChange={e => setNewLoan({...newLoan, borrowerClass: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Misal: XI IPA 1" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-600">Tanggal Pinjam <span className="text-red-500">*</span></label>
            <input required type="date" value={newLoan.borrowDate} onChange={e => setNewLoan({...newLoan, borrowDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          
          <div className="md:col-span-2 bg-teal-50 p-4 rounded-md flex items-center space-x-3 text-teal-800 text-sm">
            <Calendar size={18} />
            <p>Batas Pengembalian akan otomatis diatur ke: <strong>{calculateDueDate(newLoan.borrowDate, settings.borrowDurationDays) || '-'}</strong> ({settings.borrowDurationDays} hari dari tanggal pinjam)</p>
          </div>

          <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors">Batal</button>
            <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md flex items-center space-x-2 transition-colors">
              <Save size={18} /> <span>Simpan Peminjaman</span>
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
            <tr>
              <th className="p-4 font-semibold">Buku</th>
              <th className="p-4 font-semibold">Peminjam & Kelas</th>
              <th className="p-4 font-semibold">Tgl Pinjam</th>
              <th className="p-4 font-semibold">Tenggat Waktu</th>
              <th className="p-4 font-semibold">Tgl Kembali</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {filteredBorrowings.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">Tidak ada data peminjaman yang cocok dengan pencarian atau filter.</td></tr>
            ) : (
              filteredBorrowings.sort((a,b) => b.id - a.id).map(loan => {
                const book = books.find(b => b.id === loan.bookId);
                const isOverdue = loan.status === 'borrowed' && loan.dueDate < todayStr;
                
                return (
                  <tr key={loan.id} className={`hover:bg-slate-50 transition-colors ${isOverdue ? 'bg-red-50/40' : ''}`}>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{book ? book.title : 'Buku Dihapus'}</div>
                      {book && <div className="text-xs text-slate-400">Kategori: {book.category}</div>}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{loan.borrowerName}</div>
                      <div className="text-xs text-teal-700 font-semibold mt-0.5">Kelas: {loan.borrowerClass || '-'}</div>
                    </td>
                    <td className="p-4 text-slate-600">{loan.borrowDate}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={isOverdue ? 'text-red-600 font-bold' : 'text-slate-600'}>
                          {loan.dueDate}
                        </span>
                        {isOverdue && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-[10px] font-bold uppercase tracking-wider">
                            Terlambat
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {loan.returnDate || '-'}
                    </td>
                    <td className="p-4">
                      {loan.status === 'borrowed' ? (
                         <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">Dipinjam</span>
                      ) : (
                         <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">Dikembalikan</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {loan.status === 'borrowed' && (
                          <button 
                            onClick={() => handleReturn(loan.id)}
                            className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded transition-colors font-medium"
                          >
                            Kembalikan
                          </button>
                        )}
                        <button 
                          onClick={() => handleEditClick(loan)}
                          className="p-1.5 text-teal-600 hover:bg-teal-100 rounded transition-colors"
                          title="Edit Peminjaman"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- MODULE: PEMBUATAN LABEL BUKU (PERPUSNAS STANDARD) ---

function LabelView({ books }) {
  const [selectedBooks, setSelectedBooks] = useState([]);

  const toggleSelection = (id) => {
    if (selectedBooks.includes(id)) {
      setSelectedBooks(selectedBooks.filter(bookId => bookId !== id));
    } else {
      setSelectedBooks([...selectedBooks, id]);
    }
  };

  const selectAll = () => {
    if (selectedBooks.length === books.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(books.map(b => b.id));
    }
  };

  const getLabelData = (book) => {
    const authorStr = book.author ? book.author.trim() : 'UNK';
    const titleStr = book.title ? book.title.trim() : 'u';
    
    const ddc = book.ddc || '000';
    const authorCode = authorStr.substring(0, 3).toUpperCase();
    const titleCode = titleStr.substring(0, 1).toLowerCase();

    return { ddc, authorCode, titleCode };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto flex flex-col h-full print-container">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="flex justify-between items-start no-print">
        <div>
          <h3 className="text-lg font-medium text-slate-700">Generator Label Punggung Buku</h3>
          <p className="text-sm text-slate-500 mt-1">Format Standar Perpusnas (DDC, 3 Huruf Penulis, 1 Huruf Judul)</p>
        </div>
        <button 
          onClick={handlePrint}
          disabled={selectedBooks.length === 0}
          className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors shadow-sm ${
            selectedBooks.length === 0 
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <Printer size={18} />
          <span>Cetak {selectedBooks.length} Label</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 no-print">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-96">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h4 className="font-semibold text-slate-700">Pilih Buku</h4>
            <button onClick={selectAll} className="text-xs text-indigo-600 hover:underline font-medium">
              {selectedBooks.length === books.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {books.map(book => (
              <label key={book.id} className="flex items-start p-2 hover:bg-slate-50 rounded cursor-pointer transition-colors border-b border-slate-100 last:border-0">
                <input 
                  type="checkbox" 
                  className="mt-1 mr-3 rounded text-indigo-600 focus:ring-indigo-500"
                  checked={selectedBooks.includes(book.id)}
                  onChange={() => toggleSelection(book.id)}
                />
                <div>
                  <p className="text-sm font-medium text-slate-800 line-clamp-1">{book.title}</p>
                  <p className="text-xs text-slate-500">{book.author} ({book.category})</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-200 rounded-xl border border-slate-300 p-6 overflow-y-auto h-96 flex flex-col items-center">
          <h4 className="text-slate-500 text-sm mb-4 font-medium uppercase tracking-wider">Preview Area Cetak</h4>
          
          {selectedBooks.length === 0 ? (
            <div className="m-auto text-slate-400 flex flex-col items-center">
              <BookOpenCheck size={48} className="mb-2 opacity-50" />
              <p>Pilih buku di samping untuk melihat preview label</p>
            </div>
          ) : (
            <div className="bg-white p-8 shadow-sm print-area flex flex-wrap gap-4 items-start w-full min-h-full content-start">
              {selectedBooks.map(id => {
                const book = books.find(b => b.id === id);
                if (!book) return null;
                const labelData = getLabelData(book);
                
                return (
                  <div key={id} className="flex flex-col items-center">
                    <div className="border-2 border-black w-20 h-28 flex flex-col justify-center items-center bg-white p-1 font-mono text-sm leading-tight shadow-sm">
                      <div className="font-bold text-center w-full">{labelData.ddc}</div>
                      <div className="font-bold text-center w-full">{labelData.authorCode}</div>
                      <div className="font-bold text-center w-full">{labelData.titleCode}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 max-w-[5rem] text-center truncate no-print" title={book.title}>
                      {book.title}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- MODULE: PENGATURAN ---

function PengaturanView({ settings, setSettings }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4 mb-6">
          <Settings className="text-slate-400" />
          <h3 className="text-lg font-medium text-slate-700">Pengaturan Sistem</h3>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Aturan Peminjaman</h4>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Durasi Peminjaman Default (Hari)
              </label>
              <div className="flex items-center">
                <input 
                  type="number" 
                  min="1" 
                  max="365"
                  value={localSettings.borrowDurationDays}
                  onChange={(e) => setLocalSettings({...localSettings, borrowDurationDays: parseInt(e.target.value) || 1})}
                  className="w-24 px-3 py-2 border border-slate-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center font-medium"
                />
                <span className="bg-slate-200 border border-l-0 border-slate-300 px-4 py-2 rounded-r-md text-slate-600 text-sm">
                  Hari
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Nilai ini digunakan untuk menghitung batas waktu pengembalian secara otomatis saat mencatat peminjaman baru, serta acuan sistem reminder keterlambatan.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-100">
            {saved && <span className="text-sm text-emerald-600 font-medium">Pengaturan berhasil disimpan!</span>}
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md transition-colors flex items-center space-x-2"
            >
              <Save size={18} />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}