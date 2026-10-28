// Findings from `node scripts/verify-qloo.mjs`. Until a real key has been probed these are the documented defaults.
// Flip a flag to false if the probe shows the endpoint failing; the client then skips it gracefully.
export const CAPS = {
  verified: false,
  searchTypes: ['artist', 'movie', 'tv_show', 'place', 'brand', 'book', 'podcast', 'video_game', 'destination'],
  explainability: true,
  resultsFilter: true,
  tags: true,
  demographics: true,
  heatmap: true,
  trending: false,
  compare: false,
};
