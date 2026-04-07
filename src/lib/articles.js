import { articles } from "@/data/articles";

export function getArticles() {
  return articles;
}

export function getFeaturedArticle() {
  return articles[0];
}

export function getArticleBySlug(slug) {
  return articles.find((article) => article.slug === slug);
}

export function getRelatedArticles(slug, limit = 3) {
  const currentArticle = getArticleBySlug(slug);

  if (!currentArticle) {
    return [];
  }

  const sameCategory = articles.filter(
    (article) => article.slug !== slug && article.category === currentArticle.category
  );
  const fallback = articles.filter(
    (article) =>
      article.slug !== slug &&
      article.category !== currentArticle.category &&
      !sameCategory.some((item) => item.slug === article.slug)
  );

  return [...sameCategory, ...fallback].slice(0, limit);
}
