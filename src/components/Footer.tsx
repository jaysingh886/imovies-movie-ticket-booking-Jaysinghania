import React from 'react';
import { Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070b12] py-10 mt-auto no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-red-600/90 flex items-center justify-center text-white">
              <Film className="w-3.5 h-3.5" />
            </div>
            <span className="text-base font-bold text-white tracking-wider">IMOVIES</span>
            <span className="text-xs text-slate-500 ml-2">Movie Ticket Booking Made Simple</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/" className="hover:text-slate-200 transition-colors">Home</Link>
            <Link to="/movies" className="hover:text-slate-200 transition-colors">Now Showing</Link>
            <Link to="/login" className="hover:text-slate-200 transition-colors">Sign In</Link>
          </div>

          <p className="text-xs text-slate-500 tabular-nums">
            &copy; 2026 IMovies Entertainment. Full-Stack MERN Architecture.
          </p>
        </div>
      </div>
    </footer>
  );
};
