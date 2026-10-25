import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Movie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Search, Film, SlidersHorizontal } from 'lucide-react';

const GENRES = ['All', 'Sci-Fi', 'Action', 'Mystery', 'Drama', 'Fantasy'];
const STATUSES = [
  { label: 'All Statuses', value: 'All' },
  { label: 'Now Showing', value: 'now-showing' },
  { label: 'Coming Soon', value: 'coming-soon' },
];

export const Movies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchMovies = () => {
    setLoading(true);
    API.get<Movie[]>('/movies', {
      search: search || undefined,
      genre: selectedGenre !== 'All' ? selectedGenre : undefined,
      status: selectedStatus !== 'All' ? selectedStatus : undefined,
    })
      .then((data) => setMovies(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMovies();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Movie Catalog</h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore current theatrical screenings, find showtimes, and book your seats
        </p>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="bg-[#101726] border border-slate-800 rounded-xl p-4 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by movie title or synopsis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-24 py-2 bg-[#0b0f19] border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-md transition-colors"
            >
              Search
            </button>
          </form>

          {/* Interactive Filters (Clean Segmented Buttons) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#0b0f19] p-1 border border-slate-800 rounded-lg">
              {STATUSES.map((st) => (
                <button
                  key={st.value}
                  onClick={() => setSelectedStatus(st.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    selectedStatus === st.value
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    selectedGenre === g
                      ? 'bg-red-600 text-white'
                      : 'bg-[#0b0f19] border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="py-24 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : movies.length === 0 ? (
        <div className="bg-[#101726] border border-slate-800 rounded-xl p-12 text-center">
          <Film className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No movies found</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
            No screening matches your current search or genre filter. Try adjusting your query or resetting filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedGenre('All');
              setSelectedStatus('All');
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};
