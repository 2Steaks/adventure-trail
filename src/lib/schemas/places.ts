import { z } from "zod";

export const nearbyPlacesQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusMeters: z.coerce.number().min(100).max(5000).default(1000),
});

export type NearbyPlacesQuery = z.infer<typeof nearbyPlacesQuerySchema>;
