import type { CSSProperties, RefObject } from "react";
import { places } from "./data";
import type { JourneyState } from "./types";

type TimelineProps = {
  journey: JourneyState;
  itemRefs: RefObject<Record<string, HTMLElement | null>>;
  onAdjust: () => void;
  onSelectPlace: (placeId: string) => void;
};

export function Timeline({
  journey,
  itemRefs,
  onAdjust,
  onSelectPlace,
}: TimelineProps) {
  return (
    <section className="journey-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR DAY</p>
          <h2>Today&apos;s Timeline</h2>
        </div>
        <button className="text-button" onClick={onAdjust}>
          Adjust trip <span>→</span>
        </button>
      </div>
      <div className="timeline">
        {places.map((place) => {
          const status = journey.statuses[place.id];
          return (
            <article
              className={`timeline-item ${status} ${
                journey.selectedPlaceId === place.id ? "active" : ""
              }`}
              key={place.id}
              ref={(node) => {
                itemRefs.current[place.id] = node;
              }}
            >
              <time className="timeline-time">{place.time}</time>
              <span className="timeline-node" aria-hidden="true" />
              <button
                className="place-card"
                aria-label={`View details for ${place.title}`}
                onClick={() => onSelectPlace(place.id)}
              >
                <span
                  className="place-image"
                  style={{ "--image": place.image } as CSSProperties}
                />
                <span className="place-copy">
                  <h3>{place.title}</h3>
                  <p>{place.subtitle}</p>
                  <span className="place-meta">
                    <span>◷ {place.duration}</span>
                    <span>↗ {place.walk}</span>
                  </span>
                </span>
                <span className="place-arrow">›</span>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
