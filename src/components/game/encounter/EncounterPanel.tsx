import { Button } from "@/src/components/ui/button";
import type { EncounterOutput } from "@/src/lib/schemas/encounter";

export function EncounterPanel({
  output,
  onChoose,
  disabled,
}: {
  output: EncounterOutput;
  onChoose: (label: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-4 border-2 border-foreground bg-background p-4 text-left">
      <p className="text-sm">{output.message}</p>

      {output.choices.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {output.choices.map((choice) => (
            <Button
              key={choice.id}
              variant="outline"
              disabled={disabled}
              onClick={() => onChoose(choice.label)}
            >
              {choice.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
