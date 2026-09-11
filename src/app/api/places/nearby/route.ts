import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/supabase/require-user";
import { nearbyPlacesQuerySchema } from "@/src/lib/schemas/places";
import {
  fetchNearbyPlaces,
  NearbyPlacesFetchError,
} from "@/src/lib/places/fetch-nearby-places";

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
    return NextResponse.json(
      { error: "Invalid coordinates." },
      { status: 400 },
    );
  }

  try {
    const places = await fetchNearbyPlaces(query.data);
    return NextResponse.json({ places });
  } catch (error) {
    if (error instanceof NearbyPlacesFetchError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    throw error;
  }
}
