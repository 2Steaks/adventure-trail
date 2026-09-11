import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/supabase/require-user";
import { arrivalCheckSchema } from "@/src/lib/schemas/arrival";
import { checkArrival } from "@/src/lib/game/arrival";

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
    return NextResponse.json({ error: "Invalid location." }, { status: 400 });
  }

  const body = arrivalCheckSchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ error: "Invalid location." }, { status: 400 });
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

  const { data: quest, error: questError } = await supabase
    .from("quests")
    .select("*")
    .eq("adventure_id", id)
    .maybeSingle();

  if (questError) {
    return NextResponse.json({ error: questError.message }, { status: 400 });
  }
  if (!quest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = checkArrival(body.data, {
    latitude: quest.latitude,
    longitude: quest.longitude,
    radiusMeters: quest.radius_meters,
  });

  if (result.arrived && quest.status !== "completed") {
    const { error: questUpdateError } = await supabase
      .from("quests")
      .update({ status: "completed" })
      .eq("id", quest.id);
    if (questUpdateError) {
      return NextResponse.json(
        { error: questUpdateError.message },
        { status: 400 },
      );
    }

    const { error: adventureUpdateError } = await supabase
      .from("adventures")
      .update({ status: "completed" })
      .eq("id", id);
    if (adventureUpdateError) {
      return NextResponse.json(
        { error: adventureUpdateError.message },
        { status: 400 },
      );
    }
  }

  return NextResponse.json(result);
}
