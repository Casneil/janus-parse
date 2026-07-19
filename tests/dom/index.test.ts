import { expect, describe, it } from "vitest";
import { HTMLSanitizer } from "../../lib";

describe("HTMLSanitizer() DOM", () => {
  it("allows ssr override", async () => {
    expect(
      await HTMLSanitizer(
        `<div><p>The price of emissions allowances (EUA)</p><a href="/"> link</a></div>`,
        { ssr: false },
      ),
    ).toBe("The price of emissions allowances (EUA) link");
  });

  it("only returns text nodes without tags", async () => {
    expect(
      await HTMLSanitizer(
        `<div><p>The price of emissions allowances (EUA)</p><a href="/"> link</a></div>`,
      ),
    ).toBe("The price of emissions allowances (EUA) link");
  });
});
