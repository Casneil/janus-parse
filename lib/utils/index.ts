import type { HTMLElement as NodeHTMLElement } from "node-html-parser";

export type Config = {
  addBlacklistTags?: string[];
  removeBlacklistTags?: string[];
};

const defaultBlacklistTags = new Set(["script", "style"]);

export function validateText(text: string) {
  if (
    typeof text !== "string" ||
    (typeof text === "string" && text === "undefined")
  ) {
    throw new Error(
      "The text is not a valid string. Please provide a valid string to parse.",
      { cause: text },
    );
  }
}

export function normalizeWhitespace(text = "") {
  return text.replace(new RegExp(String.raw`\s+`, "g"), " ").trim();
}

export function getTags(config: Config) {
  let tags = new Set();
  if (config.addBlacklistTags) {
    tags = addBlackListTags(config.addBlacklistTags);
  }

  if (config.removeBlacklistTags) {
    tags = removeBlackListTags(config.removeBlacklistTags);
  }

  return [...tags].join(",");
}

export function removeNodes(
  nodesToRemove: NodeHTMLElement[] | NodeListOf<Element>,
) {
  for (const node of nodesToRemove) {
    node.remove();
  }

  return nodesToRemove;
}

function removeBlackListTags(removeBlacklistTags: string[]) {
  const blacklistTags = new Set(defaultBlacklistTags);
  for (const tag of removeBlacklistTags) {
    blacklistTags.delete(tag);
  }

  return blacklistTags;
}

function addBlackListTags(addBlacklistTags: string[]) {
  const blacklistTags = new Set(defaultBlacklistTags);
  for (const tag of addBlacklistTags) {
    blacklistTags.add(tag);
  }

  return blacklistTags;
}
