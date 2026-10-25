import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { Show, Booking } from '../types';
import { CreditCard, ShieldCheck, ArrowLeft, AlertCircle, CheckCircle2, Ticket } from 'lucide-react';

interface CheckoutState {
  show: Show;
  selectedSeats: string[];
  totalAmount: number;
}

export const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState | undefined;

  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'NETBANKING'>('CARD');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!state || !state.show || !state.selectedSeats || state.selectedSeats.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Ticket className="w-12 h-12 text-slate-700 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">No Active Booking Session</h2>
        <p className="text-xs text-slate-400 mb-6">
          Your booking cart is currently empty or the session expired.
        </p>
        <Link
          to="/movies"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Available Movies</span>
        </Link>
      </div>
    );
  }

  const { show, selectedSeats, totalAmount } = state;
  const dateObj = new Date(show.showDateTime);
  const formattedDateTime = dateObj.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }) + ' at ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handlePay = async () => {
    setProcessing(true);
    setError('');

    try {
      const booking = await API.post<Booking>('/bookings', {
        showId: show._id,
        seats: selectedSeats,
        totalAmount,
      });

      // Navigate to confirmation page
      navigate(`/confirmation/${booking._id}`, {
        state: { booking },
        replace: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reservation failed. Please try again.';
      setError(msg);
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      <Link
        to={`/booking/${show._id}`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Seat Matrix</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left Column: Order Summary Card (3 cols) */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-[#101726] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Booking Summary</h2>

            <div className="flex gap-4 pb-6 border-b border-slate-800">
              <img
                src={show.movie.posterUrl}
                alt={show.movie.title}
                referrerPolicy="no-referrer"
                className="w-20 h-28 object-cover rounded-lg border border-slate-800 shrink-0"
              />
              <div className="flex-1 space-y-1">
                <h3 className="text-base font-bold text-white">{show.movie.title}</h3>
                <p className="text-xs text-slate-400 font-medium">{show.movie.genres.join(', ')} · {show.movie.language}</p>
                <p className="text-xs text-slate-300 font-semibold pt-1">{show.cinema.name}</p>
                <p className="text-xs text-slate-400">{formattedDateTime} (Hall {show.hallNumber})</p>
              </div>
            </div>

            {/* Selected Seats detail */}
            <div className="py-4 border-b border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Selected Seats:</span>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {selectedSeats.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-red-950/60 text-red-400 border border-red-900/50 rounded font-bold tabular-nums">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Tickets Quantity:</span>
                <span className="font-semibold tabular-nums">{selectedSeats.length} Tickets</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Base Ticket Price:</span>
                <span className="tabular-nums">₹{show.ticketPrice} per ticket</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Online Booking Fee:</span>
                <span className="text-emerald-400 font-medium">Free (Demo Mode)</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-white">Total Amount Payable</span>
              <span className="text-2xl font-extrabold text-emerald-400 tabular-nums">₹{totalAmount}</span>
            </div>
          </div>

          {/* Atomic Concurrency Error Notification */}
          {error && (
            <div className="p-4 bg-red-950/50 border border-red-700/60 rounded-xl text-xs text-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-red-400 mb-1">Seat Reservation Conflict</p>
                <p>{error}</p>
                <Link
                  to={`/booking/${show._id}`}
                  className="mt-3 inline-block px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold"
                >
                  Choose Different Seats
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Payment Gateway Simulation (2 cols) */}
        <div className="md:col-span-2">
          <div className="bg-[#101726] border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-24 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Payment Method</h3>
              <p className="text-xs text-slate-400">Sandbox Demo Gateway</p>
            </div>

            {/* Demo Notice */}
            <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl flex items-start gap-2.5 text-xs text-blue-200">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Simulated payment test environment. No real money or credit card charges will occur.</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-colors ${
                  paymentMethod === 'CARD'
                    ? 'bg-red-950/30 border-red-600 text-white'
                    : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-red-400" />
                  Instant Debit / Credit Card
                </span>
                {paymentMethod === 'CARD' && <CheckCircle2 className="w-4 h-4 text-red-400" />}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-colors ${
                  paymentMethod === 'UPI'
                    ? 'bg-red-950/30 border-red-600 text-white'
                    : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>UPI / QR Payment</span>
                {paymentMethod === 'UPI' && <CheckCircle2 className="w-4 h-4 text-red-400" />}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NETBANKING')}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-colors ${
                  paymentMethod === 'NETBANKING'
                    ? 'bg-red-950/30 border-red-600 text-white'
                    : 'bg-[#0b0f19] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>Net Banking</span>
                {paymentMethod === 'NETBANKING' && <CheckCircle2 className="w-4 h-4 text-red-400" />}
              </button>
            </div>

            {/* Mock Card Form Details */}
            {paymentMethod === 'CARD' && (
              <div className="space-y-2.5 pt-2 text-xs">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Card Number (Mock)</label>
                  <input
                    type="text"
                    readOnly
                    value="•••• •••• •••• 4242"
                    className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 font-mono text-xs focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Expiry</label>
                    <input
                      type="text"
                      readOnly
                      value="12/28"
                      className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">CVV</label>
                    <input
                      type="text"
                      readOnly
                      value="•••"
                      className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CTA Pay Button */}
            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing Demo Transaction...</span>
                </>
              ) : (
                <span>Pay ₹{totalAmount} with Demo Sandbox</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
