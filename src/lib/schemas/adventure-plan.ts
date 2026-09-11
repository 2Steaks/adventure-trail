import { z } from "zod";

export const adventurePlanSchema = z.object({
  title: z.string().min(1),
  quests: z
    .array(
      z.object({
        locationId: z.string().min(1),
        objective: z.string().min(1),
        type: z.enum(["riddle", "exploration", "discovery"]),
      }),
    )
    .min(1),
});

export type AdventurePlan = z.infer<typeof adventurePlanSchema>;
