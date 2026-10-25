import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Movie, Cinema, Show, Booking } from '../types';
import { ShieldAlert, Film, Calendar, Plus, Trash2, Ticket, TrendingUp, Users, DollarSign, CheckCircle2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, login } = useAuth();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MOVIES' | 'SHOWS' | 'BOOKINGS'>('OVERVIEW');

  // New Movie Form State
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    genres: 'Action',
    language: 'English',
    duration: 135,
    rating: 8.5,
    director: '',
    status: 'now-showing' as 'now-showing' | 'coming-soon',
  });

  // New Show Form State
  const [newShow, setNewShow] = useState({
    movie: '',
    cinema: '',
    showDateTime: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString().slice(0, 16),
    ticketPrice: 280,
    hallNumber: 1,
  });

  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [moviesData, cinemasData] = await Promise.all([
        API.get<Movie[]>('/movies'),
        API.get<Cinema[]>('/cinemas'),
      ]);
      setMovies(moviesData);
      setCinemas(cinemasData);
      if (moviesData.length > 0 && !newShow.movie) {
        setNewShow((prev) => ({ ...prev, movie: moviesData[0]._id }));
      }
      if (cinemasData.length > 0 && !newShow.cinema) {
        setNewShow((prev) => ({ ...prev, cinema: cinemasData[0]._id }));
      }

      if (user?.role === 'admin') {
        const bookingsData = await API.get<Booking[]>('/bookings/admin/all').catch(() => []);
        setBookings(bookingsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 bg-amber-950/60 border border-amber-600/40 rounded-xl flex items-center justify-center text-amber-400 mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
        <p className="text-xs text-slate-400 mb-6">
          This operational console is restricted to system administrators.
        </p>
        <button
          onClick={() => login('admin@imovies.com', 'admin123')}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg transition-colors"
        >
          One-Click Login as Admin
        </button>
      </div>
    );
  }

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg({ type: '', text: '' });
    try {
      await API.post('/movies', {
        ...newMovie,
        genres: newMovie.genres.split(',').map((s) => s.trim()),
      });
      setFormMsg({ type: 'success', text: 'Movie successfully added to catalog!' });
      setNewMovie({
        title: '',
        description: '',
        genres: 'Action',
        language: 'English',
        duration: 135,
        rating: 8.5,
        director: '',
        status: 'now-showing',
      });
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add movie';
      setFormMsg({ type: 'error', text: msg });
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!confirm('Are you sure you want to remove this movie?')) return;
    try {
      await API.delete(`/movies/${id}`);
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleAddShow = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg({ type: '', text: '' });
    try {
      await API.post('/shows', newShow);
      setFormMsg({ type: 'success', text: 'New showtime scheduled successfully!' });
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create showtime';
      setFormMsg({ type: 'error', text: msg });
    }
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalSeatsSold = bookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">
              Administrator Console
            </span>
            <span className="text-xs text-slate-400">Logged in as {user.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            IMovies Operations &amp; Management
          </h1>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-[#101726] p-1 border border-slate-800 rounded-lg">
          {(['OVERVIEW', 'MOVIES', 'SHOWS', 'BOOKINGS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setFormMsg({ type: '', text: '' });
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {formMsg.text && (
        <div
          className={`p-3 rounded-xl mb-6 text-xs flex items-center gap-2 ${
            formMsg.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800/50 text-emerald-300'
              : 'bg-red-950/60 border border-red-800/50 text-red-300'
          }`}
        >
          {formMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          <span>{formMsg.text}</span>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Metric KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#101726] border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Total Ticket Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">₹{totalRevenue}</div>
              <span className="text-[11px] text-slate-500">Live platform sum</span>
            </div>

            <div className="bg-[#101726] border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Total Bookings</span>
                <Ticket className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">{bookings.length}</div>
              <span className="text-[11px] text-slate-500">Confirmed orders</span>
            </div>

            <div className="bg-[#101726] border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Seats Reserved</span>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">{totalSeatsSold}</div>
              <span className="text-[11px] text-slate-500">Total individual seats</span>
            </div>

            <div className="bg-[#101726] border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Active Movies</span>
                <Film className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white tabular-nums">{movies.length}</div>
              <span className="text-[11px] text-slate-500">In catalog</span>
            </div>
          </div>

          {/* Recent Bookings table */}
          <div className="bg-[#101726] border border-slate-800 rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-4">Recent Customer Bookings</h2>
            {bookings.length === 0 ? (
              <p className="text-xs text-slate-500">No bookings recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 font-semibold">
                    <tr>
                      <th className="pb-3">Ref Code</th>
                      <th className="pb-3">Movie</th>
                      <th className="pb-3">Cinema</th>
                      <th className="pb-3">Seats</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {bookings.slice(0, 6).map((b) => (
                      <tr key={b._id} className="hover:bg-slate-900/50">
                        <td className="py-3 font-mono font-bold text-red-400">{b.bookingReference}</td>
                        <td className="py-3 font-medium text-white">{b.show?.movie?.title}</td>
                        <td className="py-3">{b.show?.cinema?.name}</td>
                        <td className="py-3">
                          <span className="font-bold text-slate-200">{b.seats.join(', ')}</span>
                        </td>
                        <td className="py-3">{b.user?.name || 'Customer'}</td>
                        <td className="py-3 text-right font-bold text-emerald-400 tabular-nums">₹{b.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOVIES TAB */}
      {activeTab === 'MOVIES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add movie form */}
          <div className="bg-[#101726] border border-slate-800 rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-red-500" />
              Add New Movie
            </h2>

            <form onSubmit={handleAddMovie} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Movie Title</label>
                <input
                  type="text"
                  required
                  value={newMovie.title}
                  onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                  placeholder="e.g. Dune: Part Three"
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Synopsis</label>
                <textarea
                  required
                  rows={3}
                  value={newMovie.description}
                  onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                  placeholder="Brief synopsis..."
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Genre(s)</label>
                  <input
                    type="text"
                    value={newMovie.genres}
                    onChange={(e) => setNewMovie({ ...newMovie, genres: e.target.value })}
                    placeholder="Sci-Fi, Action"
                    className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Language</label>
                  <input
                    type="text"
                    value={newMovie.language}
                    onChange={(e) => setNewMovie({ ...newMovie, language: e.target.value })}
                    className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newMovie.duration}
                    onChange={(e) => setNewMovie({ ...newMovie, duration: Number(e.target.value) })}
                    className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMovie.rating}
                    onChange={(e) => setNewMovie({ ...newMovie, rating: Number(e.target.value) })}
                    className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Director</label>
                <input
                  type="text"
                  value={newMovie.director}
                  onChange={(e) => setNewMovie({ ...newMovie, director: e.target.value })}
                  placeholder="Director name"
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Status</label>
                <select
                  value={newMovie.status}
                  onChange={(e) => setNewMovie({ ...newMovie, status: e.target.value as any })}
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                >
                  <option value="now-showing">Now Showing</option>
                  <option value="coming-soon">Coming Soon</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-sm transition-all"
              >
                Add Movie to Catalog
              </button>
            </form>
          </div>

          {/* Movie catalog list */}
          <div className="lg:col-span-2 bg-[#101726] border border-slate-800 rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-4">Current Movies ({movies.length})</h2>
            <div className="space-y-3">
              {movies.map((m) => (
                <div key={m._id} className="p-3 bg-[#0b0f19] border border-slate-800 rounded-lg flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      referrerPolicy="no-referrer"
                      className="w-10 h-14 object-cover rounded border border-slate-800"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{m.title}</h4>
                      <p className="text-[11px] text-slate-400">{m.genres.join(', ')} · {m.duration}m · {m.status}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMovie(m._id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors"
                    title="Remove Movie"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SHOWS TAB */}
      {activeTab === 'SHOWS' && (
        <div className="max-w-2xl bg-[#101726] border border-slate-800 rounded-xl p-6">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-500" />
            Schedule New Showtime
          </h2>

          <form onSubmit={handleAddShow} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Select Movie</label>
              <select
                value={newShow.movie}
                onChange={(e) => setNewShow({ ...newShow, movie: e.target.value })}
                className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
              >
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>{m.title} ({m.language})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Select Cinema</label>
              <select
                value={newShow.cinema}
                onChange={(e) => setNewShow({ ...newShow, cinema: e.target.value })}
                className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
              >
                {cinemas.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} - {c.city}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Date &amp; Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newShow.showDateTime}
                  onChange={(e) => setNewShow({ ...newShow, showDateTime: e.target.value })}
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ticket Price (₹)</label>
                <input
                  type="number"
                  required
                  value={newShow.ticketPrice}
                  onChange={(e) => setNewShow({ ...newShow, ticketPrice: Number(e.target.value) })}
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Hall Number</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newShow.hallNumber}
                  onChange={(e) => setNewShow({ ...newShow, hallNumber: Number(e.target.value) })}
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-sm transition-all"
            >
              Confirm and Schedule Showtime
            </button>
          </form>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'BOOKINGS' && (
        <div className="bg-[#101726] border border-slate-800 rounded-xl p-6">
          <h2 className="text-base font-bold text-white mb-4">All System Bookings ({bookings.length})</h2>
          {bookings.length === 0 ? (
            <p className="text-xs text-slate-500">No bookings exist yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 font-semibold">
                  <tr>
                    <th className="pb-3">Reference</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Movie</th>
                    <th className="pb-3">Seats</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Booked At</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-900/50">
                      <td className="py-3 font-mono font-bold text-red-400">{b.bookingReference}</td>
                      <td className="py-3">
                        <span className="font-medium text-white">{b.user?.name}</span>
                        <span className="block text-[10px] text-slate-500">{b.user?.email}</span>
                      </td>
                      <td className="py-3">{b.show?.movie?.title}</td>
                      <td className="py-3 font-bold text-slate-200">{b.seats.join(', ')}</td>
                      <td className="py-3">
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-900/40 px-2 py-0.5 rounded">
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-right font-bold text-emerald-400 tabular-nums">₹{b.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
