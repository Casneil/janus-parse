import { expect, describe, it } from "vitest";

import { getTags } from "../../lib/utils";

describe("getTags()", () => {
  it("should preserve a tag and remove it from the remove list", () => {
    const { removedTags, preservedTags } = getTags({
      tagsToPreserve: ["style"],
    });

    expect(preservedTags.has("style")).toBe(true);
    expect(removedTags.has("style")).toBe(false);

    expect(removedTags.has("script")).toBe(true);
  });

  it("should clear the remove list when preserving all default tags", () => {
    const { removedTags, preservedTags } = getTags({
      tagsToPreserve: ["script", "style"],
    });

    expect(removedTags.size).toBe(0);
    expect([...preservedTags]).toStrictEqual(["script", "style"]);
  });

  it("should add new tags to the remove list while keeping defaults in the remove list", () => {
    const { preservedTags, removedTags } = getTags({
      tagsToRemove: ["iframe"],
    });

    expect(removedTags.has("iframe")).toBe(true);
    expect(removedTags.has("script")).toBe(true);

    expect(preservedTags.has("script")).toBe(false);
    expect(preservedTags.has("iframe")).not.toBe(true);
  });

  it("should combine all tracked tags accurately", () => {
    const { preservedTags, removedTags } = getTags({
      tagsToRemove: ["iframe", "button"],
    });

    const allTags = new Set([...removedTags, ...preservedTags]);

    expect(allTags.has("script")).toBe(true);
    expect(allTags.has("style")).toBe(true);
    expect(allTags.has("iframe")).toBe(true);
    expect(allTags.has("button")).toBe(true);
  });
});
