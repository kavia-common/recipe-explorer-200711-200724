import React, { useMemo, useState } from "react";

function normalizeCsv(value) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
}

// PUBLIC_INTERFACE
export default function SearchBar({ initialValue = "", onSearch }) {
  /** Search input for comma-separated ingredients. */
  const [value, setValue] = useState(initialValue);

  const tokensCount = useMemo(() => {
    const parts = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length;
  }, [value]);

  function handleSubmit(e) {
    e.preventDefault();
    const normalized = normalizeCsv(value);
    if (!normalized) {
      // Empty search means clear search mode.
      onSearch("");
      return;
    }
    onSearch(normalized);
  }

  return (
    <form className="searchBar" onSubmit={handleSubmit} role="search" aria-label="Search recipes">
      <div className="searchInputWrap">
        <label className="srOnly" htmlFor="ingredientSearch">
          Search by ingredients (comma-separated)
        </label>
        <input
          id="ingredientSearch"
          className="searchInput"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by ingredients (e.g., chicken, garlic, lemon)…"
          autoComplete="off"
        />
        <div className="searchHint" aria-live="polite">
          {tokensCount > 0 ? `${tokensCount} ingredient${tokensCount === 1 ? "" : "s"}` : "Tip: separate with commas"}
        </div>
      </div>

      <div className="searchActions">
        <button className="btn btnPrimary" type="submit">
          Search
        </button>
        <button
          className="btn btnGhost"
          type="button"
          onClick={() => {
            setValue("");
            onSearch("");
          }}
        >
          Clear
        </button>
      </div>
    </form>
  );
}
