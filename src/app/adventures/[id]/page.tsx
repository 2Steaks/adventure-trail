"use client";

import { use, useEffect, useRef, useState } from "react";
import { useAdventure } from "@/src/lib/adventures/hooks";
import {
  useCheckArrival,
  useEncounter,
  useSendChoice,
} from "@/src/lib/game/hooks";
import { Button } from "@/src/components/ui/button";
import { Wizard, type WizardState } from "@/src/components/game/wizard/Wizard";
import { EncounterPanel } from "@/src/components/game/encounter/EncounterPanel";
import { LoadingState, ErrorState } from "@/src/components/ui/status";

export default function AdventureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error, refetch } = useAdventure(id);
  const checkArrival = useCheckArrival(id);
  const encounter = useEncounter(id);
  const sendChoice = useSendChoice(id);

  const currentQuestId = data?.gameState.currentQuestId;
  const currentQuest = data?.quests.find((quest) => quest.id === currentQuestId);
  const arrived =
    checkArrival.data?.arrived ?? currentQuest?.status === "completed";

  // The current quest advances server-side (via useEncounter's query
  // invalidation) as soon as an encounter completes an objective — reset
  // the *previous* quest's distance-check result so "arrived" doesn't
  // stay stuck true for the next, different landmark.
  useEffect(() => {
    checkArrival.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestId]);

  // Celebrate only the *transition* into arrived, not an already-arrived
  // quest. `checkArrival`'s mutation state isn't persisted, so a reload
  // always starts `arrived` at false (or true only via the `status ===
  // "completed"` fallback, which can't happen for the *current* quest —
  // completing a quest always advances current_quest_id in the same
  // transaction) — either way, wasArrivedRef starts fresh each mount, so
  // this can never re-fire for a quest arrived at before the reload.
  const [showCelebration, setShowCelebration] = useState(false);
  const wasArrivedRef = useRef(arrived);
  useEffect(() => {
    const wasArrived = wasArrivedRef.current;
    wasArrivedRef.current = arrived;
    if (arrived && !wasArrived) {
      setShowCelebration(true);
      const timeout = setTimeout(() => setShowCelebration(false), 1600);
      return () => clearTimeout(timeout);
    }
  }, [arrived]);

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <LoadingState label="Loading adventure..." />
      </main>
    );
  }

  if (error || !data) {
    // "Not found" is a hard failure (the API's literal message for a 404) —
    // retrying the same request can't fix a missing/not-yours adventure,
    // unlike a transient network/server error.
    const isNotFound = error?.message === "Not found";
    return (
      <main className="flex w-full flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <ErrorState
            message={error?.message ?? "Adventure not found."}
            onRetry={error && !isNotFound ? () => refetch() : undefined}
          />
        </div>
      </main>
    );
  }

  let wizardState: WizardState = "idle";
  if (encounter.isPending) {
    wizardState = "thinking";
  } else if (encounter.isError) {
    wizardState = "unexpected-event";
  } else if (encounter.data) {
    wizardState = encounter.data.actions.some(
      (action) => action.type === "COMPLETE_OBJECTIVE",
    )
      ? "quest-completed"
      : "waiting";
  } else if (arrived) {
    wizardState = "quest-available";
  }

  const mapsUrl = currentQuest
    ? `https://www.google.com/maps/dir/?api=1&destination=${currentQuest.latitude},${currentQuest.longitude}`
    : undefined;

  // An unread encounter result (including the adventure's final "The End"
  // message) stays visible even after the server-side quest position has
  // already advanced past it — only dismissing it (a choice tap or
  // Continue) can reveal "Adventure Complete!" or the next quest's card.
  const adventureFinished = !currentQuest && !encounter.data;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="w-full max-w-sm border-4 border-foreground bg-card p-6 text-left">
        <h1 className="text-2xl font-black uppercase tracking-wide">
          {data.adventure.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.adventure.status}
        </p>

        <div className="mt-4 flex justify-center">
          <Wizard state={wizardState} />
        </div>

        {showCelebration && (
          <p
            role="status"
            className="mt-2 text-center text-sm font-black uppercase text-primary motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in"
          >
            You made it!
          </p>
        )}

        {adventureFinished ? (
          <p
            key="finished"
            className="mt-4 text-center text-lg font-black uppercase text-primary motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
          >
            Adventure Complete!
          </p>
        ) : (
          <>
            {currentQuest && (
              <div
                key={currentQuest.id}
                className="mt-4 border-2 border-foreground bg-background p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
              >
                <p className="text-sm font-bold uppercase">
                  {currentQuest.landmarkName}
                </p>
                <p className="mt-1 text-sm">{currentQuest.objective}</p>
                <p className="mt-2 text-xs uppercase text-muted-foreground">
                  {currentQuest.status}
                </p>

                {!arrived ? (
                  <>
                    {mapsUrl && (
                      <a href={mapsUrl} target="_blank" rel="noreferrer">
                        <Button variant="outline" className="mt-4 w-full">
                          Open Map
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
                      <div className="mt-2">
                        <ErrorState
                          message={checkArrival.error.message}
                          onRetry={() => checkArrival.mutate()}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  !encounter.data && (
                    <Button
                      className="mt-4 w-full"
                      disabled={encounter.isPending}
                      onClick={() => encounter.mutate()}
                    >
                      {encounter.isPending
                        ? "The wizard is thinking..."
                        : "Talk to the Wizard"}
                    </Button>
                  )
                )}

                {encounter.error && (
                  <div className="mt-2">
                    <ErrorState
                      message={encounter.error.message}
                      onRetry={() => encounter.mutate()}
                    />
                  </div>
                )}
              </div>
            )}

            {encounter.data && (
              <EncounterPanel
                output={encounter.data}
                disabled={sendChoice.isPending}
                onChoose={(label) =>
                  sendChoice.mutate(label, {
                    onSuccess: () => encounter.reset(),
                  })
                }
                onContinue={() => encounter.reset()}
              />
            )}

            {sendChoice.error && (
              <div className="mt-2">
                <ErrorState
                  message={sendChoice.error.message}
                  onRetry={
                    sendChoice.variables
                      ? () => sendChoice.mutate(sendChoice.variables)
                      : undefined
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
