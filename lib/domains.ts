export const DOMAINS = ['music', 'film_tv', 'dining', 'brands', 'books', 'podcasts', 'games', 'travel'] as const;
export type Domain = (typeof DOMAINS)[number];

export const DOMAIN_META: Record<Domain, { label: string; types: string[]; stamp: string }> = {
  music: { label: 'Music', types: ['artist'], stamp: '♪' },
  film_tv: { label: 'Film & TV', types: ['movie', 'tv_show'], stamp: '▶' },
  dining: { label: 'Dining', types: ['place'], stamp: '◐' },
  brands: { label: 'Brands', types: ['brand'], stamp: '◆' },
  books: { label: 'Books', types: ['book'], stamp: '❡' },
  podcasts: { label: 'Podcasts', types: ['podcast'], stamp: '◉' },
  games: { label: 'Games', types: ['video_game'], stamp: '✜' },
  travel: { label: 'Travel', types: ['destination'], stamp: '✈' },
};
export const ENTITY_TYPES = ['artist', 'movie', 'tv_show', 'place', 'brand', 'book', 'podcast', 'video_game', 'destination'] as const;
export const TYPE_LABEL: Record<string, string> = {
  artist: 'Music', movie: 'Film', tv_show: 'TV', place: 'Dining', brand: 'Brand', book: 'Book',
  podcast: 'Podcast', video_game: 'Game', destination: 'Travel', person: 'Person',
};
export function domainOfType(type: string): Domain {
  return (DOMAINS.find((d) => DOMAIN_META[d].types.includes(type)) ?? 'music') as Domain;
}
export const SCOPES = [...DOMAINS.map((d) => `taste:${d}`), 'taste:summary'];
export const SCOPE_LABEL: Record<string, string> = {
  'taste:summary': 'Taste summary (archetype & taste DNA)',
  ...Object.fromEntries(DOMAINS.map((d) => [`taste:${d}`, `${DOMAIN_META[d].label} taste`])),
};
export function validScopes(s: string[]) { return s.filter((x) => SCOPES.includes(x)); }
