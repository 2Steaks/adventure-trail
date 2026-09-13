import { createClient } from "../supabase.client";

export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { user: null, supabase } as const;
  }

  return { user: data.user, supabase } as const;
}
