import { describe, expect, it } from "vitest";
import { firstPhone } from "./phone";

describe("firstPhone", () => {
  it("passes through a plain number unchanged (digits only)", () => {
    expect(firstPhone("7676602602")).toBe("7676602602");
  });

  it("strips hyphens from a hyphenated number", () => {
    expect(firstPhone("0484-2540530")).toBe("04842540530");
  });

  it("takes only the first of two alternatives separated by 'or'", () => {
    expect(firstPhone("14416 or 1-800-891-4416")).toBe("14416");
  });

  it("never absorbs digits from a parenthetical aside after the number", () => {
    // The real bug this guards: "(24hr)" must not leak its digits onto the
    // phone number just because it comes right after it.
    expect(firstPhone("044-2464-0050 (24hr) or 044-2464-0060")).toBe("04424640050");
  });

  it("keeps a leading + and strips trailing descriptive text", () => {
    expect(firstPhone("+91 9999 666 555 (call or WhatsApp)")).toBe("+919999666555");
  });
});
