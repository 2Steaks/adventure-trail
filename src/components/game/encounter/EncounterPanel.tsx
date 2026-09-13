import { Button } from "@/src/components/ui/button";
import { EncounterOutput } from "@/src/features/game/encounter.schema";

export function EncounterPanel({
  output,
  onChoose,
  onContinue,
  disabled,
}: {
  output: EncounterOutput;
  onChoose: (label: string) => void;
  onContinue: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-4 border-2 border-foreground bg-background p-4 text-left">
      <p className="text-sm">{output.message}</p>

      {output.choices.length > 0 ? (
        <div className="mt-3 flex flex-col gap-3">
          {output.choices.map((choice) => (
            <Button
              key={choice.id}
              variant="outline"
              disabled={disabled}
              className="h-auto min-h-11 whitespace-normal py-2 text-center"
              onClick={() => onChoose(choice.label)}
            >
              {choice.label}
            </Button>
          ))}
        </div>
      ) : (
        <Button className="mt-3 w-full" disabled={disabled} onClick={onContinue}>
          Continue
        </Button>
      )}
    </div>
  );
}
