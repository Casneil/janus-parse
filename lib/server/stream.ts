import type { FileHandle } from "node:fs/promises";
import { open } from "node:fs/promises";
import { Readable } from "node:stream";
import { buffer } from "node:stream/consumers";

import { janusServer } from "./server.js";
import type { Config } from "../utils/index.js";

type ConfigOptions = {
  encoding?: BufferEncoding;
  fetchOptions?: RequestInit;
  config?: Config;
};
type JanusConfig = {
  filePath?: string;
  url?: string;
} & ConfigOptions;

type JanusFileConfig = Omit<ConfigOptions, "fetchOptions"> & {
  filePath: string;
};
type JanusStreamConfig = ConfigOptions & { url: string };

export async function janusStream({
  config,
  filePath,
  encoding,
}: JanusFileConfig): Promise<string>;
export async function janusStream({
  url,
  encoding,
  fetchOptions,
  config,
}: JanusStreamConfig): Promise<string>;
export async function janusStream({
  encoding = "utf8",
  filePath = "",
  fetchOptions = {},
  config = {},
  url = "",
}: JanusConfig): Promise<string> {
  if (url.trim().length > 0) {
    const response = await fetch(url, fetchOptions);
    if (!response.ok || !response.body) {
      throw new Error(
        `Failed downloading stream.\n====\nURL: ${url}\n====\n
				 Status:${response.status}`,
      );
    }
    const webStream = Readable.from(response.body);
    return await _janusServer(webStream, config, encoding);
  }

  let handle: FileHandle | undefined;

  try {
    handle = await open(filePath, "r"); // Read mode.
    const file = handle.createReadStream();

    return await _janusServer(file, config, encoding);
  } finally {
    if (handle) {
      await handle.close();
    }
  }
}

async function _janusServer(
  inputStream: Readable | ReadableStream<Uint8Array<ArrayBuffer>>,
  config?: Config,
  encoding: BufferEncoding = "utf8",
): Promise<string> {
  const bytesBuffer = await buffer(inputStream);
  const decoder = new TextDecoder(encoding);
  const text = decoder.decode(bytesBuffer);

  return await janusServer(text, config);
}
