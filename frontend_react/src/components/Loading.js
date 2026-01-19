import React from "react";

// PUBLIC_INTERFACE
export default function Loading({ label = "Loading…" }) {
  /** Accessible loading indicator. */
  return (
    <div className="loading" role="status" aria-live="polite" aria-busy="true">
      <div className="spinner" aria-hidden="true" />
      <div className="loadingLabel">{label}</div>
    </div>
  );
}
