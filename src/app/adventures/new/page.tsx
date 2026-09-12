"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAdventure } from "@/src/lib/adventures/hooks";
import { getCurrentPosition } from "@/src/lib/geo/geolocation";
import {
  createAdventureFields,
  ageRangeRefinement,
  type CreateAdventure,
} from "@/src/lib/schemas/adventure";
import { Button } from "@/src/components/ui/button";
import { ErrorState } from "@/src/components/ui/status";

type AdventureFormFields = Omit<
  CreateAdventure,
  "startingLat" | "startingLng"
>;

const adventureFormSchema = createAdventureFields
  .omit({ startingLat: true, startingLng: true })
  .refine(ageRangeRefinement.check, ageRangeRefinement);

export default function NewAdventurePage() {
  const router = useRouter();
  const createAdventure = useCreateAdventure();
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdventureFormFields>({
    resolver: zodResolver(adventureFormSchema),
    defaultValues: {
      durationMinutes: 60,
      maxDistanceMeters: 1000,
    },
  });

  const onSubmit = async (data: AdventureFormFields) => {
    setLocationError(null);
    setIsLocating(true);

    let position;
    try {
      position = await getCurrentPosition();
    } catch (error) {
      setLocationError(
        error instanceof Error ? error.message : "Couldn't get your location.",
      );
      setIsLocating(false);
      return;
    }
    
    setIsLocating(false);

    createAdventure.mutate(
      {
        ...data,
        startingLat: position.coords.latitude,
        startingLng: position.coords.longitude,
      },
      {
        onSuccess: (response) =>
          router.push(`/adventures/${response.adventure.id}`),
      },
    );
  };

  const isSubmitting = isLocating || createAdventure.isPending;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm border-4 border-foreground bg-card p-6 text-left"
      >
        <h1 className="text-2xl font-black uppercase tracking-wide">
          Create Adventure
        </h1>

        <label className="mt-4 block text-sm font-bold uppercase" htmlFor="theme">
          Theme
        </label>
        <input
          id="theme"
          type="text"
          {...register("theme")}
          className="mt-1 min-h-11 w-full border-2 border-foreground bg-background p-2"
        />
        {errors.theme && (
          <p className="mt-1 text-sm text-destructive">{errors.theme.message}</p>
        )}

        <div className="mt-4 flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold uppercase" htmlFor="ageMin">
              Min age
            </label>
            <input
              id="ageMin"
              type="number"
              {...register("ageMin", { valueAsNumber: true })}
              className="mt-1 min-h-11 w-full border-2 border-foreground bg-background p-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold uppercase" htmlFor="ageMax">
              Max age
            </label>
            <input
              id="ageMax"
              type="number"
              {...register("ageMax", { valueAsNumber: true })}
              className="mt-1 min-h-11 w-full border-2 border-foreground bg-background p-2"
            />
          </div>
        </div>
        {(errors.ageMin || errors.ageMax) && (
          <p className="mt-1 text-sm text-destructive">
            {errors.ageMin?.message ?? errors.ageMax?.message}
          </p>
        )}

        <label
          className="mt-4 block text-sm font-bold uppercase"
          htmlFor="durationMinutes"
        >
          Duration
        </label>
        <select
          id="durationMinutes"
          {...register("durationMinutes", { valueAsNumber: true })}
          className="mt-1 min-h-11 w-full border-2 border-foreground bg-background p-2"
        >
          <option value={30}>30 min</option>
          <option value={60}>60 min</option>
          <option value={90}>90 min</option>
          <option value={120}>120 min</option>
        </select>

        <label
          className="mt-4 block text-sm font-bold uppercase"
          htmlFor="maxDistanceMeters"
        >
          Max walking distance
        </label>
        <select
          id="maxDistanceMeters"
          {...register("maxDistanceMeters", { valueAsNumber: true })}
          className="mt-1 min-h-11 w-full border-2 border-foreground bg-background p-2"
        >
          <option value={500}>500 m</option>
          <option value={1000}>1 km</option>
          <option value={2000}>2 km</option>
          <option value={5000}>5 km</option>
        </select>

        {locationError && (
          <div className="mt-4">
            <ErrorState message={locationError} />
          </div>
        )}
        {createAdventure.error && (
          // No onRetry: there's nothing to retry yet, only the form's own
          // "Create Adventure" button below re-submits — a "Try again"
          // button here would just clear the message without resubmitting.
          <div className="mt-4">
            <ErrorState message={createAdventure.error.message} />
          </div>
        )}

        <Button type="submit" className="mt-6 w-full" disabled={isSubmitting}>
          {isLocating
            ? "Getting your location..."
            : createAdventure.isPending
              ? "Planning your adventure..."
              : "Create Adventure"}
        </Button>
      </form>
    </main>
  );
}
