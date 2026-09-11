import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/supabase/require-user";
import { choiceSchema } from "@/src/lib/schemas/choice";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, supabase } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid choice." }, { status: 400 });
  }

  const body = choiceSchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ error: "Invalid choice." }, { status: 400 });
  }

  const { data: adventure, error: adventureError } = await supabase
    .from("adventures")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (adventureError) {
    return NextResponse.json(
      { error: adventureError.message },
      { status: 400 },
    );
  }

  if (!adventure) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: messageError } = await supabase.from("messages").insert({
    adventure_id: id,
    role: "user",
    content: body.data.label,
  });

  if (messageError) {
    return NextResponse.json({ error: messageError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
