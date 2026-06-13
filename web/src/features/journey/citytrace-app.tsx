"use client";

import { useEffect, useRef } from "react";
import { BrandMark } from "./brand-mark";
import { DetailSheet } from "./detail-sheet";
import { MapPanel } from "./map-panel";
import { Sidebar } from "./sidebar";
import { Timeline } from "./timeline";
import { places } from "./data";
import { useJourney } from "./use-journey";

export function CityTraceApp() {
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const {
    activeView,
    changeMapScale,
    closeDetails,
    currentPlace,
    detailPlace,
    doneCount,
    focusMap,
    hasNotification,
    journey,
    mapScale,
    markArrived,
    recenterMap,
    selectPlace,
    selectView,
    showNotification,
    showToast,
    toast,
    toggleSaved,
  } = useJourney();

  useEffect(() => {
    itemRefs.current[journey.selectedPlaceId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [journey.selectedPlaceId]);

  const openPlace = (placeId: string) => selectPlace(placeId, true);
  const progress = (doneCount / places.length) * 100;

  return (
    <>
      <div className="app-shell">
        <Sidebar activeView={activeView} onSelectView={selectView} />
        <main>
          <header className="topbar">
            <div className="mobile-brand">
              <BrandMark mini />
              <strong>CityTrace</strong>
            </div>
            <button className="city-picker" aria-label="Change city">
              <span className="flag">🇳🇱</span>
              <span className="city-name">Amsterdam</span>
              <span aria-hidden="true">⌄</span>
            </button>
            <div className="topbar-actions">
              <button
                className="icon-button"
                aria-label="Find my location"
                onClick={() => {
                  focusMap();
                  showToast("Centered on your current location");
                }}
              >
                ⌖
              </button>
              <button
                className="icon-button"
                aria-label="View notifications"
                onClick={showNotification}
              >
                ♢
                {hasNotification ? (
                  <span className="notification-dot" />
                ) : null}
              </button>
            </div>
          </header>

          <section className="hero">
            <div>
              <p className="date-label">June 6 · Saturday</p>
              <h1>Good morning. Ready to explore?</h1>
              <p>Today, follow the canals through Amsterdam&apos;s Golden Age.</p>
            </div>
            <div className="progress-card">
              <div
                className="progress-ring"
                style={{
                  background: `conic-gradient(var(--coral) ${progress}%, #e1e2dc 0)`,
                }}
              >
                <span>
                  {doneCount}/{places.length}
                </span>
              </div>
              <div>
                <span>Today&apos;s Progress</span>
                <strong>
                  {doneCount} {doneCount === 1 ? "place" : "places"} completed
                </strong>
              </div>
            </div>
          </section>

          <section className="stats-row" aria-label="Trip overview">
            <TripStat icon="↗" tone="coral" value="5.8 km" label="Walking distance" />
            <TripStat icon="◷" tone="blue" value="7 hours" label="Estimated duration" />
            <TripStat icon="✦" tone="gold" value="6" label="Curated places" />
            <TripStat icon="♧" tone="green" value="Easy" label="Route intensity" />
          </section>

          <div className="content-grid">
            <Timeline
              journey={journey}
              itemRefs={itemRefs}
              onAdjust={() =>
                showToast(
                  "Your trip is on schedule and should finish before 5:00 PM.",
                )
              }
              onSelectPlace={openPlace}
            />
            <MapPanel
              currentPlace={currentPlace}
              journey={journey}
              mapScale={mapScale}
              onRecenter={recenterMap}
              onScaleChange={changeMapScale}
              onSelectPlace={openPlace}
            />
          </div>
        </main>
      </div>

      <DetailSheet
        journey={journey}
        place={detailPlace}
        onArrive={markArrived}
        onClose={closeDetails}
        onToggleSaved={toggleSaved}
      />
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  );
}

type TripStatProps = {
  icon: string;
  label: string;
  tone: string;
  value: string;
};

function TripStat({ icon, label, tone, value }: TripStatProps) {
  return (
    <div className="stat">
      <span className={`stat-icon ${tone}`}>{icon}</span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
