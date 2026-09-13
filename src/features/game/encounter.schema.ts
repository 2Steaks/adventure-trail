import { z } from "zod";

export const encounterActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("COMPLETE_OBJECTIVE"),
    questId: z.string().min(1),
  }),
  z.object({
    type: z.literal("ADD_ITEM"),
    itemId: z.string().min(1),
  }),
]);

export const encounterOutputSchema = z.object({
  message: z.string().min(1),
  choices: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
    }),
  ),
  actions: z.array(encounterActionSchema),
});

export type EncounterAction = z.infer<typeof encounterActionSchema>;
export type EncounterOutput = z.infer<typeof encounterOutputSchema>;
