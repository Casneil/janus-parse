import { expect, describe, it } from "vitest";

import { janusServer } from "../../lib/janus-parse";

describe("janusServer()", () => {
  it("only returns text nodes without tags", async () => {
    expect(
      await janusServer(
        `foo bar <p>the price of emissions allowances (EUA)</p>`,
      ),
    ).toBe("foo bar the price of emissions allowances (EUA)");

    expect(
      await janusServer(
        `<div><p>The price of emissions allowances (EUA)</p><a href="/"> link</a></div>`,
      ),
    ).toBe("The price of emissions allowances (EUA) link");
  });

  it("remove tags and content", async () => {
    expect(
      await janusServer(
        `<div><script>(function() {console.log("foo bar")})()</script><p>The price of emissions allowances (EUA)</p><a href="/"> link</a></div>`,
      ),
    ).toBe("The price of emissions allowances (EUA) link");
  });

  it("allows tags and content if removed from blacklist", async () => {
    expect(
      await janusServer(
        `<div><script>(function() {console.log('foo bar')})()</script><p>The price of emissions allowances (EUA)</p><a href="/"> link</a></div>`,
        { removeBlacklistTags: ["script"] },
      ),
    ).toBe(
      "(function() {console.log('foo bar')})()The price of emissions allowances (EUA) link",
    );
  });
});
