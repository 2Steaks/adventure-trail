import Image from "next/image";

export type WizardState =
  | "idle"
  | "thinking"
  | "quest-available"
  | "waiting"
  | "quest-completed"
  | "unexpected-event";

const WIZARD_IMAGE_SRC: Record<WizardState, string> = {
  idle: "/wizard/idle.png",
  thinking: "/wizard/thinking.png",
  "quest-available": "/wizard/quest-available.png",
  waiting: "/wizard/waiting.png",
  "quest-completed": "/wizard/quest-completed.png",
  "unexpected-event": "/wizard/unexpected-event.png",
};

export function Wizard({ state }: { state: WizardState }) {
  return (
    <div
      role="img"
      aria-label={`Wizard: ${state}`}
      className="relative h-24 w-24 overflow-hidden border-4 border-foreground bg-background"
    >
      <Image
        src={WIZARD_IMAGE_SRC[state]}
        alt=""
        fill
        sizes="6rem"
        className="object-cover"
        priority
      />
    </div>
  );
}
