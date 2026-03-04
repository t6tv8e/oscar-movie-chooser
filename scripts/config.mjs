// Category definitions and Wikipedia page names for the MediaWiki API
export const CATEGORIES = {
  bestPicture: {
    name: 'Best Picture',
    page: 'Academy_Award_for_Best_Picture',
    startYear: 1975,
    type: 'film', // columns: Year, Film, Producer(s)
  },
  bestDirector: {
    name: 'Best Director',
    page: 'Academy_Award_for_Best_Director',
    startYear: 1975,
    type: 'person', // columns: Year, Director, Film
  },
  bestActor: {
    name: 'Best Actor',
    page: 'Academy_Award_for_Best_Actor',
    startYear: 1975,
    type: 'person', // columns: Year, Actor, Role(s), Film, Ref.
  },
  bestActress: {
    name: 'Best Actress',
    page: 'Academy_Award_for_Best_Actress',
    startYear: 1975,
    type: 'person',
  },
  bestSupportingActor: {
    name: 'Best Supporting Actor',
    page: 'Academy_Award_for_Best_Supporting_Actor',
    startYear: 1975,
    type: 'person',
  },
  bestSupportingActress: {
    name: 'Best Supporting Actress',
    page: 'Academy_Award_for_Best_Supporting_Actress',
    startYear: 1975,
    type: 'person',
  },
  bestAdaptedScreenplay: {
    name: 'Best Adapted Screenplay',
    page: 'Academy_Award_for_Best_Adapted_Screenplay',
    startYear: 1975,
    type: 'film',
  },
  bestOriginalScreenplay: {
    name: 'Best Original Screenplay',
    page: 'Academy_Award_for_Best_Original_Screenplay',
    startYear: 1975,
    type: 'film',
  },
  bestInternationalFeatureFilm: {
    name: 'Best International Feature Film',
    page: 'List_of_Academy_Award_winners_and_nominees_for_Best_International_Feature_Film',
    startYear: 1975,
    type: 'film',
  },
  bestAnimatedFeature: {
    name: 'Best Animated Feature',
    page: 'Academy_Award_for_Best_Animated_Feature',
    startYear: 2001,
    type: 'film',
  },
  bestDocumentaryFeature: {
    name: 'Best Documentary Feature',
    page: 'Academy_Award_for_Best_Documentary_Feature_Film',
    startYear: 1975,
    type: 'film',
  },
};

export const MIN_YEAR = 1975;
export const MAX_YEAR = 2025;

export const MEDIAWIKI_API = 'https://en.wikipedia.org/w/api.php';
export const OMDB_API = 'https://www.omdbapi.com/';
