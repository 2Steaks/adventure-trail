import { z } from "zod";

export const authCredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
