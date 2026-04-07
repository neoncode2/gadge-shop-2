export function uniqueValues(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

export function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function sortByReference(values, reference) {
  const referenceMap = new Map(reference.map((value, index) => [value, index]));

  return [...values].sort((first, second) => {
    const firstIndex = referenceMap.has(first) ? referenceMap.get(first) : Number.MAX_SAFE_INTEGER;
    const secondIndex = referenceMap.has(second) ? referenceMap.get(second) : Number.MAX_SAFE_INTEGER;

    if (firstIndex !== secondIndex) return firstIndex - secondIndex;
    return first.localeCompare(second);
  });
}
