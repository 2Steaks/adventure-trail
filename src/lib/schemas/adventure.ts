import { z } from "zod";

export const createAdventureSchema = z
  .object({
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
  })
  .refine((data) => data.ageMax >= data.ageMin, {
    message: "Maximum age must be greater than or equal to minimum age.",
    path: ["ageMax"],
  });

export type CreateAdventure = z.infer<typeof createAdventureSchema>;
