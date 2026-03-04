import { useMemo } from 'react';
import oscarData from '../../data/oscar-data.json';

export function useOscarData() {
  const data = useMemo(() => {
    const { movies, categories, meta } = oscarData;

    // Build category list for tabs
    const categoryList = Object.entries(categories).map(([key, cat]) => ({
      key,
      name: cat.name,
      startYear: cat.startYear,
    }));

    return { movies, categories, meta, categoryList };
  }, []);

  return data;
}

export function useNominees(categoryKey, year, categories, movies) {
  return useMemo(() => {
    const category = categories[categoryKey];
    if (!category) return { nominees: [], hasData: false };

    const yearData = category.years[String(year)];
    if (!yearData) return { nominees: [], hasData: false };

    const nominees = yearData.nominees.map(n => ({
      ...n,
      movie: movies[n.movieId] || { title: n.movieId.split('::')[0].replace(/-/g, ' ') },
    }));

    // Sort: winner first
    nominees.sort((a, b) => (b.winner ? 1 : 0) - (a.winner ? 1 : 0));

    return { nominees, hasData: true };
  }, [categoryKey, year, categories, movies]);
}
