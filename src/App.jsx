import { useMemo } from 'react';
import { useOscarData, useNominees } from './hooks/useOscarData';
import { useFilters } from './hooks/useFilters';
import { useOmdb } from './hooks/useOmdb';
import FilterBar from './components/FilterBar';
import NomineeGrid from './components/NomineeGrid';
import { Trophy } from 'lucide-react';

function Header() {
  return (
    <header className="px-4 py-6 text-center">
      <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
        <Trophy className="text-gold" size={32} />
        <span>Oscar Movie Chooser</span>
      </h1>
      <p className="text-gray-500 text-sm mt-1">
        Browse Oscar-nominated films from 1975 to present
      </p>
    </header>
  );
}

function Footer() {
  return (
    <footer className="text-center py-8 px-4 text-xs text-gray-600 border-t border-gray-800 mt-8">
      Data sourced from{' '}
      <a href="https://en.wikipedia.org" className="underline hover:text-gray-400" target="_blank" rel="noopener noreferrer">
        Wikipedia
      </a>
      {' '}and{' '}
      <a href="https://www.omdbapi.com/" className="underline hover:text-gray-400" target="_blank" rel="noopener noreferrer">
        OMDB API
      </a>
      . Not affiliated with the Academy of Motion Picture Arts and Sciences.
    </footer>
  );
}

export default function App() {
  const { movies, categories, meta, categoryList } = useOscarData();
  const { year, category, setYear, setCategory } = useFilters('bestPicture', meta.yearRange[1] - 1);

  const currentCategory = categories[category];
  const { nominees, hasData } = useNominees(category, year, categories, movies);
  const omdbData = useOmdb(nominees);

  // Merge OMDB data into nominees
  const enrichedNominees = useMemo(() => {
    return nominees.map(n => {
      const omdb = omdbData[n.movieId];
      if (!omdb || omdb.notFound) return n;
      return { ...n, movie: { ...n.movie, ...omdb } };
    });
  }, [nominees, omdbData]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <FilterBar
        year={year}
        category={category}
        onYearChange={setYear}
        onCategoryChange={setCategory}
        categoryList={categoryList}
        minYear={meta.yearRange[0]}
        maxYear={meta.yearRange[1]}
      />
      <main className="flex-1">
        <NomineeGrid
          nominees={enrichedNominees}
          hasData={hasData}
          category={currentCategory}
          year={year}
        />
      </main>
      <Footer />
    </div>
  );
}
