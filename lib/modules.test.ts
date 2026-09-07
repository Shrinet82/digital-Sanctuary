import { describe, expect, it } from "vitest";
import { GROUP_LABELS, MODULE_LIST, groupLabel } from "./modules";

describe("module lanes (§10 — state-based, not diagnosis-based)", () => {
  it("has no diagnosis-named lane — only the state-based ones, plus substance use", () => {
    const labels = GROUP_LABELS.map((g) => g.label);
    expect(labels).not.toContain("Anxiety");
    expect(labels).not.toContain("ADHD");
    expect(labels).toEqual([
      "All",
      "Right now",
      "Racing thoughts",
      "Low mood",
      "Can't start",
      "Substance use",
    ]);
  });

  it("groupLabel derives every card/pill subtitle from the single lane list", () => {
    expect(groupLabel("right_now")).toBe("Right now");
    expect(groupLabel("racing_thoughts")).toBe("Racing thoughts");
    expect(groupLabel("low_mood")).toBe("Low mood");
    expect(groupLabel("cant_start")).toBe("Can't start");
    expect(groupLabel("substance")).toBe("Substance use");
  });

  it("every module belongs to a real lane", () => {
    const validGroups = new Set(GROUP_LABELS.map((g) => g.value));
    for (const m of MODULE_LIST) {
      expect(validGroups.has(m.group)).toBe(true);
    }
  });

  it("splits the old flat anxiety bucket exactly as specified: 5 right_now + 4 racing_thoughts", () => {
    const rightNow = MODULE_LIST.filter((m) => m.group === "right_now").map((m) => m.id);
    const racingThoughts = MODULE_LIST.filter((m) => m.group === "racing_thoughts").map(
      (m) => m.id
    );
    expect(rightNow.sort()).toEqual(
      ["ground-and-settle", "body-settle", "cool-the-storm", "ride-the-wave", "grounding-54321"].sort()
    );
    expect(racingThoughts.sort()).toEqual(
      ["worry-sorter", "worry-window", "problem-ladder", "card-deck"].sort()
    );
  });

  it("substance use is the one condition-specific lane, unchanged", () => {
    const substance = MODULE_LIST.filter((m) => m.group === "substance").map((m) => m.id);
    expect(substance.sort()).toEqual(
      ["safety-gateway", "trigger-map", "mooring-lines", "context-log", "lapse-review"].sort()
    );
  });

  it("has no separate `condition` field to drift from `group` — ModuleMeta type only has one label source", () => {
    for (const m of MODULE_LIST) {
      expect((m as Record<string, unknown>).condition).toBeUndefined();
    }
  });
});
