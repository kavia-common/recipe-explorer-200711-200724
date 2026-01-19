/**
 * Minimal API client for Recipe Explorer backend.
 * Uses REACT_APP_API_BASE_URL to target the running backend (e.g. http://localhost:3001).
 */

const DEFAULT_BASE_URL = "http://localhost:3001";

function getApiBaseUrl() {
  const base = process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL;
  return base.replace(/\/+$/, "");
}

async function request(path, { method = "GET", query, body } = {}) {
  const base = getApiBaseUrl();
  const url = new URL(`${base}${path}`);

  if (query && typeof query === "object") {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      url.searchParams.set(k, String(v));
    });
  }

  const res = await fetch(url.toString(), {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Try to parse JSON if any
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && data.detail) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// PUBLIC_INTERFACE
export async function getCategories() {
  /** Fetch all categories. */
  return request("/categories");
}

// PUBLIC_INTERFACE
export async function getRecipes({ categoryId, ingredient, page = 1, size = 12 } = {}) {
  /** List recipes with optional filters and pagination. */
  return request("/recipes", {
    query: {
      category_id: categoryId,
      ingredient,
      page,
      size,
    },
  });
}

// PUBLIC_INTERFACE
export async function getRecipeDetail(recipeId) {
  /** Fetch a single recipe detail including ingredients and rating summary. */
  return request(`/recipes/${encodeURIComponent(recipeId)}`);
}

// PUBLIC_INTERFACE
export async function searchRecipesByIngredients({ ingredientsCsv, page = 1, size = 12 }) {
  /** Search recipes matching ALL comma-separated ingredients (case-insensitive exact match). */
  return request("/search", {
    query: {
      ingredients: ingredientsCsv,
      page,
      size,
    },
  });
}

// PUBLIC_INTERFACE
export async function getRatings(recipeId) {
  /** List ratings for a recipe. */
  return request(`/recipes/${encodeURIComponent(recipeId)}/ratings`);
}

// PUBLIC_INTERFACE
export async function createRating(recipeId, { user_name, score, comment }) {
  /** Create a rating for a recipe. */
  return request(`/recipes/${encodeURIComponent(recipeId)}/ratings`, {
    method: "POST",
    body: { user_name, score, comment },
  });
}
