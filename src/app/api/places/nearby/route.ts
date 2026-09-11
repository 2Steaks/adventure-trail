import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/supabase/require-user";
import { nearbyPlacesQuerySchema } from "@/src/lib/schemas/places";
import { rankPlaces, type OverpassElement } from "@/src/lib/places/rank";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export async function GET(request: Request) {
  const { user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = nearbyPlacesQuerySchema.safeParse({
    lat: searchParams.get("lat"),
    lng: searchParams.get("lng"),
    radiusMeters: searchParams.get("radiusMeters"),
  });
  if (!query.success) {
    return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });
  }

  const { lat, lng, radiusMeters } = query.data;
  const overpassQuery = `[out:json][timeout:25];(node["tourism"~"attraction|museum|artwork|viewpoint"](around:${radiusMeters},${lat},${lng});node["historic"](around:${radiusMeters},${lat},${lng});way["tourism"~"attraction|museum|artwork|viewpoint"](around:${radiusMeters},${lat},${lng});way["historic"](around:${radiusMeters},${lat},${lng}););out center;`;

  let response: Response;
  try {
    response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        // Overpass's server rejects requests with no User-Agent (406),
        // and fetch() sends none by default (unlike curl).
        "User-Agent": "dungeon-master-ai/0.1 (places module)",
      },
      body: overpassQuery,
    });
  } catch {
    return NextResponse.json(
      { error: "Couldn't find nearby landmarks. Try again." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: "Couldn't find nearby landmarks. Try again." },
      { status: 502 },
    );
  }

  const { elements } = (await response.json()) as {
    elements: OverpassElement[];
  };
  const places = rankPlaces({ latitude: lat, longitude: lng }, elements);

  return NextResponse.json({ places });
}
