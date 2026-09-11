import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/client";
import { authCredentialsSchema } from "@/src/lib/schemas/auth";

export async function POST(request: Request) {
  const body = authCredentialsSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(body.data);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
