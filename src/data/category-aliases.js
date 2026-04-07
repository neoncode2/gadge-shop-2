export const featuredCategoryAliases = ["Accessories", "Controllers"];

export const categoryQueryAliases = {
  Accessories: ["Power Bank", "Charger & Adapter", "Speaker & Headphone", "Earbuds"],
  Controllers: ["Gaming"],
};

export function mergeCategoryLists(...lists) {
  return Array.from(new Set(lists.flat().filter(Boolean)));
}
