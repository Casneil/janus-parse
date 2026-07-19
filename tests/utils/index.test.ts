import { expect, describe, it } from "vitest";
import { getTags } from "../../utils";

describe("getTags()", () => {
  it("should remove tag corectly", () => {
    expect(getTags({ removeBlacklistTags: ["style"] })).toBe("script");
  });

  it("should remove multiple tags corectly", () => {
    expect(getTags({ removeBlacklistTags: ["script", "style"] })).toBe("");
  });

  it("should add tag corectly", () => {
    expect(getTags({ addBlacklistTags: ["iframe"] })).toBe(
      "script,style,iframe",
    );
  });

  it("should add multiple tagss corectly", () => {
    expect(getTags({ addBlacklistTags: ["iframe", "button"] })).toBe(
      "script,style,iframe,button",
    );
  });
});
