/** Plain-language label for a 0-10 self-rating, used by module before/after sliders. */
export function intensityLabel(v: number): string {
  if (v <= 1) return "Barely";
  if (v <= 3) return "A little";
  if (v <= 6) return "Moderate";
  if (v <= 8) return "High";
  return "Very high";
}
