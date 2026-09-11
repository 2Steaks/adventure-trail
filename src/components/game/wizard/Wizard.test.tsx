import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Wizard, type WizardState } from "./Wizard";

const STATES: WizardState[] = [
  "idle",
  "thinking",
  "quest-available",
  "waiting",
  "quest-completed",
  "unexpected-event",
];

describe("Wizard", () => {
  it.each(STATES)("renders the %s state with a matching aria-label", (state) => {
    render(<Wizard state={state} />);

    expect(screen.getByLabelText(`Wizard: ${state}`)).toBeInTheDocument();
  });
});
