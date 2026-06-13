# Phase 2: Shared Backend

Phase 2 turns the local-first MVP into a versioned service so native clients can
depend on one source of truth, as described in
[architecture.md](architecture.md).

## Goal

Implement the `/v1` API in [api-contract.md](api-contract.md) and publish an
OpenAPI document before any native client depends on these endpoints.
Run this backend on Cloudflare for the production domain `citytrace.movenova.ai`.

## Scope

- Cities, places, and editorial stories.
- Trips, ordered stops, and progress.
- Saved places and traveler profiles.
- Geospatial route and proximity queries.

## Endpoints

```text
GET    /v1/cities
GET    /v1/cities/{cityId}/places
GET    /v1/trips/{tripId}
PATCH  /v1/trips/{tripId}/progress
GET    /v1/users/{userId}/saved-places
PUT    /v1/users/{userId}/saved-places/{placeId}
DELETE /v1/users/{userId}/saved-places/{placeId}
```

## Foundation

- TypeScript service.
- Cloudflare D1 for durable trip-progress and saved-place persistence.
- Geospatial proximity queries computed in the Worker from stored place
  coordinates.
- REST API under `/v1`.
- OpenAPI as the published client contract.
- Cloudflare Workers deployment for edge API execution.
- Production routing on `citytrace.movenova.ai` for `/v1/*` traffic.

## Deliverables

- `backend` workspace scaffolded as a Cloudflare Worker service.
- Contract endpoints implemented with seed data and in-memory persistence for
  fast integration.
- OpenAPI document published in `backend/openapi.yaml`.
- Worker configuration prepared for custom-domain routing.

## Data Migration

- Seed the database from the Amsterdam trip content used by the website.
- Preserve the existing `Place` and journey-state shapes so the web client can
  switch from fixtures to the API behind a repository interface.

## Exit Criteria

- All contract endpoints return shapes that match the OpenAPI document.
- Progress and saved-place writes are idempotent and durable.
- Geospatial proximity queries return ordered stops for a trip.
- The website can read trip and place data from `/v1` without UI changes.
- Security testing covers the published API and deployment configuration, and
  critical findings are fixed before the phase closes.
- Cloudflare deployment serves the API at the CityTrace production domain.

## Next Phase

[Phase 3: iOS Client](phase-3-ios.md) consumes this API through the shared
`CityTraceKit` package.
