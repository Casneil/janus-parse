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

export function removeBlackListTags(
  removeBlacklistTags: string[],
  defaultBlacklistTags: Set<string>,
) {
  for (const tag of removeBlacklistTags) {
    defaultBlacklistTags.delete(tag);
  }

  return defaultBlacklistTags;
}

export function addBlackListTags(
  addBlacklistTags: string[],
  defaultBlacklistTags: Set<string>,
) {
  for (const tag of addBlacklistTags) {
    defaultBlacklistTags.add(tag);
  }

  return defaultBlacklistTags;
}

export function removeNodes(
  nodesToRemove: HTMLElement[] | NodeListOf<Element>,
) {
  for (const node of nodesToRemove) {
    node.remove();
  }

  return nodesToRemove;
}
