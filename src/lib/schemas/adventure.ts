import { z } from "zod";

// The base object (no cross-field refine yet) is exported separately so
// callers that don't collect every field up front — the create-adventure
// form doesn't ask the user to type startingLat/startingLng, it gets them
// from the browser at submit time — can .omit() from it without
// re-declaring the shared enums.
export const createAdventureFields = z.object({
  theme: z.string().min(1),
  ageMin: z.number().int().min(1),
  ageMax: z.number().int().min(1),
  durationMinutes: z.union([
    z.literal(30),
    z.literal(60),
    z.literal(90),
    z.literal(120),
  ]),
  maxDistanceMeters: z.union([
    z.literal(500),
    z.literal(1000),
    z.literal(2000),
    z.literal(5000),
  ]),
  startingLat: z.number().min(-90).max(90),
  startingLng: z.number().min(-180).max(180),
});

export const ageRangeRefinement = {
  check: (data: { ageMin: number; ageMax: number }) => data.ageMax >= data.ageMin,
  message: "Maximum age must be greater than or equal to minimum age.",
  path: ["ageMax"],
};

export const createAdventureSchema = createAdventureFields.refine(
  ageRangeRefinement.check,
  ageRangeRefinement,
);

export type CreateAdventure = z.infer<typeof createAdventureSchema>;
