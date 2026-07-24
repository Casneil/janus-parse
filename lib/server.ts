import { parse } from "node-html-parser";
import { validateText, getTags, normalizeWhitespace, serialize } from "./utils";

import type { Config } from "./utils";

export async function janusServer(
  text: string,
  config: Config = {
    tagsToRemove: [],
    tagsToPreserve: [],
  },
) {
  validateText(text);
  const root = parse(text);
  const { removedTags, preservedTags } = getTags(config);

  return normalizeWhitespace(
    serialize({ node: root, removedTags, preservedTags }),
  );
}
