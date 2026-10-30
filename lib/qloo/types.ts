export type Ent = {
  id: string; name: string; type: string;
  affinity?: number; popularity?: number; image?: string; tags?: string[]; why?: string; because?: string;
};
export type InsightOpts = {
  type: string;                 // entity type short name, e.g. "artist"
  signal?: string[];            // entity ids
  city?: string;                // filter.location.query (places)
  candidates?: string[];        // filter.results.entities
  exclude?: string[];
  take?: number;
  explain?: boolean;
  popularity?: { min?: number; max?: number };
};
