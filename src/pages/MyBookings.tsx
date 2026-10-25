import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Booking } from '../types';
import { Ticket, Film, Calendar, MapPin, Clock, ArrowRight, Printer } from 'lucide-react';

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get<Booking[]>('/bookings/my-bookings')
      .then((data) => setBookings(data))
      .catch((err) => setError(err.message || 'Failed to load booking history'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-red-500" />
            My Ticket History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review your confirmed cinema reservations, view e-tickets, and print vouchers
          </p>
        </div>

        <Link
          to="/movies"
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-red-600/30 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Book More Tickets</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {error ? (
        <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-300 text-xs">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-[#101726] border border-slate-800 rounded-2xl p-12 text-center">
          <Ticket className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Bookings Found</h3>
          <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
            You haven't reserved any cinema tickets yet. Explore now showing blockbusters and pick your favourite seats.
          </p>
          <Link
            to="/movies"
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-red-600/30 transition-all"
          >
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const { show } = booking;
            const dateObj = new Date(show?.showDateTime || '');
            const formattedDate = dateObj.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={booking._id}
                className="bg-[#101726] border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 flex-1">
                  {show?.movie?.posterUrl ? (
                    <img
                      src={show.movie.posterUrl}
                      alt={show.movie.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-24 object-cover rounded-lg border border-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
                      <Film className="w-6 h-6 text-slate-700" />
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-red-400 bg-red-950/60 border border-red-900/40 px-2 py-0.5 rounded">
                        {booking.bookingReference}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-900/40 px-2 py-0.5 rounded">
                        {booking.bookingStatus}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{show?.movie?.title || 'Film Title'}</h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {show?.cinema?.name}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formattedDate} at {formattedTime}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>Hall {show?.hallNumber}</span>
                    </div>

                    <div className="pt-1 flex items-center gap-2 text-xs">
                      <span className="text-slate-500">Seats:</span>
                      <div className="flex gap-1 flex-wrap">
                        {booking.seats.map((s) => (
                          <span key={s} className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-bold text-white text-[11px] tabular-nums">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Amount Paid</span>
                    <span className="text-lg font-bold text-emerald-400 tabular-nums">₹{booking.totalAmount}</span>
                  </div>

                  <Link
                    to={`/confirmation/${booking._id}`}
                    state={{ booking }}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <Ticket className="w-3.5 h-3.5 text-red-400" />
                    <span>View Digital Ticket</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
