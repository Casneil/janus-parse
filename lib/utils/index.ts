import type { HTMLElement as NodeHTMLElement } from "node-html-parser";

export type Config = {
  tagsToRemove?: string[];
  tagsToPreserve?: string[];
  preserveTagsWithAttrs?: string[];
};

const defaultBlacklistTags = new Set(["script", "style"]);

export function validateText(text: string) {
  if (typeof text !== "string") {
    throw new TypeError(
      `\n======================================================\n=> ${text} recieved. String expected.\n======================================================`,
      { cause: `${text} is not of type string.` },
    );
  }
}

export function normalizeWhitespace(text = "") {
  return text.replace(new RegExp(String.raw`\s+`, "g"), " ").trim();
}

export function getTags(config: Config) {
  const removedTags = new Set(defaultBlacklistTags);
  const preservedTags = new Set<string>();
	const preserveTagsWithAttrs = new Set<string>([config.preserveTagsWithAttrs?.join("") ?? ""]);

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

  return { removedTags, preservedTags, preserveTagsWithAttrs };
}

type SerializeParams = {
  node: NodeHTMLElement;
  removedTags: Set<string>;
  preservedTags: Set<string>;
  preserveTagsWithAttrs?: Set<string>;
};
export function serialize({
  node,
  removedTags,
  preservedTags,
  // we cannot peserve tags which are N level deep without overhead. Preserve all tags which have whitelist attributes. Tags with attributes to preserve must be listed in the same order as they appear in the HTML string. This is a limitation of the current implementation.
  preserveTagsWithAttrs,
}: SerializeParams): string {
  if (!node) return "";

  if (node.nodeType === 3) {
    // DOM Text node => 3
    const rawText = getNodeProperty(node, "rawText");
    const text = getNodeProperty(node, "text");

    return rawText ?? text ?? node.textContent ?? "";
  }

  const tagName = getNodeProperty(node, "tagName") ?? "";
  const tag = tagName.toLowerCase();

  //  Completely ignore blacklisted tags
  if (removedTags.has(tag)) return "";

  //  Keep preserved tags intact along with their outer HTML structure
  if (preservedTags.has(tag)) {
    const outerHTML = getNodeProperty(node, "outerHTML");
    return (
      outerHTML ??
      (typeof String(node) === "function" ? String(node) : undefined) ??
      ""
    );
  }

  const children = [...node.childNodes] as NodeHTMLElement[];

  return children
    .map((child) => {
      if (preserveTagsWithAttrs?.has(child.rawAttrs?.split(" ").join(""))) {
        return `<${child.rawTagName} ${child.rawAttrs}>${child.rawText}</${child.rawTagName}>`;
      }
      return serialize({ node: child, removedTags, preservedTags });
    })
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

type LookupType = "outerHTML" | "text" | "rawText" | "tagName";
function getNodeProperty(
  node: NodeHTMLElement,
  lookup: LookupType = "outerHTML",
): string | undefined {
  const targetNode = node;
  const value = targetNode[lookup];

  return value ?? undefined;
}
