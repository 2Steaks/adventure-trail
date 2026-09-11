import { z } from "zod";

// URLSearchParams.get() returns null (not undefined) for a missing param,
// and z.coerce.number() coerces null to 0 rather than failing — so null is
// normalized to undefined first, letting the underlying number check (and
// .default() for radiusMeters) apply as intended.
const nullToUndefined = (value: unknown) => (value === null ? undefined : value);

export const nearbyPlacesQuerySchema = z.object({
  lat: z.preprocess(nullToUndefined, z.coerce.number().min(-90).max(90)),
  lng: z.preprocess(nullToUndefined, z.coerce.number().min(-180).max(180)),
  radiusMeters: z.preprocess(
    nullToUndefined,
    z.coerce.number().min(100).max(5000).default(1000),
  ),
});

export type NearbyPlacesQuery = z.infer<typeof nearbyPlacesQuerySchema>;
