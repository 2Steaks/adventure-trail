"use client";

import { use, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Wizard } from "@/src/components/game/wizard/Wizard";
import { EncounterPanel } from "@/src/components/game/encounter/EncounterPanel";
import { LoadingState, ErrorState } from "@/src/components/ui/status";
import {
  useAdventure,
  useShowCelebration,
} from "@/src/features/adventures/hooks";
import {
  useCheckArrival,
  useEncounter,
  useSendChoice,
} from "@/src/features/game/hooks";
import {
  getCurrentQuest,
  getMapUrl,
  getWizardState,
} from "@/src/features/adventures/utils";

interface AdventureDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdventureDetailPage({
  params,
}: AdventureDetailPageProps) {
  const { id } = use(params);
  const { data, isLoading, error, refetch } = useAdventure(id);
  const checkArrival = useCheckArrival(id);
  const encounter = useEncounter(id);
  const sendChoice = useSendChoice(id);

  const currentQuest = getCurrentQuest(data);
  const arrived =
    checkArrival.data?.arrived ?? currentQuest?.status === "completed";

  useEffect(() => {
    checkArrival.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuest?.id]);

  const showCelebration = useShowCelebration(arrived);

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <LoadingState label="Loading adventure..." />
      </main>
    );
  }

  if (error || !data) {
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

  const wizardState = getWizardState(encounter, arrived);
  const mapsUrl = getMapUrl(currentQuest);
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
