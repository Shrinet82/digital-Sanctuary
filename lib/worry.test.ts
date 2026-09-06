import { describe, expect, it } from "vitest";
import { REFOCUS_PROMPTS, refocusPrompt } from "./worry";

describe("refocusPrompt", () => {
  it("is deterministic for a fixed seed", () => {
    expect(refocusPrompt("2026-01-01:worry-window")).toBe(
      refocusPrompt("2026-01-01:worry-window")
    );
  });

  it("only ever returns a prompt from the bank", () => {
    expect(REFOCUS_PROMPTS).toContain(refocusPrompt("2026-06-15:worry-window"));
  });
});
