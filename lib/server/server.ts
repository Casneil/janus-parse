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
  preserveTagsWithAttrs: [],
};

export async function janusServer(
  text: string,
  config: Config = defaultConfig,
) {
  validateText(text);
  const { parse } = await import("node-html-parser");
  const root = parse(text);
  const { removedTags, preservedTags, preserveTagsWithAttrs } = getTags(config);
  return normalizeWhitespace(
    serialize({
      node: root,
      removedTags,
      preservedTags,
      preserveTagsWithAttrs,
    }),
  );
}
