import { load } from 'cheerio';
import { writeFileSync, mkdirSync } from 'fs';
import { CATEGORIES, MEDIAWIKI_API, MIN_YEAR, MAX_YEAR } from './config.mjs';

const OUTPUT_PATH = 'data/raw/nominees-raw.json';

async function fetchPageHtml(pageName, retries = 3) {
  const url = `${MEDIAWIKI_API}?action=parse&page=${encodeURIComponent(pageName)}&format=json&prop=text`;
  console.log(`  Fetching: ${pageName}`);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'OscarMovieChooser/1.0 (educational project)',
        },
      });
      if (resp.status === 429) {
        const wait = attempt * 5000;
        console.log(`  Rate limited, waiting ${wait / 1000}s (attempt ${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${pageName}`);
      const data = await resp.json();
      if (data.error) throw new Error(`API error: ${data.error.info}`);
      return data.parse.text['*'];
    } catch (err) {
      if (attempt === retries) throw err;
      const wait = attempt * 3000;
      console.log(`  Fetch failed, retrying in ${wait / 1000}s (attempt ${attempt}/${retries}): ${err.message}`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

function isWinnerRow(tr, $) {
  // Check tr-level background
  const trStyle = $(tr).attr('style') || '';
  if (trStyle.includes('FAEB86') || trStyle.includes('B0C4DE')) return true;
  // Check td-level background (Best Actor style, International Feature uses B0C4DE)
  const tds = $(tr).find('td');
  for (const td of tds) {
    const tdStyle = $(td).attr('style') || '';
    if (tdStyle.includes('FAEB86') || tdStyle.includes('B0C4DE')) return true;
  }
  return false;
}

function extractYear(th, $) {
  // Year cell contains a link like "2020" or "2020/21"
  // Extract the first 4-digit number
  const text = $(th).text();
  const match = text.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? parseInt(match[1], 10) : null;
}

function extractFilmTitle(td, $) {
  // Film titles are in <i> tags, get the text from the first <i>
  const italic = $(td).find('i').first();
  if (italic.length) {
    return italic.text().trim();
  }
  // Fallback: just get text
  return $(td).text().trim().split('\n')[0];
}

function extractPersonName(td, $) {
  // Person name: get text from the first link or the full text
  const link = $(td).find('a').first();
  if (link.length) {
    return link.text().trim();
  }
  return $(td).text().trim().replace(/[†‡§]+/g, '').trim();
}

function scrapeFilmCategory(html, categoryKey, config) {
  const $ = load(html);
  const years = {};

  // Find all wikitables
  const tables = $('table.wikitable');

  for (const table of tables) {
    const rows = $(table).find('tr');
    let currentYear = null;
    let rowsInYear = 0;
    let rowspanRemaining = 0;

    for (const row of rows) {
      const ths = $(row).find('th');
      const tds = $(row).find('td');

      // Check if this row has a year header with rowspan
      let yearTh = null;
      for (const th of ths) {
        const rs = parseInt($(th).attr('rowspan'), 10);
        if (rs > 1) {
          const year = extractYear(th, $);
          if (year && year >= MIN_YEAR && year <= MAX_YEAR) {
            currentYear = year;
            rowspanRemaining = rs;
            yearTh = th;
            break;
          } else if (year) {
            // Year outside range - skip
            currentYear = year;
            rowspanRemaining = rs;
            yearTh = th;
          }
        }
      }

      if (rowspanRemaining > 0) {
        rowspanRemaining--;
      }

      // Skip if year is outside range
      if (!currentYear || currentYear < MIN_YEAR || currentYear > MAX_YEAR) continue;

      // Skip header rows (no td cells)
      if (tds.length === 0) continue;

      const winner = isWinnerRow(row, $);

      // For film-type categories: Film title is typically in first or second td
      let filmTitle = null;
      let person = null;

      if (config.type === 'person') {
        // Person categories: columns vary but pattern is Person, [Role,] Film
        // The row with the year th has fewer visible tds
        const tdArray = tds.toArray();
        if (yearTh || rowsInYear === 0) {
          // Row with year header - tds don't include the year column
          if (tdArray.length >= 3) {
            // Actor, Role, Film [, Ref]
            person = extractPersonName($(tdArray[0]), $);
            filmTitle = extractFilmTitle($(tdArray[2]), $);
          } else if (tdArray.length >= 2) {
            // Director-style: Person, Film
            person = extractPersonName($(tdArray[0]), $);
            filmTitle = extractFilmTitle($(tdArray[1]), $);
          }
        } else {
          if (tdArray.length >= 3) {
            person = extractPersonName($(tdArray[0]), $);
            filmTitle = extractFilmTitle($(tdArray[2]), $);
          } else if (tdArray.length >= 2) {
            person = extractPersonName($(tdArray[0]), $);
            filmTitle = extractFilmTitle($(tdArray[1]), $);
          }
        }
      } else {
        // Film categories: Film is typically first td with <i>
        const tdArray = tds.toArray();
        for (const td of tdArray) {
          const italic = $(td).find('i').first();
          if (italic.length) {
            filmTitle = italic.text().trim();
            break;
          }
        }
        if (!filmTitle && tdArray.length > 0) {
          filmTitle = extractFilmTitle($(tdArray[0]), $);
        }
      }

      if (!filmTitle || filmTitle.length === 0) continue;

      // Clean up film title
      filmTitle = filmTitle.replace(/\s*\(.*?\)\s*$/, '').trim();

      if (!years[currentYear]) {
        years[currentYear] = { nominees: [] };
      }

      const nominee = { film: filmTitle, winner };
      if (person) nominee.person = person;
      years[currentYear].nominees.push(nominee);
    }
  }

  // Deduplicate nominees within each year (same film appearing multiple times)
  for (const year of Object.keys(years)) {
    const seen = new Set();
    years[year].nominees = years[year].nominees.filter(n => {
      const key = `${n.film}::${n.person || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return years;
}

async function main() {
  mkdirSync('data/raw', { recursive: true });
  const result = {};

  for (const [key, config] of Object.entries(CATEGORIES)) {
    console.log(`\nScraping: ${config.name}`);
    try {
      const html = await fetchPageHtml(config.page);
      const years = scrapeFilmCategory(html, key, config);

      const yearCount = Object.keys(years).length;
      const nomineeCount = Object.values(years).reduce((sum, y) => sum + y.nominees.length, 0);
      console.log(`  Found ${yearCount} years, ${nomineeCount} nominees`);

      result[key] = {
        name: config.name,
        startYear: config.startYear,
        type: config.type,
        years,
      };

      // Be polite to Wikipedia
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`  ERROR scraping ${config.name}: ${err.message}`);
    }
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
  console.log(`\nWrote ${OUTPUT_PATH}`);

  // Print summary
  console.log('\nSummary:');
  for (const [key, data] of Object.entries(result)) {
    const years = Object.keys(data.years).length;
    const nominees = Object.values(data.years).reduce((sum, y) => sum + y.nominees.length, 0);
    const winners = Object.values(data.years).reduce(
      (sum, y) => sum + y.nominees.filter(n => n.winner).length, 0
    );
    console.log(`  ${data.name}: ${years} years, ${nominees} nominees, ${winners} winners`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
