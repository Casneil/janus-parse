import { Readable } from "node:stream";
import { beforeEach } from "node:test";

import { describe, it, expect, vi } from "vitest";

const mockOpenSpy = vi.fn();
vi.doMock("node:fs/promises", () => ({
  open: mockOpenSpy,
}));

describe("janusStream() local file stream", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should successfully strip tags data over a stream", async () => {
    const mockClose = vi.fn().mockResolvedValue(undefined);
    mockOpenSpy.mockResolvedValue({
      createReadStream: () => Readable.from(["<div> Hello World </div>"]),
      close: mockClose,
    });

    const { janusStream } = await import("../../lib/server/stream");
    const result = await janusStream({
      isFetchUrl: false,
      filePath: "dummy/path.html",
    });

    expect(result).toBe("Hello World");
    expect(mockOpenSpy).toHaveBeenCalledWith("dummy/path.html", "r");
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("should support custom encodings like ascii", async () => {
    const asciiBuffer = Buffer.from("<div>ASCII Text</div>", "ascii");

    const mockClose = vi.fn().mockResolvedValue(undefined);
    mockOpenSpy.mockResolvedValue({
      createReadStream: () => Readable.from([asciiBuffer]),
      close: mockClose,
    });

    vi.doMock("node:fs/promises", () => ({
      open: mockOpenSpy,
    }));

    const { janusStream } = await import("../../lib/server/stream");
    const result = await janusStream({
      isFetchUrl: false,
      filePath: "dummy/path.html",
      encoding: "ascii",
    });

    expect(result).toBe("ASCII Text");
    expect(mockOpenSpy).toHaveBeenCalledWith("dummy/path.html", "r");
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("should enforce your script blacklist rules", async () => {
    const mockClose = vi.fn().mockResolvedValue(undefined);
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

    const { janusStream } = await import("../../lib/server/stream");
    const result = await janusStream({
      isFetchUrl: false,
      filePath: "dummy/path.html",
      encoding: "ascii",
    });

    expect(result).toBe("Safe Content");
    expect(mockOpenSpy).toHaveBeenCalledWith("dummy/path.html", "r");
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle custom configurations like tagsToPreserve", async () => {
    const mockClose = vi.fn().mockResolvedValue(undefined);
    mockOpenSpy.mockResolvedValue({
      createReadStream: () =>
        Readable.from(["<div>***</div><iframe src='video.mp4'></iframe>"]),
      close: mockClose,
    });

    vi.doMock("node:fs/promises", () => ({
      open: mockOpenSpy,
    }));

    const { janusStream } = await import("../../lib/server/stream");
    const result = await janusStream({
      isFetchUrl: false,
      filePath: "dummy/path.html",
      config: { tagsToPreserve: ["iframe"] },
    });

    expect(result).toBe("***<iframe src='video.mp4'></iframe>");
    expect(mockOpenSpy).toHaveBeenCalledWith("dummy/path.html", "r");
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("should throw a TypeError if the input stream content is invalid", async () => {
    const mockClose = vi.fn().mockResolvedValue(undefined);
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

    const { janusStream } = await import("../../lib/server/stream");
    const result = janusStream({
      isFetchUrl: false,
      filePath: "dummy/path.html",
    });

    await expect(result).rejects.toThrow(TypeError);

    expect(mockOpenSpy).toHaveBeenCalledWith("dummy/path.html", "r");
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
