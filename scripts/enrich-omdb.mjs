import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const OMDB_API = 'https://www.omdbapi.com/';
const RAW_PATH = 'data/raw/nominees-raw.json';
const CACHE_PATH = 'data/raw/omdb-cache.json';
const API_KEY = process.env.OMDB_API_KEY;

if (!API_KEY) {
  console.error('Missing OMDB_API_KEY in .env.local');
  console.error('Get a free key at https://www.omdbapi.com/apikey.aspx');
  process.exit(1);
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function loadCache() {
  if (existsSync(CACHE_PATH)) {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
  }
  return {};
}

function saveCache(cache) {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

async function fetchOmdb(title, year) {
  const params = new URLSearchParams({
    apikey: API_KEY,
    t: title,
    y: String(year),
    plot: 'short',
  });

  const resp = await fetch(`${OMDB_API}?${params}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

async function main() {
  mkdirSync('data/raw', { recursive: true });

  if (!existsSync(RAW_PATH)) {
    console.error(`Missing ${RAW_PATH} - run npm run data:scrape first`);
    process.exit(1);
  }

  const rawData = JSON.parse(readFileSync(RAW_PATH, 'utf-8'));
  const cache = loadCache();

  // Collect unique movies across all categories
  const uniqueMovies = new Map(); // key: "slug::year" -> { title, year }
  for (const [catKey, category] of Object.entries(rawData)) {
    for (const [yearStr, yearData] of Object.entries(category.years)) {
      const year = parseInt(yearStr, 10);
      for (const nominee of yearData.nominees) {
        const slug = slugify(nominee.film);
        const movieId = `${slug}::${year}`;
        if (!uniqueMovies.has(movieId)) {
          uniqueMovies.set(movieId, { title: nominee.film, year });
        }
      }
    }
  }

  console.log(`Found ${uniqueMovies.size} unique movies across all categories`);

  // Filter out already cached
  const toFetch = [];
  for (const [movieId, movie] of uniqueMovies) {
    if (!cache[movieId]) {
      toFetch.push({ movieId, ...movie });
    }
  }

  console.log(`Already cached: ${uniqueMovies.size - toFetch.length}`);
  console.log(`Need to fetch: ${toFetch.length}`);

  if (toFetch.length === 0) {
    console.log('All movies already cached!');
    return;
  }

  let fetched = 0;
  let errors = 0;
  let notFound = 0;

  for (const movie of toFetch) {
    try {
      const data = await fetchOmdb(movie.title, movie.year);

      if (data.Response === 'True') {
        cache[movie.movieId] = {
          title: data.Title,
          year: data.Year,
          poster: data.Poster !== 'N/A' ? data.Poster : null,
          plot: data.Plot !== 'N/A' ? data.Plot : null,
          imdbRating: data.imdbRating !== 'N/A' ? data.imdbRating : null,
          imdbID: data.imdbID,
          genre: data.Genre !== 'N/A' ? data.Genre : null,
          director: data.Director !== 'N/A' ? data.Director : null,
          runtime: data.Runtime !== 'N/A' ? data.Runtime : null,
        };
        fetched++;
      } else {
        // Try without year constraint
        const data2 = await fetchOmdb(movie.title, '');
        if (data2.Response === 'True') {
          cache[movie.movieId] = {
            title: data2.Title,
            year: data2.Year,
            poster: data2.Poster !== 'N/A' ? data2.Poster : null,
            plot: data2.Plot !== 'N/A' ? data2.Plot : null,
            imdbRating: data2.imdbRating !== 'N/A' ? data2.imdbRating : null,
            imdbID: data2.imdbID,
            genre: data2.Genre !== 'N/A' ? data2.Genre : null,
            director: data2.Director !== 'N/A' ? data2.Director : null,
            runtime: data2.Runtime !== 'N/A' ? data2.Runtime : null,
          };
          fetched++;
        } else {
          cache[movie.movieId] = { title: movie.title, year: movie.year, notFound: true };
          notFound++;
        }
      }

      // Save cache periodically
      if ((fetched + notFound) % 50 === 0) {
        saveCache(cache);
        console.log(`  Progress: ${fetched + notFound + errors}/${toFetch.length} (${fetched} found, ${notFound} not found, ${errors} errors)`);
      }

      // Rate limiting: ~10 req/sec for free tier
      await new Promise(r => setTimeout(r, 120));
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('402')) {
        console.error(`\nAPI key issue or rate limit hit after ${fetched} requests.`);
        console.error('Saving cache and exiting. Re-run to continue.');
        saveCache(cache);
        process.exit(1);
      }
      console.error(`  Error fetching "${movie.title}" (${movie.year}): ${err.message}`);
      cache[movie.movieId] = { title: movie.title, year: movie.year, notFound: true };
      errors++;
    }
  }

  saveCache(cache);
  console.log(`\nDone! Fetched: ${fetched}, Not found: ${notFound}, Errors: ${errors}`);
  console.log(`Total cached: ${Object.keys(cache).length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
