import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import API from '../services/api';
import { Booking } from '../types';
import QRCode from 'qrcode';
import {
  CheckCircle2,
  Printer,
  Ticket,
  ArrowRight,
  Film,
  MapPin,
  Calendar,
  Clock,
  QrCode,
  Download,
  Copy,
  Check,
  X,
  Maximize2,
  ScanLine
} from 'lucide-react';

export const BookingConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [booking, setBooking] = useState<Booking | null>(
    (location.state as { booking?: Booking })?.booking || null
  );
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState('');

  // QR Code States
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!booking && id) {
      setLoading(true);
      API.get<Booking>(`/bookings/${id}`)
        .then((data) => setBooking(data))
        .catch((err) => setError(err.message || 'Unable to retrieve ticket'))
        .finally(() => setLoading(false));
    }
  }, [id, booking]);

  // Generate QR code for the booking reference
  const generateQr = async (targetBooking: Booking, openModalAfter: boolean = false) => {
    try {
      setIsGeneratingQr(true);
      const payload = JSON.stringify({
        ref: targetBooking.bookingReference,
        movie: targetBooking.show.movie.title,
        cinema: targetBooking.show.cinema.name,
        seats: targetBooking.show ? targetBooking.seats : [],
        hall: targetBooking.show.hallNumber,
        time: targetBooking.show.showDateTime,
      });

      const url = await QRCode.toDataURL(payload, {
        width: 380,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });

      setQrDataUrl(url);
      if (openModalAfter) {
        setShowQrModal(true);
      }
    } catch (err) {
      console.error('Failed to generate QR code', err);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  // Pre-generate QR code when booking data arrives
  useEffect(() => {
    if (booking) {
      generateQr(booking, false);
    }
  }, [booking]);

  const handleOpenQrModal = () => {
    if (booking) {
      if (!qrDataUrl) {
        generateQr(booking, true);
      } else {
        setShowQrModal(true);
      }
    }
  };

  const handleCopyReference = () => {
    if (!booking) return;
    navigator.clipboard.writeText(booking.bookingReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl || !booking) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `IMOVIES-PASS-${booking.bookingReference}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          Your e-ticket is issued and ready. Present the entrance QR code at the cinema gate.
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

            {/* Interactive QR Code Card */}
            <div
              onClick={handleOpenQrModal}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenQrModal(); }}
              className="bg-[#0b0f19] hover:bg-slate-900/90 p-3 rounded-xl border border-slate-800 hover:border-slate-700 flex items-center gap-3 shrink-0 cursor-pointer transition-colors group"
              title="Click to view full-screen QR entrance pass"
            >
              <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center relative overflow-hidden shadow-sm">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for booking ${booking.bookingReference}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode className="w-12 h-12 text-slate-900" />
                )}
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <span className="flex items-center gap-1 font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                  <ScanLine className="w-3.5 h-3.5 text-emerald-400" />
                  Entrance QR Pass
                </span>
                <span className="block font-mono text-[10px] text-slate-500">{booking.bookingReference}</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                  <Maximize2 className="w-2.5 h-2.5 text-slate-500" /> Click to enlarge
                </span>
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

      {/* Action Buttons Row */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 no-print">
        {/* Requested Button: Generate QR Code for Cinema Entrance */}
        <button
          onClick={handleOpenQrModal}
          disabled={isGeneratingQr}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-md shadow-emerald-950 transition-all cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-emerald-200" />
          <span>{isGeneratingQr ? 'Generating QR...' : 'Show Cinema Entrance QR'}</span>
        </button>

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

      {/* Full-Screen Cinema Entrance QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 no-print">
          <div className="bg-[#101726] border border-slate-700/80 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors"
              aria-label="Close QR Modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-2.5">
                <ScanLine className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Cinema Entrance Scanner Pass</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Scan this barcode at the turnstile gate or usher scanner
              </p>
            </div>

            {/* Scannable QR Code display */}
            <div className="bg-white p-4 rounded-2xl mx-auto inline-block shadow-lg border-4 border-slate-200">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`Entrance QR Code for ${booking.bookingReference}`}
                  className="w-56 h-56 object-contain block mx-auto"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Booking Details Summary */}
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Booking Reference:</span>
                <span className="font-mono font-bold text-red-400">{booking.bookingReference}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Movie:</span>
                <span className="font-semibold truncate max-w-[180px]">{show.movie.title}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Seats:</span>
                <span className="font-bold text-white tabular-nums">{booking.seats.join(', ')} (Hall {show.hallNumber})</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Cinema:</span>
                <span className="truncate max-w-[180px]">{show.cinema.name}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleCopyReference}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied Ref!' : 'Copy Code'}</span>
              </button>

              <button
                onClick={handleDownloadQr}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-950 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
