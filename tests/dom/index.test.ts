import { expect, describe, it } from "vitest";
import { janusClient } from "../../lib/janus-parse";

describe("janusClient()", () => {
  it("allows ssr override", () => {
    expect(
      janusClient(`foo bar <p>the price of emissions allowances (EUA)</p>`),
    ).toBe("foo bar the price of emissions allowances (EUA)");

    expect(
      janusClient(
        `<div><p>The price of emissions allowances (EUA)</p><a href="/"> link</a></div>`,
      ),
    ).toBe("The price of emissions allowances (EUA) link");
  });

  it("only returns text nodes without tags", () => {
    expect(
      janusClient(
        `<div><p>The price of emissions allowances (EUA)</p><a href="/"> link</a></div>`,
      ),
    ).toBe("The price of emissions allowances (EUA) link");
  });

  it("remove tags and content", () => {
    expect(
      janusClient(
        `<div><script>(function() {console.log("foo bar")})()</script><p>The price of emissions allowances (EUA)</p><a href="/"> link</a></div>`,
      ),
    ).toBe("The price of emissions allowances (EUA) link");
  });

  it("allows tags and content if removed from blacklist", () => {
    expect(
      janusClient(
        `<div><script>(function() {console.log('foo bar')})()</script><p>The price of emissions allowances (EUA)</p><a href="/"> link</a></div>`,
        { removeBlacklistTags: ["script"] },
      ),
    ).toBe(
      "(function() {console.log('foo bar')})()The price of emissions allowances (EUA) link",
    );
  });
});
