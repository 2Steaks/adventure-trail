"use client";

import { use } from "react";
import { useAdventure } from "@/src/lib/adventures/hooks";

export default function AdventureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useAdventure(id);

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
          </div>
        )}
      </div>
    </main>
  );
}
