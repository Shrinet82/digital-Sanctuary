/**
 * Deterministic daily rotation (redesign §13): "hash(date + userId) % bankSize".
 * Not cryptographic — just stable and evenly spread, so the same day + the
 * same person always gets the same pick. Used by the recommender's
 * "surprise me" rule and by the rung-3 journal prompt rotation.
 */
export function seededIndex(seed: string, bankSize: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % bankSize;
}
