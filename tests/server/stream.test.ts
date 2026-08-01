import { Readable } from "node:stream";
import { beforeEach } from "node:test";

import { describe, it, expect, vi } from "vitest";

const mockOpenSpy = vi.fn();
vi.doMock("node:fs/promises", () => ({
  open: mockOpenSpy,
}));

const fetchSpy = vi.spyOn(globalThis, "fetch");
const mockClose = vi.fn().mockResolvedValue(undefined);

describe("janusStreamServer() local file stream", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should successfully strip tags data over a stream", async () => {
    mockOpenSpy.mockResolvedValue({
      createReadStream: () => Readable.from(["<div> Hello World </div>"]),
      close: mockClose,
    });

    const { janusStreamServer } = await import("../../lib/server/stream");
    const result = await janusStreamServer({
      filePath: "test/path.html",
    });

    expect(result).toBe("Hello World");
    expect(mockOpenSpy).toHaveBeenCalledWith("test/path.html", "r");
  });

  it("should support custom encodings like ascii", async () => {
    const asciiBuffer = Buffer.from("<div>ASCII Text</div>", "ascii");

    mockOpenSpy.mockResolvedValue({
      createReadStream: () => Readable.from([asciiBuffer]),
      close: mockClose,
    });

    vi.doMock("node:fs/promises", () => ({
      open: mockOpenSpy,
    }));

    const { janusStreamServer } = await import("../../lib/server/stream");
    const result = await janusStreamServer({
      filePath: "test/path.html",
      encoding: "ascii",
    });

    expect(result).toBe("ASCII Text");
    expect(mockOpenSpy).toHaveBeenCalledWith("test/path.html", "r");
  });

  it("should enforce your script blacklist rules", async () => {
    mockOpenSpy.mockResolvedValue({
      createReadStream: () =>
        Readable.from([
          "<div>Safe Content</div><script>console.log('danger')</script>",
        ]),
      close: mockClose,
    });

    vi.doMock("node:fs/promises", () => ({
      open: mockOpenSpy,
    }));

    const { janusStreamServer } = await import("../../lib/server/stream");
    const result = await janusStreamServer({
      filePath: "test/path.html",
      encoding: "ascii",
    });

    expect(result).toBe("Safe Content");
    expect(mockOpenSpy).toHaveBeenCalledWith("test/path.html", "r");
  });

  it("should correctly handle custom configurations like tagsToPreserve", async () => {
    mockOpenSpy.mockResolvedValue({
      createReadStream: () =>
        Readable.from(["<div>***</div><iframe src='video.mp4'></iframe>"]),
      close: mockClose,
    });

    vi.doMock("node:fs/promises", () => ({
      open: mockOpenSpy,
    }));

    const { janusStreamServer } = await import("../../lib/server/stream");
    const result = await janusStreamServer({
      filePath: "test/path.html",
      config: { tagsToPreserve: ["iframe"] },
    });

    expect(result).toBe("***<iframe src='video.mp4'></iframe>");
    expect(mockOpenSpy).toHaveBeenCalledWith("test/path.html", "r");
  });

  it("should throw a TypeError if the input stream content is invalid", async () => {
    mockOpenSpy.mockResolvedValue({
      createReadStream: () => {
        const stream = new Readable({
          read() {
            return undefined;
          },
        });
        queueMicrotask(() => {
          stream.emit("error", new TypeError("Invalid stream data payload"));
        });
        return stream;
      },
      close: mockClose,
    });

    const { janusStreamServer } = await import("../../lib/server/stream");
    const result = janusStreamServer({
      filePath: "test/path.html",
    });

    await expect(result).rejects.toThrow(TypeError);

    expect(mockOpenSpy).toHaveBeenCalledWith("test/path.html", "r");
  });
});

function createMockFetchStream(
  htmlString: string,
  encoding: BufferEncoding = "utf8",
): ReadableStream<Uint8Array> {
  const nativeBuffer = Buffer.from(htmlString, encoding);
  const strictUint8 = new Uint8Array(
    nativeBuffer.buffer,
    nativeBuffer.byteOffset,
    nativeBuffer.byteLength,
  );

  const transformStream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = transformStream.writable.getWriter();
  void writer.write(strictUint8);
  void writer.close();

  return transformStream.readable;
}

describe("janusStreamServer() URL stream", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should successfully strip tags data over a URL stream", async () => {
    const mockStream = createMockFetchStream("<div> Hello World </div>");

    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
      body: mockStream,
    } as Response);

    const { janusStreamServer } = await import("../../lib/server/stream");
    const result = await janusStreamServer({
      url: "https://test-example.com",
    });

    expect(result).toBe("Hello World");
    expect(fetchSpy).toHaveBeenCalledWith("https://test-example.com", {});
  });

  it("should support custom encodings like ascii over URL", async () => {
    const mockStream = createMockFetchStream("<div>ASCII Text</div>", "ascii");

    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "Content-Type": "text/html; charset=ascii" }),
      body: mockStream,
    } as Response);

    const { janusStreamServer } = await import("../../lib/server/stream");
    const result = await janusStreamServer({
      url: "https://test-example.com",
      encoding: "ascii",
    });

    expect(result).toBe("ASCII Text");
    expect(fetchSpy).toHaveBeenCalledWith("https://test-example.com", {});
  });

  it("should enforce your script blacklist rules on URL stream", async () => {
    const mockStream = createMockFetchStream(
      "<div>Safe Content</div><script>console.log('danger')</script>",
    );

    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
      body: mockStream,
    } as Response);

    const { janusStreamServer } = await import("../../lib/server/stream");
    const result = await janusStreamServer({
      url: "https://test-example.com",
    });

    expect(result).toBe("Safe Content");
    expect(fetchSpy).toHaveBeenCalledWith("https://test-example.com", {});
  });

  it("should handle network failure or non-200 responses", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
    } as Response);

    const { janusStreamServer } = await import("../../lib/server/stream");

    await expect(
      janusStreamServer({ url: "https://test-example.com" }),
    ).rejects.toThrow(/Failed downloading stream/);
  });
});
