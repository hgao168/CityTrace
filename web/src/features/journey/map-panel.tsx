import type { CSSProperties } from "react";
import type { JourneyState, Place } from "./types";

type MapPanelProps = {
  currentPlace: Place;
  journey: JourneyState;
  mapScale: number;
  onRecenter: () => void;
  onScaleChange: (change: number) => void;
  onSelectPlace: (placeId: string) => void;
  places: Place[];
};

export function MapPanel({
  currentPlace,
  journey,
  mapScale,
  onRecenter,
  onScaleChange,
  onSelectPlace,
  places,
}: MapPanelProps) {
  const scaleStyle = { transform: `scale(${mapScale})` };

  return (
    <section className="map-panel">
      <div className="map-toolbar">
        <div>
          <p className="eyebrow">LIVE ROUTE</p>
          <h2>Trip Map</h2>
        </div>
        <div className="map-controls">
          <button aria-label="Zoom in" onClick={() => onScaleChange(0.1)}>
            +
          </button>
          <button aria-label="Zoom out" onClick={() => onScaleChange(-0.1)}>
            −
          </button>
        </div>
      </div>
      <div className="map">
        <svg
          className="map-art"
          style={scaleStyle}
          viewBox="0 0 660 520"
          role="img"
          aria-label="Amsterdam day-tour route map"
        >
          <rect width="660" height="520" fill="#e9e4d8" />
          <g className="city-blocks">
            <path d="M0 0h190l-15 80L85 96 0 76Z" />
            <path d="M215 0h210l-22 63-170 22Z" />
            <path d="M455 0h205v95l-85-20-133-15Z" />
            <path d="m0 110 92 8 80 34-24 95L0 218Z" />
            <path d="m205 108 186-21 22 98-189 37-56-55Z" />
            <path d="m440 90 146 12 74 35v100l-172-29Z" />
            <path d="m0 254 139 19 43 104-182 6Z" />
            <path d="m185 247 231-36 30 124-231 30Z" />
            <path d="m469 233 191 31v122l-167-44Z" />
            <path d="m0 409 170-8 44 119H0Z" />
            <path d="m200 390 253-30 37 160H236Z" />
            <path d="m510 375 150 35v110H529Z" />
          </g>
          <g className="water">
            <path d="M-30 181C96 132 117 220 233 170S398 86 700 183" />
            <path d="M-20 296c110-33 162 50 276 4s233-96 433 11" />
            <path d="M89-20c39 99-15 151 26 222s17 172 84 338" />
            <path d="M497-20c-13 92 25 147 1 225s47 165 23 335" />
          </g>
          <g className="streets">
            <path d="M0 60 660 475M41 0l498 520M660 60 50 487M290 0l-47 520M0 447 660 131" />
          </g>
          <path
            className="route-path"
            d="M103 378 C160 342 151 282 217 258 S292 313 347 276 S380 185 445 168 S484 248 530 231 S546 149 589 113"
          />
        </svg>
        <div className="map-pins" style={scaleStyle}>
          {places.map((place, index) => {
            const status = journey.statuses[place.id];
            return (
              <button
                className={`map-pin ${status === "done" ? "done" : ""} ${
                  journey.selectedPlaceId === place.id ? "selected" : ""
                }`}
                key={place.id}
                style={
                  {
                    left: `${place.position.left}%`,
                    top: `${place.position.top}%`,
                  } as CSSProperties
                }
                aria-label={place.title}
                onClick={() => onSelectPlace(place.id)}
              >
                <span>{status === "done" ? "✓" : index + 1}</span>
              </button>
            );
          })}
        </div>
        <div
          className="current-location"
          aria-label="Current location"
          style={{
            left: `${currentPlace.position.left}%`,
            top: `${currentPlace.position.top}%`,
          }}
        >
          <span />
        </div>
        <div className="map-legend">
          <span>
            <i className="legend-dot active" /> Next stop
          </span>
          <span>
            <i className="legend-dot done" /> Completed
          </span>
        </div>
        <button
          className="recenter-button"
          aria-label="Recenter route"
          onClick={onRecenter}
        >
          ⌖
        </button>
      </div>
    </section>
  );
}
