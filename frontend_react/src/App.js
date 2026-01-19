import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  getCategories,
  getRecipeDetail,
  getRecipes,
  searchRecipesByIngredients,
} from "./api/client";
import CategorySidebar from "./components/CategorySidebar";
import SearchBar from "./components/SearchBar";
import RecipeGrid from "./components/RecipeGrid";
import RecipeDetail from "./components/RecipeDetail";
import Loading from "./components/Loading";
import ErrorState from "./components/ErrorState";

function useDebounced(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

// PUBLIC_INTERFACE
function App() {
  /** Recipe Explorer main application component. */
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Search mode: when non-empty, we use /search and ignore category filter (by design).
  const [ingredientSearchCsv, setIngredientSearchCsv] = useState("");
  const debouncedSearchCsv = useDebounced(ingredientSearchCsv, 250);

  const [view, setView] = useState("grid"); // "grid" | "list"

  const [recipes, setRecipes] = useState([]);
  const [recipesMeta, setRecipesMeta] = useState({ page: 1, size: 12, total: 0 });
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesError, setRecipesError] = useState("");

  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [recipeDetail, setRecipeDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const pageTitle = useMemo(() => {
    if (debouncedSearchCsv) return "Ingredient search results";
    if (selectedCategoryId === null) return "All recipes";
    const cat = categories.find((c) => c.id === selectedCategoryId);
    return cat ? cat.name : "Recipes";
  }, [debouncedSearchCsv, selectedCategoryId, categories]);

  async function loadCategories() {
    setCategoriesLoading(true);
    setCategoriesError("");
    try {
      const list = await getCategories();
      setCategories(list);
    } catch (e) {
      setCategoriesError(e?.message || "Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function loadRecipes({ page = 1, size = 12 } = {}) {
    setRecipesLoading(true);
    setRecipesError("");
    try {
      if (debouncedSearchCsv) {
        const items = await searchRecipesByIngredients({ ingredientsCsv: debouncedSearchCsv, page, size });
        setRecipes(items);
        setRecipesMeta({ page, size, total: items.length });
      } else {
        const data = await getRecipes({
          categoryId: selectedCategoryId,
          page,
          size,
        });
        setRecipes(data.items || []);
        setRecipesMeta({ page: data.page, size: data.size, total: data.total });
      }
    } catch (e) {
      setRecipesError(e?.message || "Failed to load recipes");
    } finally {
      setRecipesLoading(false);
    }
  }

  async function loadRecipeDetail(id) {
    setSelectedRecipeId(id);
    setDetailLoading(true);
    setDetailError("");
    try {
      const detail = await getRecipeDetail(id);
      setRecipeDetail(detail);
    } catch (e) {
      setRecipeDetail(null);
      setDetailError(e?.message || "Failed to load recipe");
    } finally {
      setDetailLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load recipes when filters change
  useEffect(() => {
    loadRecipes({ page: 1, size: 12 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, debouncedSearchCsv]);

  // Close detail on ESC
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        setSelectedRecipeId(null);
        setRecipeDetail(null);
        setDetailError("");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSelectCategory(categoryId) {
    setSelectedCategoryId(categoryId);
    // Switching categories clears ingredient search for predictable behavior.
    setIngredientSearchCsv("");
  }

  const activeFilterBadge = useMemo(() => {
    if (debouncedSearchCsv) return `Ingredients: ${debouncedSearchCsv}`;
    if (selectedCategoryId === null) return "Browsing: All";
    const cat = categories.find((c) => c.id === selectedCategoryId);
    return cat ? `Category: ${cat.name}` : "Category selected";
  }, [debouncedSearchCsv, selectedCategoryId, categories]);

  return (
    <div className="App">
      <header className="appHeader">
        <div className="headerInner">
          <div className="brand" aria-label="Recipe Explorer">
            <div className="brandMark" aria-hidden="true" />
            <div className="brandText">
              <div className="brandTitle">Recipe Explorer</div>
              <div className="brandSub">Browse · Search · Rate</div>
            </div>
          </div>

          <SearchBar
            initialValue={ingredientSearchCsv}
            onSearch={(csv) => {
              setIngredientSearchCsv(csv);
              // Search mode ignores category; keep selected but does not apply.
            }}
          />
        </div>
      </header>

      <div className="shell">
        <CategorySidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
          loading={categoriesLoading}
          error={categoriesError}
        />

        <main className="main">
          <div className="mainTopRow">
            <div>
              <div className="pageTitle">{pageTitle}</div>
              <div className="kpiPills" style={{ marginTop: 8 }}>
                <span className="badge">{activeFilterBadge}</span>
                {!debouncedSearchCsv ? (
                  <span className="badge">
                    Total: {recipesMeta.total}
                  </span>
                ) : (
                  <span className="badge">Matches: {recipes.length}</span>
                )}
              </div>
            </div>

            <div className="viewToggles" aria-label="View toggles">
              <button
                type="button"
                className={`btn btnSmall ${view === "grid" ? "btnPrimary" : ""}`}
                onClick={() => setView("grid")}
              >
                Grid
              </button>
              <button
                type="button"
                className={`btn btnSmall ${view === "list" ? "btnPrimary" : ""}`}
                onClick={() => setView("list")}
              >
                List
              </button>
            </div>
          </div>

          {recipesLoading ? (
            <Loading label="Loading recipes…" />
          ) : recipesError ? (
            <ErrorState title="Unable to load recipes" message={recipesError} onRetry={() => loadRecipes({ page: 1, size: 12 })} />
          ) : recipes.length === 0 ? (
            <div className="muted">
              No recipes found. Try a different category, or search with fewer ingredients.
            </div>
          ) : (
            <RecipeGrid
              recipes={recipes}
              view={view}
              onSelectRecipe={(id) => loadRecipeDetail(id)}
            />
          )}

          {detailLoading ? (
            <div style={{ marginTop: 12 }}>
              <Loading label="Loading recipe detail…" />
            </div>
          ) : detailError ? (
            <ErrorState title="Unable to load recipe detail" message={detailError} onRetry={() => loadRecipeDetail(selectedRecipeId)} />
          ) : null}
        </main>
      </div>

      {recipeDetail ? (
        <RecipeDetail
          recipe={recipeDetail}
          onClose={() => {
            setSelectedRecipeId(null);
            setRecipeDetail(null);
            setDetailError("");
          }}
          onRatingCreated={async () => {
            // Refresh the detail (avg_rating/ratings_count) and list view counts after rating is added.
            const id = recipeDetail.id;
            await loadRecipeDetail(id);
            await loadRecipes({ page: recipesMeta.page, size: recipesMeta.size });
          }}
        />
      ) : null}
    </div>
  );
}

export default App;
