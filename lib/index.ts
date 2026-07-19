import { TEXT } from "../fixtures";
import { validateText, removeNodes, Config, getTags } from "../utils";

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
  // @ts-expect-error
  removeNodes(nodesToRemove);

  return root.textContent.replace(/\s+/g, " ").trim();
}

export function janusClient(text: string, config: Config = janusConfig) {
  validateText(text);
  const tags = getTags(config);
  const parser = new DOMParser();
  const virtualDoc = parser.parseFromString(text, "text/html");

  const nodesToRemove = virtualDoc.querySelectorAll(tags);
  removeNodes(nodesToRemove);

  const cleanText = virtualDoc.body.textContent;

  return cleanText;
}

// const parser = await janusServer(TEXT);
// console.log(parser);
