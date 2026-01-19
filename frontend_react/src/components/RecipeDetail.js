import React, { useEffect, useMemo, useState } from "react";
import { createRating, getRatings } from "../api/client";
import Loading from "./Loading";
import ErrorState from "./ErrorState";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function Stars({ value }) {
  const stars = Array.from({ length: 5 }).map((_, i) => (i < value ? "★" : "☆"));
  return (
    <span className="stars" aria-label={`${value} out of 5`}>
      {stars.join(" ")}
    </span>
  );
}

// PUBLIC_INTERFACE
export default function RecipeDetail({ recipe, onClose, onRatingCreated }) {
  /** Detail view for a recipe with ratings list and create form. */
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingsError, setRatingsError] = useState("");

  const [userName, setUserName] = useState("");
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const recipeId = recipe?.id;

  const ratingSummary = useMemo(() => {
    const avg = recipe?.avg_rating;
    const count = recipe?.ratings_count ?? 0;
    return { avg, count };
  }, [recipe]);

  async function loadRatings() {
    if (!recipeId) return;
    setRatingsLoading(true);
    setRatingsError("");
    try {
      const list = await getRatings(recipeId);
      setRatings(list);
    } catch (e) {
      setRatingsError(e?.message || "Failed to load ratings");
    } finally {
      setRatingsLoading(false);
    }
  }

  useEffect(() => {
    loadRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    const trimmed = userName.trim();
    if (!trimmed) {
      setSubmitError("Please enter your name.");
      return;
    }
    if (Number.isNaN(Number(score)) || score < 1 || score > 5) {
      setSubmitError("Score must be between 1 and 5.");
      return;
    }

    setSubmitting(true);
    try {
      await createRating(recipeId, {
        user_name: trimmed,
        score: Number(score),
        comment: comment.trim() ? comment.trim() : null,
      });
      setUserName("");
      setScore(5);
      setComment("");
      await loadRatings();
      if (onRatingCreated) onRatingCreated();
    } catch (e2) {
      setSubmitError(e2?.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  }

  if (!recipe) return null;

  return (
    <div className="detailOverlay" role="dialog" aria-modal="true" aria-label="Recipe detail">
      <div className="detailPanel">
        <div className="detailHeader">
          <div className="detailTitleWrap">
            <div className="detailTitle">{recipe.title}</div>
            <div className="detailMetaRow">
              {recipe.category_name ? <span className="badge">{recipe.category_name}</span> : null}
              <span className="muted">
                Avg: {ratingSummary.avg !== null && ratingSummary.avg !== undefined ? Number(ratingSummary.avg).toFixed(2) : "—"} ·{" "}
                {ratingSummary.count} rating{ratingSummary.count === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <button className="iconBtn" type="button" onClick={onClose} aria-label="Close detail view">
            ×
          </button>
        </div>

        <div className="detailBody">
          {recipe.description ? <p className="detailDescription">{recipe.description}</p> : null}

          <div className="detailColumns">
            <section className="detailSection">
              <h3 className="detailSectionTitle">Ingredients</h3>
              {recipe.ingredients?.length ? (
                <ul className="ingredientList">
                  {recipe.ingredients.map((i) => (
                    <li key={i.id} className="ingredientItem">
                      <span className="ingredientName">{i.name}</span>
                      {i.quantity ? <span className="ingredientQty">{i.quantity}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="muted">No ingredients listed.</div>
              )}
            </section>

            <section className="detailSection">
              <h3 className="detailSectionTitle">Instructions</h3>
              {recipe.instructions ? (
                <div className="instructions">{recipe.instructions}</div>
              ) : (
                <div className="muted">No instructions provided.</div>
              )}
            </section>
          </div>

          <section className="detailSection ratingsSection">
            <h3 className="detailSectionTitle">Ratings</h3>

            {ratingsLoading ? (
              <Loading label="Loading ratings…" />
            ) : ratingsError ? (
              <ErrorState title="Unable to load ratings" message={ratingsError} onRetry={loadRatings} />
            ) : ratings.length === 0 ? (
              <div className="muted">No ratings yet. Be the first to rate!</div>
            ) : (
              <div className="ratingsList" aria-label="Ratings list">
                {ratings.map((r) => (
                  <div key={r.id} className="ratingCard">
                    <div className="ratingCardTop">
                      <div className="ratingUser">{r.user_name}</div>
                      <Stars value={r.score} />
                    </div>
                    {r.comment ? <div className="ratingComment">{r.comment}</div> : null}
                    <div className="ratingTime">{formatDate(r.created_at)}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="divider" />

            <h4 className="detailSubTitle">Add your rating</h4>
            <form className="ratingForm" onSubmit={handleSubmit}>
              <div className="formRow">
                <label className="formLabel" htmlFor="ratingName">
                  Name
                </label>
                <input
                  id="ratingName"
                  className="input"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                />
              </div>

              <div className="formRow">
                <label className="formLabel" htmlFor="ratingScore">
                  Score
                </label>
                <select
                  id="ratingScore"
                  className="input"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="formRow">
                <label className="formLabel" htmlFor="ratingComment">
                  Comment (optional)
                </label>
                <textarea
                  id="ratingComment"
                  className="input textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you think?"
                  maxLength={2000}
                />
              </div>

              {submitError ? <div className="errorText">{submitError}</div> : null}

              <div className="formActions">
                <button className="btn btnPrimary" type="submit" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit rating"}
                </button>
                <button className="btn btnGhost" type="button" onClick={onClose}>
                  Close
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
