// Verified with `node scripts/verify-qloo.mjs` against the live hackathon API. Game type is `videogame` on the wire (not video_game).
// Flip a flag to false if the probe shows the endpoint failing; the client then skips it gracefully.
export const CAPS = {
  verified: true,
  searchTypes: ['artist', 'movie', 'tv_show', 'place', 'brand', 'book', 'podcast', 'video_game', 'destination'],
  explainability: true,
  resultsFilter: true,
  tags: true,
  demographics: true,
  heatmap: true,
  trending: false, // needs signal + start/end dates; unused,
  compare: true // 200 in probe; unused,
};
