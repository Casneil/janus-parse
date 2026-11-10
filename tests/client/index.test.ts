import { expect, describe, it } from "vitest";

import { janusClient } from "../../lib/client/client";

describe("janusClient()", () => {
  it("does inform user of unexpected arguments and does no work", () => {
    //@ts-expect-error testing purposes
    expect(() => janusClient(7)).toThrow(
      `======================================================
=> 7 recieved. String expected.
======================================================`,
    );
  });

  it("removes whitespace characters trim texts correctly", () => {
    expect(janusClient("foo	bar  ")).toBe("foo bar");
  });

  it("returns text nodes without tags", () => {
    expect(
      janusClient("foo bar <p>the price of emissions allowances (EUA)</p>"),
    ).toBe("foo bar the price of emissions allowances (EUA)");

    expect(
      janusClient(
        `<div><p>The price of emissions allowances (EUA)</p><a href="/"> link</a></div>`,
      ),
    ).toBe("The price of emissions allowances (EUA) link");
  });

  it("returns text nodes as is.", () => {
    expect(janusClient("This is not a html string.")).toBe(
      "This is not a html string.",
    );
  });

  it("removes tags and content", () => {
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
        { tagsToPreserve: ["script"] },
      ),
    ).toBe(
      "<script>(function() {console.log('foo bar')})()</script>The price of emissions allowances (EUA) link",
    );
  });

  it("allows multiple tags and content if removed from blacklist", () => {
    expect(
      janusClient(
        `<div><script>(function() {console.log('foo bar')})()</script><p>The price of emissions allowances (EUA)</p><a href="/"> link</a></div>`,
        { tagsToPreserve: ["script", "div"] },
      ),
    ).toBe(
      `<div><script>(function() {console.log('foo bar')})()</script><p>The price of emissions allowances (EUA)</p><a href="/"> link</a></div>`,
    );
  });

  it("preserves a single tag with matching attributes when multiple instances of the same tag is present", () => {
    expect(
      janusClient(
        `<div>The price of emissions <a>vehicle</a> allowances (EUA)</p><a data-foo='hello'> link</a></p></div>`,
        { preserveTagsWithAttrs: ["data-foo='hello'"], tagsToPreserve: ["a"] },
      ),
    ).toBe(
      `The price of emissions vehicle allowances (EUA)<a data-foo="hello"> link</a>`,
    );
  });

  it("preserves nested tag when one of its attributes matches", () => {
    expect(
      janusClient(
        `The price of emissions allowances (EUA) </p>vehicles <a href='/' data-foo='hello'> link</a></p>`,
        {
          preserveTagsWithAttrs: ["data-foo='hello'"],
          tagsToPreserve: ["a"],
        },
      ),
    ).toBe(
      `The price of emissions allowances (EUA) vehicles <a href="/" data-foo="hello"> link</a>`,
    );
  });
});
