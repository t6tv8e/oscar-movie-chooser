import { readFileSync, writeFileSync, existsSync } from 'fs';

const RAW_PATH = 'data/raw/nominees-raw.json';
const CACHE_PATH = 'data/raw/omdb-cache.json';
const OUTPUT_PATH = 'data/oscar-data.json';

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function main() {
  if (!existsSync(RAW_PATH)) {
    console.error(`Missing ${RAW_PATH} - run npm run data:scrape first`);
    process.exit(1);
  }

  const rawData = JSON.parse(readFileSync(RAW_PATH, 'utf-8'));
  const cache = existsSync(CACHE_PATH)
    ? JSON.parse(readFileSync(CACHE_PATH, 'utf-8'))
    : {};

  const movies = {};
  const categories = {};
  let minYear = 9999;
  let maxYear = 0;

  for (const [catKey, category] of Object.entries(rawData)) {
    const catData = {
      name: category.name,
      startYear: category.startYear,
      years: {},
    };

    for (const [yearStr, yearData] of Object.entries(category.years)) {
      const year = parseInt(yearStr, 10);
      if (year < minYear) minYear = year;
      if (year > maxYear) maxYear = year;

      const nominees = [];
      for (const nominee of yearData.nominees) {
        const slug = slugify(nominee.film);
        const movieId = `${slug}::${year}`;

        // Build movie entry from cache + raw data
        if (!movies[movieId]) {
          const omdb = cache[movieId] || {};
          movies[movieId] = {
            title: omdb.title || nominee.film,
            year: omdb.year || String(year),
            poster: omdb.poster || null,
            plot: omdb.plot || null,
            imdbRating: omdb.imdbRating || null,
            imdbID: omdb.imdbID || null,
            genre: omdb.genre || null,
            director: omdb.director || null,
            runtime: omdb.runtime || null,
          };
        }

        const entry = { movieId, winner: nominee.winner };
        if (nominee.person) entry.person = nominee.person;
        nominees.push(entry);
      }

      catData.years[yearStr] = { nominees };
    }

    categories[catKey] = catData;
  }

  const totalMovies = Object.keys(movies).length;
  const withPosters = Object.values(movies).filter(m => m.poster).length;
  const withRatings = Object.values(movies).filter(m => m.imdbRating).length;

  const output = {
    meta: {
      yearRange: [minYear, maxYear],
      totalMovies,
      generatedAt: new Date().toISOString(),
    },
    movies,
    categories,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`  Movies: ${totalMovies}`);
  console.log(`  With posters: ${withPosters}`);
  console.log(`  With IMDB ratings: ${withRatings}`);
  console.log(`  Categories: ${Object.keys(categories).length}`);
  console.log(`  Year range: ${minYear}-${maxYear}`);
}

main();
