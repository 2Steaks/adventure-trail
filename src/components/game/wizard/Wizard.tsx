export type WizardState =
  | "idle"
  | "thinking"
  | "quest-available"
  | "waiting"
  | "quest-completed"
  | "unexpected-event";

export function Wizard({ state }: { state: WizardState }) {
  return (
    <div
      role="img"
      aria-label={`Wizard: ${state}`}
      className="flex h-24 w-24 items-center justify-center border-4 border-foreground bg-background text-xs uppercase"
    >
      {state}
    </div>
  );
}
