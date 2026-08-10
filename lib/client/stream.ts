import type { Config } from "../utils/index.js";

type JanusClientStreamConfig = {
  url: string;
  config?: Config;
  encoding?: BufferEncoding;
  fetchOptions?: RequestInit;
};

export async function janusClientStream({
  url,
  config,
  encoding,
  fetchOptions,
}: JanusClientStreamConfig): Promise<string> {
  const response = await fetch(url, fetchOptions);

  if (!response.ok || !response.body) {
    throw new Error(`Failed downloading stream.\n====\nURL: ${url}\n====\n
				 Status:${response.status}`);
  }

  return await _janusClient(response.body, config, encoding);
}

async function _janusClient(
  inputStream: ReadableStream<Uint8Array>,
  config?: Config,
  encoding = "utf8",
): Promise<string> {
  const decodedStream = inputStream.pipeThrough(
    new TextDecoderStream(encoding) as ReadableWritablePair<string, unknown>,
  );

  const reader = decodedStream.getReader();
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += value;
    }
  } finally {
    reader.releaseLock();
  }
	const { janusClient } = await import("./client.js");
  return janusClient(text, config);
}
