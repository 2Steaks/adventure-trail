"use client";

import { use } from "react";
import { useAdventure } from "@/src/lib/adventures/hooks";
import {
  useCheckArrival,
  useEncounter,
  useSendChoice,
} from "@/src/lib/game/hooks";
import { Button } from "@/src/components/ui/button";
import { Wizard, type WizardState } from "@/src/components/game/wizard/Wizard";
import { EncounterPanel } from "@/src/components/game/encounter/EncounterPanel";

export default function AdventureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useAdventure(id);
  const checkArrival = useCheckArrival(id);
  const encounter = useEncounter(id);
  const sendChoice = useSendChoice(id);

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

  const currentQuest = data.quests.find(
    (quest) => quest.id === data.gameState.currentQuestId,
  );
  const arrived =
    checkArrival.data?.arrived ?? currentQuest?.status === "completed";

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

        {!currentQuest ? (
          <p className="mt-4 text-center text-lg font-black uppercase text-primary">
            Adventure Complete!
          </p>
        ) : (
          <div className="mt-4 border-2 border-foreground bg-background p-4">
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
            ) : (
              <>
                {!encounter.data && (
                  <Button
                    className="mt-4 w-full"
                    disabled={encounter.isPending}
                    onClick={() => encounter.mutate()}
                  >
                    {encounter.isPending
                      ? "The wizard is thinking..."
                      : "Talk to the Wizard"}
                  </Button>
                )}

                {encounter.error && (
                  <p className="mt-2 text-sm text-destructive">
                    {encounter.error.message}
                  </p>
                )}

                {encounter.data && (
                  <EncounterPanel
                    output={encounter.data}
                    disabled={sendChoice.isPending}
                    onChoose={(label) => {
                      sendChoice.mutate(label);
                      encounter.reset();
                    }}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
