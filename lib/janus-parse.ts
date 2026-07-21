import { validateText, removeNodes, getTags, normalizeWhitespace } from "./utils";
import type { Config } from "./utils";

const janusConfig: Config = {
  addBlacklistTags: [],
  removeBlacklistTags: [],
};

export async function janusServer(text: string, config: Config = janusConfig) {
  validateText(text);
  const tags = getTags(config);
  const parser = await import("node-html-parser");
  const root = parser.parse(text);
  const nodesToRemove = root.querySelectorAll(tags);
  removeNodes(nodesToRemove);

	return normalizeWhitespace(root.textContent);
}

export function janusClient(text: string, config: Config = janusConfig) {
  validateText(text);
  const tags = getTags(config);
  const parser = new DOMParser();
  const virtualDocument = parser.parseFromString(text, "text/html");

  const nodesToRemove = virtualDocument.querySelectorAll(tags);
  removeNodes(nodesToRemove);

	return normalizeWhitespace(virtualDocument.body.textContent);
}
