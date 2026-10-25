import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { Movie, Show } from '../types';
import { Star, Clock, Calendar, MapPin, User, ArrowLeft, Ticket, Film } from 'lucide-react';

export const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      API.get<Movie>(`/movies/${id}`),
      API.get<Show[]>(`/shows/movie/${id}`),
    ])
      .then(([movieData, showsData]) => {
        setMovie(movieData);
        setShows(showsData);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load movie details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Film className="w-12 h-12 text-slate-700 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Movie Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">{error || "The requested movie doesn't exist."}</p>
        <Link to="/movies" className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Backdrop Header */}
      <div className="relative min-h-[360px] md:min-h-[420px] bg-cover bg-center border-b border-slate-800" style={{ backgroundImage: `url(${movie.backdropUrl})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/80 to-[#0b0f19]/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 flex flex-col justify-end min-h-[360px] md:min-h-[420px]">
          <Link to="/movies" className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white mb-6 w-fit bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Movies</span>
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300 font-medium">
              <span className="flex items-center gap-1 text-amber-400 font-bold tabular-nums">
                <Star className="w-4 h-4 fill-amber-400" />
                {movie.rating.toFixed(1)} / 10
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{movie.genres.join(', ')}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="tabular-nums">{movie.duration} Mins</span>
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{movie.language}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Poster & Details Card */}
          <div className="bg-[#101726] border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="aspect-[3/4] rounded-lg overflow-hidden mb-5 bg-slate-900 border border-slate-800">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-semibold mb-0.5">Director</span>
                <span className="text-white font-medium text-sm">{movie.director}</span>
              </div>

              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-semibold mb-0.5">Main Cast</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {movie.cast.map((actor) => (
                      <span key={actor} className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-xs">
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-semibold mb-0.5">Release Date</span>
                <span className="text-slate-300 tabular-nums">{new Date(movie.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Synopsis and Available Showtimes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis Card */}
            <div className="bg-[#101726] border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-3">About the Movie</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* Showtimes & Booking Section */}
            <div className="bg-[#101726] border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-500" />
                    Available Showtimes
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a cinema and showtime to pick your seats
                  </p>
                </div>
                <span className="text-xs text-slate-400 tabular-nums">
                  {shows.length} {shows.length === 1 ? 'Showtime' : 'Showtimes'} Available
                </span>
              </div>

              {shows.length === 0 ? (
                <div className="p-8 text-center bg-[#0b0f19] rounded-lg border border-slate-800">
                  <Clock className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-300 font-semibold mb-1">No Scheduled Showtimes</p>
                  <p className="text-xs text-slate-500">
                    Currently there are no active screenings for this movie. Check back soon or view our other films.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shows.map((show) => {
                    const dateObj = new Date(show.showDateTime);
                    const formattedDate = dateObj.toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    });
                    const formattedTime = dateObj.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const totalSeats = 48; // 6 rows * 8
                    const remainingSeats = Math.max(0, totalSeats - (show.bookedSeats?.length || 0));

                    return (
                      <div
                        key={show._id}
                        className="bg-[#0b0f19] border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{show.cinema.name}</h3>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {show.cinema.city}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="text-slate-300 font-medium">{formattedDate}</span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="text-red-400 font-semibold tabular-nums">{formattedTime}</span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span>Hall {show.hallNumber}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            <span className="tabular-nums text-slate-400">{remainingSeats}</span> seats left
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Per Ticket</span>
                            <span className="text-base font-bold text-emerald-400 tabular-nums">₹{show.ticketPrice}</span>
                          </div>

                          <Link
                            to={`/booking/${show._id}`}
                            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg flex items-center gap-1.5 shadow-sm shadow-red-600/30 transition-all whitespace-nowrap"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>Select Seats</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
