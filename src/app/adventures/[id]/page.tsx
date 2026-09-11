"use client";

import { use } from "react";
import { useAdventure } from "@/src/lib/adventures/hooks";
import { useCheckArrival } from "@/src/lib/game/hooks";
import { Button } from "@/src/components/ui/button";

export default function AdventureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useAdventure(id);
  const checkArrival = useCheckArrival(id);

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm">Loading...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-destructive">
          {error?.message ?? "Adventure not found."}
        </p>
      </main>
    );
  }

  const quest = data.quests[0];
  const arrived = checkArrival.data?.arrived ?? quest?.status === "completed";
  const mapsUrl = quest
    ? `https://www.google.com/maps/dir/?api=1&destination=${quest.latitude},${quest.longitude}`
    : undefined;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="w-full max-w-sm border-4 border-foreground bg-card p-6 text-left">
        <h1 className="text-2xl font-black uppercase tracking-wide">
          {data.adventure.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.adventure.status}
        </p>

        {quest && (
          <div className="mt-4 border-2 border-foreground bg-background p-4">
            <p className="text-sm font-bold uppercase">{quest.landmarkName}</p>
            <p className="mt-1 text-sm">{quest.objective}</p>
            <p className="mt-2 text-xs uppercase text-muted-foreground">
              {quest.status}
            </p>

            {arrived ? (
              <p className="mt-4 text-center text-lg font-black uppercase text-primary">
                You&apos;ve Arrived!
              </p>
            ) : (
              <>
                {mapsUrl && (
                  <a href={mapsUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="mt-4 w-full">
                      Open in Google Maps
                    </Button>
                  </a>
                )}

                <Button
                  className="mt-3 w-full"
                  disabled={checkArrival.isPending}
                  onClick={() => checkArrival.mutate()}
                >
                  {checkArrival.isPending
                    ? "Checking..."
                    : "Check My Distance"}
                </Button>

                {checkArrival.data && !checkArrival.data.arrived && (
                  <p className="mt-2 text-center text-sm">
                    {Math.round(checkArrival.data.distanceMeters)}m away
                  </p>
                )}

                {checkArrival.error && (
                  <p className="mt-2 text-sm text-destructive">
                    {checkArrival.error.message}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
