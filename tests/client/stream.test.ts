import { describe, it, expect, vi } from "vitest";

import { janusStreamClient } from "../../lib/client/stream";

const fetchSpy = vi.spyOn(globalThis, "fetch");
function createMockBrowserStream(
  htmlContent: string,
  chunkSize = 5,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const allBytes = encoder.encode(htmlContent);

  return new ReadableStream({
    start(controller) {
      for (let index = 0; index < allBytes.length; index += chunkSize) {
        const chunk = allBytes.slice(index, index + chunkSize);
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });
}

describe("janusStreamClient()", () => {
  it("should successfully process and compile tiny browser chunks", async () => {
    const mockStream = createMockBrowserStream(
      "<div>  Hello   Browser  </div>",
    );
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "text/html; charset=utf8" }),
      body: mockStream,
    } as Response);

    expect(await janusStreamClient({ url: "https://test-example.com" })).toBe(
      "Hello Browser",
    );
  });

  it("should support custom web encodings like ascii", async () => {
    const mockStream = createMockBrowserStream("<div>Web Stream</div>");
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "text/html; charset=ascii" }),
      body: mockStream,
    } as Response);

    const result = await janusStreamClient({
      url: "https://test-example.com",
      encoding: "ascii",
    });

    expect(result).toBe("Web Stream");
  });

  it("should enforce your script blacklist rules", async () => {
    const mockStream = createMockBrowserStream(
      "<p>Safe</p><script>alert('bad')</script>",
    );
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "text/html; charset=utf8" }),
      body: mockStream,
    } as Response);

    const result = await janusStreamClient({ url: "https://test-example.com" });

    expect(result).toBe("Safe");
  });

  it("should correctly handle custom configurations on the client side", async () => {
    const mockStream = createMockBrowserStream(
      "<div>Strip Me </div><iframe></iframe>",
    );
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "text/html; charset=utf8" }),
      body: mockStream,
    } as Response);

    const result = await janusStreamClient({
      url: "https://test-example.com",
      config: { tagsToPreserve: ["iframe"] },
    });

    expect(result).toBe("Strip Me <iframe></iframe>");
  });

  it("should handle network failure or non-200 responses", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    await expect(
      janusStreamClient({ url: "https://test-example.com" }),
    ).rejects.toThrow(/Failed downloading stream/);
  });
});
