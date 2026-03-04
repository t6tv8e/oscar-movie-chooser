import MovieCard from './MovieCard';

export default function NomineeGrid({ nominees, hasData, category, year }) {
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p className="text-4xl mb-4">🎬</p>
        <p className="text-lg font-medium">No nominees for {year}</p>
        {category?.startYear > year && (
          <p className="text-sm mt-2">
            This category started in {category.startYear}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {nominees.map((nominee) => (
        <MovieCard
          key={nominee.movieId}
          movie={nominee.movie}
          winner={nominee.winner}
          person={nominee.person}
        />
      ))}
    </div>
  );
}
