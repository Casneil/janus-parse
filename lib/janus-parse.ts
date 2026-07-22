import { validateText, getTags, normalizeWhitespace, serialize } from "./utils";
import type { Config } from "./utils";

const janusConfig: Config = {
  tagsToRemove: [],
  tagsToPreserve: [],
};

export async function janusServer(text: string, config: Config = janusConfig) {
  validateText(text);
  const parser = await import("node-html-parser");
  const root = parser.parse(text);
  const { removedTags, preservedTags } = getTags(config);

  return normalizeWhitespace(
    serialize({ node: root, removedTags, preservedTags }),
  );
}

export function janusClient(text: string, config: Config = janusConfig) {
  validateText(text);
  const parser = new DOMParser();
  const { removedTags, preservedTags } = getTags(config);
  const root = parser.parseFromString(text, "text/html").body;

  return normalizeWhitespace(
    serialize({ node: root, removedTags, preservedTags }),
  );
}
