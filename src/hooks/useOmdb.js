import { useState, useEffect } from 'react';

const OMDB_API_KEY = '5eeb9290';
const CACHE_KEY = 'omdb-cache';

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveCache(cache) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

async function fetchOmdb(title, year) {
  const params = new URLSearchParams({
    apikey: OMDB_API_KEY,
    t: title,
    y: String(year),
    plot: 'short',
  });
  const resp = await fetch(`https://www.omdbapi.com/?${params}`);
  if (!resp.ok) return null;
  const data = await resp.json();
  if (data.Response !== 'True') return null;
  return {
    poster: data.Poster !== 'N/A' ? data.Poster : null,
    plot: data.Plot !== 'N/A' ? data.Plot : null,
    imdbRating: data.imdbRating !== 'N/A' ? data.imdbRating : null,
    imdbID: data.imdbID,
    genre: data.Genre !== 'N/A' ? data.Genre : null,
    director: data.Director !== 'N/A' ? data.Director : null,
    runtime: data.Runtime !== 'N/A' ? data.Runtime : null,
  };
}

export function useOmdb(nominees) {
  const [omdbData, setOmdbData] = useState(() => loadCache());

  useEffect(() => {
    if (!nominees || nominees.length === 0) return;

    let cancelled = false;
    const cache = loadCache();

    async function fetchAll() {
      let updated = false;

      for (const nominee of nominees) {
        if (cancelled) break;
        const { movieId, movie } = nominee;
        if (cache[movieId]) continue;

        const data = await fetchOmdb(movie.title, movie.year);
        if (cancelled) break;

        cache[movieId] = data || { notFound: true };
        updated = true;
      }

      if (updated && !cancelled) {
        saveCache(cache);
        setOmdbData({ ...cache });
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [nominees]);

  return omdbData;
}
