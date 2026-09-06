import { describe, expect, it } from "vitest";
import { hashPasscode, isValidPasscodeFormat, verifyPasscodeHash } from "./passcode-hash";

describe("passcode hashing (§14)", () => {
  it("never stores the passcode itself in the hash string", () => {
    const stored = hashPasscode("1234");
    expect(stored).not.toContain("1234");
  });

  it("verifies the correct passcode against its own hash", () => {
    const stored = hashPasscode("905317");
    expect(verifyPasscodeHash("905317", stored)).toBe(true);
  });

  it("rejects an incorrect passcode", () => {
    const stored = hashPasscode("905317");
    expect(verifyPasscodeHash("000000", stored)).toBe(false);
  });

  it("produces a different hash each time (random salt), but both verify", () => {
    const a = hashPasscode("4242");
    const b = hashPasscode("4242");
    expect(a).not.toBe(b);
    expect(verifyPasscodeHash("4242", a)).toBe(true);
    expect(verifyPasscodeHash("4242", b)).toBe(true);
  });

  it("rejects malformed stored values instead of throwing", () => {
    expect(verifyPasscodeHash("1234", "garbage")).toBe(false);
    expect(verifyPasscodeHash("1234", "")).toBe(false);
  });
});

describe("isValidPasscodeFormat", () => {
  it("accepts 4 to 6 digit numeric passcodes", () => {
    expect(isValidPasscodeFormat("1234")).toBe(true);
    expect(isValidPasscodeFormat("123456")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isValidPasscodeFormat("123")).toBe(false);
    expect(isValidPasscodeFormat("1234567")).toBe(false);
    expect(isValidPasscodeFormat("abcd")).toBe(false);
    expect(isValidPasscodeFormat("12 34")).toBe(false);
  });
});
