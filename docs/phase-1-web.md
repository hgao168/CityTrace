# Phase 1: Website Foundation

Phase 1 makes the deployed website the reference CityTrace client before native
apps and the shared backend expand.

## Goal

Turn the visual MVP into a maintainable Next.js product surface without
changing its accepted desktop or mobile experience.

## Delivered

- Replaced injected HTML and imperative DOM scripting with typed React
  components.
- Added shared `Place`, `PlaceStatus`, and `JourneyState` domain types.
- Moved Amsterdam trip content into a dedicated data module.
- Centralized selection, progress, arrival, saves, map zoom, notifications,
  detail presentation, and toast behavior in a journey hook.
- Preserved versioned local persistence for progress and saved places.
- Kept Cloudflare Pages static export and the production URL unchanged.

## Website Boundaries

```text
web/src/app/
  page.tsx                    Route composition

web/src/features/journey/
  data.ts                     Seed trip content
  types.ts                    Domain contracts
  storage.ts                  Versioned browser persistence
  use-journey.ts              Journey state and actions
  citytrace-app.tsx           Feature composition
  sidebar.tsx                 App navigation
  timeline.tsx                Ordered trip stops
  map-panel.tsx               Route illustration and map controls
  detail-sheet.tsx            Place story and arrival actions
```

## Phase 1 Exit Criteria

- Static production build succeeds.
- Desktop and mobile layouts match the architect reference.
- Timeline and map selection remain synchronized.
- Save and arrival state survive reloads.
- Keyboard dismissal and notification feedback work.
- The website no longer depends on `dangerouslySetInnerHTML` or a legacy
  public script.

## Next Website Phase

Replace the illustrated map with MapLibre and GeoJSON while retaining the
current `Place` and journey-state contracts. Backend integration should follow
through a repository interface so static fixtures remain available for local
development and previews.
