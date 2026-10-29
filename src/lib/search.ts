import { Product } from "@/data/products";

// Category synonym and token mappings for smart ecommerce matching
const SYNONYMS: Record<string, string[]> = {
  tt: ["table", "tennis", "racket", "rackets", "blade", "rubber", "balls"],
  racket: ["racket", "rackets", "blade", "bat", "paddle"],
  rackets: ["racket", "rackets", "blade", "bat", "paddle"],
  blade: ["blade", "racket", "carbon", "wood"],
  rubber: ["rubber", "rxton", "sheet", "pimples"],
  ball: ["ball", "balls", "ittf"],
  balls: ["ball", "balls", "ittf"],
  shoe: ["shoe", "shoes", "footwear", "court"],
  shoes: ["shoe", "shoes", "footwear", "court"],
  footwear: ["footwear", "shoe", "shoes"],
  jersey: ["jersey", "jerseys", "tshirt", "t-shirt", "shirt", "apparel"],
  jerseys: ["jersey", "jerseys", "tshirt", "t-shirt", "shirt", "apparel"],
  shirt: ["shirt", "tshirt", "t-shirt", "jersey", "apparel"],
  shorts: ["shorts", "short", "apparel", "wear"],
  apparel: ["apparel", "jersey", "shorts", "shirt", "clothing"],
  case: ["case", "hardcase", "cover", "bag", "protection"],
  towel: ["towel", "absorbency", "accessories"],
};

/**
 * Normalizes query string: strips accents, lowercases, trims extra spaces.
 */
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Match a single search token against a product.
 */
function tokenMatchesProduct(token: string, product: Product): boolean {
  if (!token) return true;

  // 1. Direct fields check
  const searchCorpus = [
    product.name,
    product.series,
    product.subtitle || "",
    product.brand,
    product.category,
    product.description,
    ...(product.tags || []),
    product.specs?.bladeType || "",
    product.specs?.rubber || "",
    product.specs?.playingStyle || "",
  ]
    .join(" ")
    .toLowerCase();

  if (searchCorpus.includes(token)) return true;

  // 2. Singular / Plural variation (e.g. racket vs rackets, ball vs balls)
  if (token.endsWith("s") && searchCorpus.includes(token.slice(0, -1))) {
    return true;
  }
  if (!token.endsWith("s") && searchCorpus.includes(`${token}s`)) {
    return true;
  }

  // 3. Synonym mapping
  const synonyms = SYNONYMS[token];
  if (synonyms) {
    for (const syn of synonyms) {
      if (searchCorpus.includes(syn)) return true;
    }
  }

  return false;
}

/**
 * Searches a list of products with broad keyword, synonym, and category awareness.
 */
export function searchProducts(query: string, products: Product[]): Product[] {
  const clean = normalizeQuery(query);
  if (!clean) return [];

  const tokens = clean.split(" ").filter((t) => t.length > 0);
  if (tokens.length === 0) return [];

  // If query is specifically "tt racket" or starts with "tt", "tt" indicates table tennis context
  const effectiveTokens = tokens.filter((t) => {
    // If multiple tokens exist and one is "tt", the other tokens (e.g. "racket") are specific
    if (tokens.length > 1 && t === "tt") return false;
    return true;
  });

  const queryToMatch = effectiveTokens.length > 0 ? effectiveTokens : tokens;

  return products.filter((product) => {
    // Every effective token must match the product or its category/synonyms
    return queryToMatch.every((tok) => tokenMatchesProduct(tok, product));
  });
}
