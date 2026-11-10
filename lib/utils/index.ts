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
  const preserveTagsWithAttributes = new Set<string>(
    config.preserveTagsWithAttrs,
  );

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

  return {
    removedTags,
    preservedTags,
    preserveTagsWithAttrs: preserveTagsWithAttributes,
  };
}
type SerializableNode = NodeHTMLElement | HTMLElement;

type SerializeParameters = {
  node: SerializableNode;
  removedTags: Set<string>;
  preservedTags: Set<string>;
  preserveTagsWithAttrs?: Set<string>;
};
export function serialize({
  node,
  removedTags,
  preservedTags,
  preserveTagsWithAttrs,
}: SerializeParameters): string {
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

  const children = [...node.childNodes] as NodeHTMLElement[];
  function serializeChildren() {
    return children
      .map((child) =>
        serialize({
          node: child,
          removedTags,
          preservedTags,
          preserveTagsWithAttrs,
        }),
      )
      .join("");
  }

  if (preservedTags.has(tag)) {
    if (
      preserveTagsWithAttrs &&
      preserveTagsWithAttrs.size > 0 &&
      !hasPreservedAttribute(node, preserveTagsWithAttrs)
    ) {
      return serializeChildren();
    }

    const outerHTML = getNodeProperty(node, "outerHTML");
    return (
      outerHTML ??
      (typeof String(node) === "function" ? String(node) : undefined) ??
      ""
    );
  }

  return serializeChildren();
}

function sanitizeAttribute(attribute: string) {
  return attribute.replace(/\s+/g, " ").replace(/'/g, '"').trim();
}

function hasPreservedAttribute(
  node: SerializableNode,
  preserveTagsWithAttributes: Set<string>,
) {
  const nodeType = "nodeType" in node ? node.nodeType : undefined;
  const rawAttributes =
    "rawAttrs" in node
      ? (node.rawAttrs ?? "")
      : nodeType === 1
        ? [...(node as Element).attributes]
            .map(({ name, value }) => `${name}="${value}"`)
            .join(" ")
        : "";
  const normalizedAttributes = sanitizeAttribute(rawAttributes);

  return rawAttributes
    ? [...preserveTagsWithAttributes].some(
        (attribute) =>
          Boolean(attribute.trim()) &&
          normalizedAttributes.includes(sanitizeAttribute(attribute)),
      )
    : false;
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
  node: SerializableNode,
  lookup: LookupType = "outerHTML",
): string | undefined {
  const targetNode = node;
  const value = (targetNode as Partial<Record<LookupType, string>>)[lookup];

  return value ?? undefined;
}
