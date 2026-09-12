"use client";

import Link from "next/link";
import { useAdventures } from "@/src/lib/adventures/hooks";
import { Button } from "@/src/components/ui/button";
import { LogoutButton } from "@/src/components/auth/logout-button";
import { LoadingState, ErrorState } from "@/src/components/ui/status";

export default function Home() {
  const { data, isLoading, error, refetch } = useAdventures();
  const adventures = data?.adventures ?? [];

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-6">
      <div className="w-full max-w-sm border-4 border-foreground bg-card p-6 text-center">
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Dungeon Master AI
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An AI game master that turns the real world around you into an
          adventure.
        </p>
        <Link href="/adventures/new">
          <Button className="mt-6 w-full">Create Adventure</Button>
        </Link>
      </div>

      <div className="w-full max-w-sm">
        {isLoading && <LoadingState label="Loading adventures..." />}
        {error && (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        )}
        {!isLoading && !error && adventures.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No adventures yet — create one above.
          </p>
        )}
        <ul className="flex flex-col gap-4">
          {adventures.map((adventure) => (
            <li
              key={adventure.id}
              className="border-4 border-foreground bg-card p-4 text-left"
            >
              <p className="font-black uppercase">{adventure.title}</p>
              <p className="text-sm text-muted-foreground">
                {adventure.theme} &middot; Ages {adventure.ageMin}-
                {adventure.ageMax} &middot; {adventure.durationMinutes} min
              </p>
              <p className="mt-1 text-sm">
                {adventure.status} &middot; {adventure.questsCompleted}/
                {adventure.questsTotal} quests complete
              </p>
              <Link href={`/adventures/${adventure.id}`}>
                <Button variant="outline" className="mt-3 w-full">
                  Resume
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full max-w-sm">
        <LogoutButton />
      </div>
    </main>
  );
}
