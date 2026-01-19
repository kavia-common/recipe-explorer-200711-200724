import React from "react";

function RatingPill({ avg, count }) {
  const has = avg !== null && avg !== undefined;
  return (
    <div className="ratingPill" aria-label={has ? `Average rating ${avg} out of 5` : "No ratings yet"}>
      <span className="ratingStar" aria-hidden="true">
        ★
      </span>
      <span className="ratingValue">{has ? Number(avg).toFixed(2) : "—"}</span>
      <span className="ratingCount">({count})</span>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function RecipeGrid({ recipes, onSelectRecipe, view = "grid" }) {
  /** Displays recipes as a grid or list. */
  const cls = view === "list" ? "recipeList" : "recipeGrid";

  return (
    <div className={cls} aria-label="Recipes">
      {recipes.map((r) => (
        <button
          key={r.id}
          type="button"
          className="recipeCard"
          onClick={() => onSelectRecipe(r.id)}
        >
          <div className="recipeCardTop">
            <div className="recipeTitle">{r.title}</div>
            <RatingPill avg={r.avg_rating} count={r.ratings_count} />
          </div>

          {r.category_name ? <div className="recipeCategory">{r.category_name}</div> : null}
          {r.description ? <div className="recipeDesc">{r.description}</div> : null}

          <div className="recipeCardFooter">
            <span className="recipeOpen">View details</span>
          </div>
        </button>
      ))}
    </div>
  );
}
