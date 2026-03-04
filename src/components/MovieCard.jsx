import { Star } from 'lucide-react';
import WinnerBadge from './WinnerBadge';

const PLACEHOLDER_POSTER = 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
    <rect fill="#1f2937" width="300" height="450"/>
    <text fill="#6b7280" font-family="sans-serif" font-size="16" text-anchor="middle" x="150" y="220">No Poster</text>
    <text fill="#4b5563" font-family="sans-serif" font-size="40" text-anchor="middle" x="150" y="190">🎬</text>
  </svg>`
);

export default function MovieCard({ movie, winner, person }) {
  const posterSrc = movie.poster || PLACEHOLDER_POSTER;

  return (
    <div className={`relative group rounded-lg overflow-hidden bg-gray-900 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl ${
      winner ? 'ring-2 ring-gold shadow-gold/20 shadow-lg' : 'ring-1 ring-gray-800'
    }`}>
      {winner && <WinnerBadge />}

      {/* Poster */}
      <div className="aspect-[2/3] overflow-hidden bg-gray-800">
        <img
          src={posterSrc}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.target.src = PLACEHOLDER_POSTER; }}
        />
      </div>

      {/* Info overlay */}
      <div className="p-3">
        <h3 className={`font-semibold text-sm leading-tight mb-1 ${winner ? 'text-gold' : 'text-gray-100'}`}>
          {movie.title}
        </h3>

        {person && (
          <p className="text-xs text-gray-400 mb-1">{person}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500">
          {movie.imdbRating && (
            <span className="flex items-center gap-0.5">
              <Star size={10} className="text-yellow-500 fill-yellow-500" />
              {movie.imdbRating}
            </span>
          )}
          {movie.runtime && <span>{movie.runtime}</span>}
          {movie.year && <span>{movie.year}</span>}
        </div>

        {movie.plot && (
          <p className="text-xs text-gray-400 mt-2 line-clamp-3">{movie.plot}</p>
        )}

        {movie.genre && (
          <p className="text-xs text-gray-600 mt-1">{movie.genre}</p>
        )}
      </div>

      {/* IMDB link */}
      {movie.imdbID && (
        <a
          href={`https://www.imdb.com/title/${movie.imdbID}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-20"
          aria-label={`View ${movie.title} on IMDB`}
        />
      )}
    </div>
  );
}
