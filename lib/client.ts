import { validateText, getTags, normalizeWhitespace, serialize } from "./utils";
import type { Config } from "./utils";

export function janusClient(
  text: string,
  config: Config = {
    tagsToRemove: [],
    tagsToPreserve: [],
  },
) {
  validateText(text);
  const parser = new DOMParser();
  const { removedTags, preservedTags } = getTags(config);
  const root = parser.parseFromString(text, "text/html").body;

  return normalizeWhitespace(
    serialize({ node: root, removedTags, preservedTags }),
  );
}
