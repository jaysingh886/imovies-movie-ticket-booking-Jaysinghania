import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { Show } from '../types';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Ticket, Check, ShieldAlert, Sparkles, MapPin, Clock } from 'lucide-react';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEATS_PER_ROW = 8;

export const SeatSelection: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [show, setShow] = useState<Show | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!showId) return;
    setLoading(true);
    API.get<Show>(`/shows/${showId}`)
      .then((data) => setShow(data))
      .catch((err) => setError(err.message || 'Failed to load show seating'))
      .finally(() => setLoading(false));
  }, [showId]);

  const toggleSeat = (seatId: string) => {
    if (!show || show.bookedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      // Limit to 10 seats per booking
      if (selectedSeats.length >= 10) {
        alert('You can select a maximum of 10 seats per transaction.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0 || !show) return;

    if (!user) {
      // Direct guest to login while preserving target
      navigate('/login', {
        state: {
          returnTo: `/booking/${show._id}`,
          message: 'Please sign in or create an account to finalize your ticket booking.',
        },
      });
      return;
    }

    navigate('/checkout', {
      state: {
        show,
        selectedSeats,
        totalAmount: selectedSeats.length * show.ticketPrice,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Showtime Unavailable</h2>
        <p className="text-xs text-slate-400 mb-6">{error || 'Unable to locate this screening session.'}</p>
        <Link to="/movies" className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-500">
          <ArrowLeft className="w-4 h-4" />
          Browse Movies
        </Link>
      </div>
    );
  }

  const dateObj = new Date(show.showDateTime);
  const formattedDateTime = dateObj.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }) + ' at ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const totalPrice = selectedSeats.length * show.ticketPrice;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Top Breadcrumb & Showtime Info Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <Link
            to={`/movies/${show.movie._id}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {show.movie.title}</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">{show.movie.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1 font-medium">
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3 h-3 text-red-500" />
              {show.cinema.name}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {formattedDateTime}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Hall {show.hallNumber}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#101726] border border-slate-800 px-4 py-2 rounded-xl">
          <span className="text-xs text-slate-400">Price:</span>
          <span className="text-base font-bold text-emerald-400 tabular-nums">₹{show.ticketPrice}</span>
          <span className="text-[11px] text-slate-500">/ seat</span>
        </div>
      </div>

      {/* Screen Graphic & Projection Angle */}
      <div className="relative my-10 max-w-2xl mx-auto text-center">
        <div className="cinema-screen mb-3 mx-auto" style={{ width: '85%' }} />
        <span className="text-[11px] font-bold text-slate-400 tracking-[0.25em] uppercase">
          Cinema Projection Screen
        </span>
      </div>

      {/* Seating Matrix Grid */}
      <div className="bg-[#101726] border border-slate-800 rounded-2xl p-6 sm:p-10 mb-8 max-w-3xl mx-auto shadow-2xl overflow-x-auto">
        <div className="min-w-[480px] flex flex-col items-center">
          {ROWS.map((row) => (
            <div key={row} className="flex items-center justify-center my-1">
              {/* Row Letter Left */}
              <span className="w-8 text-center text-xs font-bold text-slate-400">{row}</span>

              {/* Seats in Row */}
              <div className="flex items-center gap-1.5 mx-2">
                {Array.from({ length: SEATS_PER_ROW }, (_, idx) => {
                  const seatNumber = idx + 1;
                  const seatId = `${row}${seatNumber}`;
                  const isBooked = show.bookedSeats.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);

                  // Add an aisle gap in the middle (after seat 4)
                  const hasAisleGap = seatNumber === 4;

                  return (
                    <React.Fragment key={seatId}>
                      <button
                        type="button"
                        onClick={() => toggleSeat(seatId)}
                        disabled={isBooked}
                        aria-label={`Seat ${seatId} ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
                        className={`seat-btn ${
                          isBooked
                            ? 'seat-btn-booked'
                            : isSelected
                            ? 'seat-btn-selected'
                            : 'seat-btn-available'
                        }`}
                      >
                        {seatNumber}
                      </button>
                      {hasAisleGap && <div className="w-6" />}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Row Letter Right */}
              <span className="w-8 text-center text-xs font-bold text-slate-400">{row}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Seat Status Legend */}
      <div className="flex items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 mb-10">
        <div className="flex items-center gap-2">
          <div className="seat-btn seat-btn-available !w-5 !h-5 !cursor-default" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="seat-btn seat-btn-selected !w-5 !h-5 !cursor-default" />
          <span className="text-emerald-400 font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="seat-btn seat-btn-booked !w-5 !h-5 !cursor-not-allowed" />
          <span className="text-slate-500">Already Booked</span>
        </div>
      </div>

      {/* Floating Bottom Booking Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-800 shadow-2xl py-3 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div>
              <span className="text-[11px] text-slate-400 block">Selected Seats</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((seat) => (
                    <span
                      key={seat}
                      className="px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded text-xs font-bold tabular-nums"
                    >
                      {seat}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">None selected yet</span>
                )}
              </div>
            </div>

            <div className="sm:border-l sm:border-slate-800 sm:pl-4">
              <span className="text-[11px] text-slate-400 block">Total Amount</span>
              <span className="text-lg font-bold text-white tabular-nums">
                ₹{totalPrice}
                {selectedSeats.length > 0 && (
                  <span className="text-xs text-slate-400 font-normal ml-1">
                    ({selectedSeats.length} × ₹{show.ticketPrice})
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Ticket className="w-4 h-4" />
              <span>Proceed to Checkout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
