import type { HTMLElement as NodeHTMLElement } from "node-html-parser";

export type Config = {
  tagsToRemove?: string[];
  tagsToPreserve?: string[];
};

export const defaultBlacklistTags = new Set(["script", "style"]);

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
  const removedTags = new Set(defaultBlacklistTags);
  const preservedTags = new Set<string>();

  if (config.tagsToRemove) {
    addBlackListTags(removedTags, config.tagsToRemove);
  }

  if (config.tagsToPreserve) {
    removeBlackListTags({
      removedTags,
      preservedTags,
      tagsToPreserve: config.tagsToPreserve,
    });
  }

  return { removedTags, preservedTags };
}

export function serialize({
  node,
  removedTags,
  preservedTags,
}: {
  node: Node;
  removedTags: Set<string>;
  preservedTags: Set<string>;
}): string {
  if (!node) return "";

  if (node.nodeType === 3) {
    // DOM Text node => 3
    const rawText = validateNode(node, "rawText");
    const text = validateNode(node, "text");

    return rawText ?? text ?? node.textContent ?? "";
  }

  const tagName = validateNode(node, "tagName") ?? "";
  const tag = tagName.toLowerCase();

  //  Completely ignore blacklisted tags
  if (removedTags.has(tag)) return "";

  //  Keep preserved tags intact along with their outer HTML structure
  if (preservedTags.has(tag)) {
    const outerHTML = validateNode(node, "outerHTML");

    return (
      outerHTML ??
      (typeof node.toString === "function" ? node.toString() : undefined) ??
      ""
    );
  }

  const children = [...node.childNodes] as Node[];
  return children
    .map((child) => serialize({ node: child, removedTags, preservedTags }))
    .join("");
}

function removeBlackListTags({
  removedTags,
  preservedTags,
  tagsToPreserve,
}: {
  removedTags: Set<string>;
  preservedTags: Set<string>;
  tagsToPreserve: string[];
}) {
  for (const tag of tagsToPreserve) {
    const normalized = tag.toLowerCase();
    removedTags.delete(normalized);
    preservedTags.add(normalized);
  }
}

function addBlackListTags(preserveTags: Set<string>, tagsToRemove: string[]) {
  for (const tag of tagsToRemove) {
    preserveTags.add(tag.toLowerCase());
  }
}

type Node = NodeHTMLElement | ChildNode;
type LookupType = "outerHTML" | "text" | "rawText" | "tagName";

function validateNode(
  node: Node,
  lookup: LookupType = "outerHTML",
): string | undefined {
  const targetNode = node as Record<LookupType, string>;
  const value = targetNode[lookup];

  return value ?? undefined;
}
