import { z } from "zod";

export const choiceSchema = z.object({
  label: z.string().min(1),
});

export type Choice = z.infer<typeof choiceSchema>;
