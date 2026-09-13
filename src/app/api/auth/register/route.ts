import { NextResponse } from "next/server";
import { createClient } from "@/src/services/supabase/supabase.client";
import { authCredentialsSchema } from "@/src/features/auth/schema";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 400 },
    );
  }

  const body = authCredentialsSchema.safeParse(json);

  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(body.data);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
