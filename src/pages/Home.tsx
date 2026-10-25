import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Movie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Star, Clock, Ticket, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const Home: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get<Movie[]>('/movies')
      .then((data) => setMovies(data))
      .catch((err) => setError(err.message || 'Failed to load movies'))
      .finally(() => setLoading(false));
  }, []);

  const heroMovie = movies.find((m) => m.status === 'now-showing') || movies[0];
  const nowShowing = movies.filter((m) => m.status === 'now-showing');
  const comingSoon = movies.filter((m) => m.status === 'coming-soon');

  return (
    <div className="pb-16">
      {/* Hero Premiere Banner */}
      {heroMovie && (
        <section className="relative min-h-[520px] md:min-h-[580px] flex items-center overflow-hidden border-b border-slate-800">
          {/* Background image & gradient scrim */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url(${heroMovie.backdropUrl})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f19] via-[#0b0f19]/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-transparent to-[#0b0f19]/40" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
            <div className="max-w-2xl">
              {/* Unboxed Kicker */}
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500 mb-3">
                <Sparkles className="w-4 h-4 text-red-500" />
                <span>Featured IMAX Premiere</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4 text-balance">
                {heroMovie.title}
              </h1>

              {/* Unboxed Metadata line */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300 mb-4 font-medium">
                <span className="flex items-center gap-1 text-amber-400 font-bold tabular-nums">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {heroMovie.rating.toFixed(1)} / 10
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{heroMovie.genres.join(', ')}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="tabular-nums">{heroMovie.duration} Mins</span>
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-300">{heroMovie.language}</span>
              </div>

              {/* Synopsis */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-xl line-clamp-3">
                {heroMovie.description}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/movies/${heroMovie._id}`}
                  className="px-6 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Tickets Now</span>
                </Link>
                <Link
                  to="/movies"
                  className="px-5 py-3 text-sm font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap"
                >
                  Explore All Movies
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Feature Highlights Strip */}
      <section className="border-b border-slate-800/80 bg-[#0e1422] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3">
              <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Instant E-Ticket</h4>
                <p className="text-[11px] text-slate-400">Barcode &amp; QR ready</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3">
              <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400 shrink-0">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Interactive Seating</h4>
                <p className="text-[11px] text-slate-400">Live seat concurrency</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Secure Auth</h4>
                <p className="text-[11px] text-slate-400">JWT token protection</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3">
              <div className="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">IMAX &amp; Dolby Luxe</h4>
                <p className="text-[11px] text-slate-400">Curated audio-visual halls</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Now Showing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Now Showing in Cinemas</h2>
            <p className="text-xs text-slate-400 mt-0.5">Catch the latest blockbusters on the big screen</p>
          </div>
          <Link
            to="/movies"
            className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nowShowing.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* Coming Soon Preview Section */}
      {comingSoon.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Coming Soon to IMovies</h2>
              <p className="text-xs text-slate-400 mt-0.5">Anticipated titles arriving in theaters shortly</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {comingSoon.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
