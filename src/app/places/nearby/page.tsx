"use client";

import { useNearbyPlaces } from "@/src/lib/places/hooks";
import { Button } from "@/src/components/ui/button";

export default function NearbyPlacesPage() {
  const nearbyPlaces = useNearbyPlaces();
  const places = nearbyPlaces.data?.places ?? [];

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-6">
      <div className="w-full max-w-sm border-4 border-foreground bg-card p-6 text-center">
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Nearby Landmarks
        </h1>
        <Button
          className="mt-6 w-full"
          disabled={nearbyPlaces.isPending}
          onClick={() => nearbyPlaces.mutate()}
        >
          {nearbyPlaces.isPending ? "Searching..." : "Find Nearby Landmarks"}
        </Button>
        {nearbyPlaces.error && (
          <p className="mt-4 text-sm text-destructive">
            {nearbyPlaces.error.message}
          </p>
        )}
      </div>

      {places.length > 0 && (
        <ul className="flex w-full max-w-sm flex-col gap-4">
          {places.map((place) => (
            <li
              key={place.id}
              className="border-4 border-foreground bg-card p-4 text-left"
            >
              <p className="font-black uppercase">{place.name}</p>
              <p className="text-sm text-muted-foreground">
                {place.type} &middot; {Math.round(place.distanceMeters)}m away
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
