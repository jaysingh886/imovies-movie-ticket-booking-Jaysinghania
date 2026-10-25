import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import API from '../services/api';
import { Booking } from '../types';
import { CheckCircle2, Printer, Ticket, ArrowRight, Film, MapPin, Calendar, Clock, QrCode } from 'lucide-react';

export const BookingConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [booking, setBooking] = useState<Booking | null>(
    (location.state as { booking?: Booking })?.booking || null
  );
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!booking && id) {
      setLoading(true);
      API.get<Booking>(`/bookings/${id}`)
        .then((data) => setBooking(data))
        .catch((err) => setError(err.message || 'Unable to retrieve ticket'))
        .finally(() => setLoading(false));
    }
  }, [id, booking]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Film className="w-12 h-12 text-slate-700 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Booking Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">{error || 'Could not locate your reservation.'}</p>
        <Link to="/movies" className="inline-flex px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-500">
          Browse Movies
        </Link>
      </div>
    );
  }

  const { show } = booking;
  const dateObj = new Date(show.showDateTime);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Success Banner */}
      <div className="text-center mb-8 no-print">
        <div className="w-14 h-14 bg-emerald-950/80 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-lg shadow-emerald-950">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Booking Confirmed!</h1>
        <p className="text-xs text-slate-400 mt-1">
          Your e-ticket is issued and ready. A confirmation receipt has been added to your profile.
        </p>
      </div>

      {/* Printable E-Ticket Card */}
      <div className="ticket-card bg-[#101726] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Ticket Header Bar */}
        <div className="bg-red-600 px-6 py-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4" />
            <span className="font-bold text-xs tracking-wider uppercase">IMovies Official E-Ticket</span>
          </div>
          <span className="font-mono text-xs font-bold bg-black/20 px-2.5 py-0.5 rounded">
            {booking.bookingReference}
          </span>
        </div>

        {/* Main Ticket Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            <div className="space-y-2 flex-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Film Title</span>
              <h2 className="text-2xl font-extrabold text-white">{show.movie.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{show.movie.genres.join(', ')}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{show.movie.language}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{show.movie.duration}m</span>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800 flex items-center gap-3 shrink-0">
              <div className="p-2 bg-white rounded-lg">
                <QrCode className="w-12 h-12 text-slate-900" />
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <span className="block font-semibold text-slate-300">Scan at Entry</span>
                <span className="block font-mono text-[10px] text-slate-500">{booking.bookingReference}</span>
              </div>
            </div>
          </div>

          {/* Grid Metadata details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#0b0f19] rounded-xl border border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Cinema Venue</span>
              <span className="text-white font-medium">{show.cinema.name}</span>
              <span className="text-slate-400 block text-[11px]">{show.cinema.city}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date &amp; Time</span>
              <span className="text-white font-medium">{formattedDate}</span>
              <span className="text-red-400 block font-semibold">{formattedTime}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Screen / Hall</span>
              <span className="text-white font-medium">Hall {show.hallNumber}</span>
              <span className="text-slate-400 block text-[11px]">Dolby Luxe</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Seats</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {booking.seats.map((seat) => (
                  <span key={seat} className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded text-xs tabular-nums">
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Perforated Divider */}
          <div className="relative flex items-center justify-between border-t border-dashed border-slate-800 pt-6">
            <div className="text-xs text-slate-400">
              <span>Customer: </span>
              <span className="text-white font-medium">{booking.user.name}</span> ({booking.user.email})
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Total Paid (Demo)</span>
              <span className="text-xl font-bold text-emerald-400 tabular-nums">₹{booking.totalAmount}</span>
            </div>
          </div>

          {/* Simulated Barcode at bottom of voucher */}
          <div className="pt-2 text-center">
            <div className="h-9 w-full max-w-sm mx-auto flex items-stretch justify-center gap-1 opacity-60">
              {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 3, 1, 2, 1, 4, 2, 3, 1, 4, 1, 2, 3, 1].map((w, idx) => (
                <div key={idx} style={{ width: `${w * 2}px` }} className="bg-slate-400 h-full" />
              ))}
            </div>
            <span className="text-[10px] font-mono text-slate-500 tracking-widest mt-1 block">
              *{booking.bookingReference.replace(/-/g, '')}*
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 no-print">
        <button
          onClick={() => window.print()}
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-700"
        >
          <Printer className="w-4 h-4 text-slate-300" />
          <span>Print / Save Ticket Voucher</span>
        </button>

        <Link
          to="/my-bookings"
          className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm shadow-red-600/30 transition-all"
        >
          <Ticket className="w-4 h-4" />
          <span>View All My Bookings</span>
        </Link>

        <Link
          to="/movies"
          className="w-full sm:w-auto px-4 py-2.5 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1"
        >
          <span>Book Another Movie</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
