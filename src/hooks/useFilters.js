import { useState, useCallback, useEffect } from 'react';

export function useFilters(defaultCategory = 'bestPicture', defaultYear = 2024) {
  const [category, setCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || defaultCategory;
  });

  const [year, setYear] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const y = parseInt(params.get('year'), 10);
    return isNaN(y) ? defaultYear : y;
  });

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('year', String(year));
    params.set('category', category);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [year, category]);

  const handleYearChange = useCallback((newYear) => {
    setYear(newYear);
  }, []);

  const handleCategoryChange = useCallback((newCategory) => {
    setCategory(newCategory);
  }, []);

  return {
    year,
    category,
    setYear: handleYearChange,
    setCategory: handleCategoryChange,
  };
}
