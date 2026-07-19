import { expect, describe, it } from "vitest";
import { removeBlackListTags, addBlackListTags } from "../../utils";

describe("removeBlackListTags()", () => {
  it("should remove value corectly", () => {
    expect(removeBlackListTags(["a"], new Set(["a", "b", "c"]))).toStrictEqual(
      new Set(["b", "c"]),
    );
  });

  it("should remove multiple values corectly", () => {
    expect(
      removeBlackListTags(["a", "b"], new Set(["a", "b", "c"])),
    ).toStrictEqual(new Set(["c"]));
  });
});

describe("addBlackListTags()", () => {
  it("should remove value corectly", () => {
    expect(addBlackListTags(["c"], new Set(["a", "b"]))).toStrictEqual(
      new Set(["a", "b", "c"]),
    );
  });

  it("hould remove multiple values corectly", () => {
    expect(addBlackListTags(["a", "b"], new Set(["c"]))).toStrictEqual(
      new Set(["a", "b", "c"]),
    );
  });
});
