import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Film } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group flex flex-col bg-[#141d30] border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 hover:shadow-xl hover:shadow-black/60 transition-all duration-200">
      {/* Poster Image Container (3:4 aspect ratio) */}
      <div className="relative aspect-[3/4] bg-slate-900 overflow-hidden">
        {!imageError ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 to-slate-800">
            <Film className="w-12 h-12 text-slate-700 mb-2" />
            <span className="text-sm font-semibold text-slate-400">{movie.title}</span>
          </div>
        )}

        {/* Status indicator if coming soon */}
        {movie.status === 'coming-soon' && (
          <div className="absolute top-3 left-3 bg-slate-950/90 text-amber-300 border border-amber-500/30 text-[11px] font-semibold tracking-wider px-2.5 py-1 rounded">
            COMING SOON
          </div>
        )}

        {/* Rating overlay badge */}
        <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-amber-400 px-2 py-1 rounded flex items-center gap-1 text-xs font-bold tabular-nums">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{movie.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        {/* Unboxed Metadata Line */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
          <span className="text-red-400">{movie.genres[0]}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{movie.language}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="tabular-nums">{movie.duration}m</span>
          </span>
        </div>

        {/* Movie Title */}
        <h3 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-red-400 transition-colors" title={movie.title}>
          {movie.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {movie.description}
        </p>

        {/* Action Button */}
        <div className="mt-auto pt-2 border-t border-slate-800/80">
          <Link
            to={`/movies/${movie._id}`}
            className="w-full py-2 px-3 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center gap-2 shadow-sm shadow-red-600/30 transition-all"
          >
            {movie.status === 'coming-soon' ? 'View Details' : 'Book Tickets'}
          </Link>
        </div>
      </div>
    </div>
  );
};
