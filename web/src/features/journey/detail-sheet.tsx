import type { CSSProperties } from "react";
import { places } from "./data";
import type { JourneyState, Place } from "./types";

type DetailSheetProps = {
  journey: JourneyState;
  place: Place | null;
  onArrive: () => void;
  onClose: () => void;
  onToggleSaved: () => void;
};

export function DetailSheet({
  journey,
  place,
  onArrive,
  onClose,
  onToggleSaved,
}: DetailSheetProps) {
  const placeIndex = place
    ? places.findIndex((item) => item.id === place.id)
    : -1;
  const isDone = place ? journey.statuses[place.id] === "done" : false;
  const isSaved = place ? journey.savedPlaceIds.includes(place.id) : false;

  return (
    <div
      className={`detail-sheet ${place ? "open" : ""}`}
      aria-hidden={!place}
    >
      <button
        className="sheet-backdrop"
        onClick={onClose}
        aria-label="Close place details"
      />
      {place ? (
        <article className="sheet-content" aria-label={place.title}>
          <button
            className="sheet-close"
            onClick={onClose}
            aria-label="Close place details"
          >
            ×
          </button>
          <div
            className="sheet-visual"
            style={{ "--image": place.image } as CSSProperties}
          >
            <span className="sheet-category">{place.category}</span>
            <span className="sheet-number">
              {String(placeIndex + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="sheet-copy">
            <p className="eyebrow">{place.time} · TODAY</p>
            <h2>{place.title}</h2>
            <p className="sheet-subtitle">{place.subtitle}</p>
            <div className="fact-grid">
              <div className="fact">
                <span>Suggested time</span>
                <strong>{place.duration}</strong>
              </div>
              <div className="fact">
                <span>From last stop</span>
                <strong>{place.walk}</strong>
              </div>
              <div className="fact">
                <span>Total distance</span>
                <strong>{place.distance}</strong>
              </div>
            </div>
            <div className="story-block">
              <h3>Why it matters</h3>
              <p>{place.story}</p>
            </div>
            <div className="sheet-actions">
              <button
                className={`secondary-button ${isSaved ? "saved" : ""}`}
                onClick={onToggleSaved}
              >
                {isSaved ? "♥ Saved" : "♡ Save place"}
              </button>
              <button
                className="primary-button"
                disabled={isDone}
                onClick={onArrive}
              >
                {isDone ? "Place completed" : "Simulate arrival"}
              </button>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  );
}
