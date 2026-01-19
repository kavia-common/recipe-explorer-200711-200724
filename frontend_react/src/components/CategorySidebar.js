import React from "react";

// PUBLIC_INTERFACE
export default function CategorySidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  loading,
  error,
}) {
  /** Sidebar for category selection. */
  return (
    <aside className="sidebar" aria-label="Recipe categories">
      <div className="sidebarHeader">
        <div className="sidebarTitle">Categories</div>
      </div>

      {loading ? (
        <div className="sidebarMeta">Loading…</div>
      ) : error ? (
        <div className="sidebarMeta errorText">{error}</div>
      ) : (
        <nav className="categoryList">
          <button
            type="button"
            className={`categoryItem ${selectedCategoryId === null ? "active" : ""}`}
            onClick={() => onSelectCategory(null)}
          >
            All recipes
          </button>

          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`categoryItem ${selectedCategoryId === c.id ? "active" : ""}`}
              onClick={() => onSelectCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </nav>
      )}
    </aside>
  );
}
