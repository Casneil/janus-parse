import { blacklistTags } from "./blacklist";
import { TEXT } from "../fixtures";
import {
  addBlackListTags,
  removeBlackListTags,
  validateText,
  removeNodes,
} from "../utils";

type Config = {
  ssr?: boolean;
  addBlacklistTags?: string[];
  removeBlacklistTags?: string[];
};
const HTMLSanitizerConfig: Config = {
  ssr: true,
  addBlacklistTags: [],
  removeBlacklistTags: [],
};

const defaultBlacklistTags = blacklistTags;

export async function HTMLSanitizer(
  text: string,
  config: Config = HTMLSanitizerConfig,
) {
  if (config.addBlacklistTags) {
    addBlackListTags(config.addBlacklistTags, defaultBlacklistTags);
  }

  if (config.removeBlacklistTags) {
    removeBlackListTags(config.removeBlacklistTags, defaultBlacklistTags);
  }

  const tags = [...defaultBlacklistTags].join(",");

  if (config.ssr) {
    return await ServerParser(text, tags);
  }

  return (text = String(clientParser(text, tags)));
}

async function ServerParser(text: string, tags: string) {
  validateText(text);
  const parser = await import("node-html-parser");
  const root = parser.parse(text);
  const nodesToRemove = root.querySelectorAll(tags);
  // @ts-expect-error
  removeNodes(nodesToRemove);

  return root.textContent.replace(/\s+/g, " ").trim();
}

function clientParser(text: string, tags: string) {
  validateText(text);
  const parser = new DOMParser();
  const virtualDoc = parser.parseFromString(text, "text/html");
  const cleanText = virtualDoc.body.textContent;

  const nodesToRemove = virtualDoc.querySelectorAll(tags);

  removeNodes(nodesToRemove);

  return cleanText;
}

// const parser = await HTMLSanitizer(TEXT);
// console.log(parser);
