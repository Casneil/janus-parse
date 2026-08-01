import type { Config } from "../utils/index";
import {
  validateText,
  getTags,
  normalizeWhitespace,
  serialize,
} from "../utils/index.js";

const defaultConfig = {
  tagsToRemove: [],
  tagsToPreserve: [],
};

export function janusClient(text: string, config: Config = defaultConfig) {
  validateText(text);
  const parser = new DOMParser();
  const { removedTags, preservedTags } = getTags(config);
  const root = parser.parseFromString(text, "text/html").body;

  return normalizeWhitespace(
    serialize({ node: root, removedTags, preservedTags }),
  );
}
