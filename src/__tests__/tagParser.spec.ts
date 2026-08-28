import { describe, it, expect } from "vitest";
import { parseTagsInput } from "../utils/tagParser";

describe("parseTagsInput", () => {
  it("should parse Excel column pasted with newlines", () => {
    const excelPaste = `branding\nui ux design\nmobile app\ndashboard\n3d render`;
    const result = parseTagsInput(excelPaste);
    expect(result).toEqual([
      "branding",
      "ui ux design",
      "mobile app",
      "dashboard",
      "3d render",
    ]);
  });

  it("should parse comma and semicolon separated strings with hashes and bullets", () => {
    const mixed = `#branding, • mobile app; "dashboard"	3d render`;
    const result = parseTagsInput(mixed);
    expect(result).toEqual([
      "branding",
      "mobile app",
      "dashboard",
      "3d render",
    ]);
  });

  it("should deduplicate tags and handle empty inputs", () => {
    expect(parseTagsInput("")).toEqual([]);
    expect(parseTagsInput("branding, BRANDING, #branding\nbranding")).toEqual(["branding"]);
  });
});
