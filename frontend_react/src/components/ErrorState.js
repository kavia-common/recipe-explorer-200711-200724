import React from "react";

// PUBLIC_INTERFACE
export default function ErrorState({ title = "Something went wrong", message, onRetry }) {
  /** Displays a styled error block with optional retry. */
  return (
    <div className="errorState" role="alert">
      <div className="errorTitle">{title}</div>
      {message ? <div className="errorMessage">{message}</div> : null}
      {onRetry ? (
        <button className="btn btnPrimary" onClick={onRetry} type="button">
          Retry
        </button>
      ) : null}
    </div>
  );
}
