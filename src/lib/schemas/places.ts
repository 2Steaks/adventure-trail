import { z } from "zod";

// URLSearchParams.get() returns null for a missing param, or "" for e.g.
// ?lat=. z.coerce.number() turns either into 0 (Number(null) and Number(""))
// rather than failing — so both are normalized to undefined first, letting
// the underlying number check (and .default() for radiusMeters) apply as
// intended.
const blankToUndefined = (value: unknown) => {
  if (value === null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
};

export const nearbyPlacesQuerySchema = z.object({
  lat: z.preprocess(blankToUndefined, z.coerce.number().min(-90).max(90)),
  lng: z.preprocess(blankToUndefined, z.coerce.number().min(-180).max(180)),
  radiusMeters: z.preprocess(
    blankToUndefined,
    z.coerce.number().min(100).max(5000).default(1000),
  ),
});

export type NearbyPlacesQuery = z.infer<typeof nearbyPlacesQuerySchema>;
