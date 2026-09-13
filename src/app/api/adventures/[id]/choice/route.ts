import { NextResponse } from "next/server";
import { requireUser } from "@/src/services/supabase/utils/require-user";
import { choiceSchema } from "@/src/features/game/choice";
import { AdventureClient } from "@/src/features/adventures/client";
import { MessageClient } from "@/src/features/messages/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, supabase } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const adventureClient = new AdventureClient(supabase);
  const messageClient = new MessageClient(supabase);

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

  const { data: adventure, error: adventureError } =
    await adventureClient.getById(id, user.id);

  if (adventureError) {
    return NextResponse.json(
      { error: adventureError.message },
      { status: 400 },
    );
  }

  if (!adventure) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: messageError } = await messageClient.insert({
    adventureId: id,
    role: "user",
    content: body.data.label,
  });

  if (messageError) {
    return NextResponse.json({ error: messageError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
