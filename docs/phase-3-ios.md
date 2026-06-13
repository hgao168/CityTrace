# Phase 3: iOS Client

Phase 3 delivers the native SwiftUI client described in
[architecture.md](architecture.md), built on the shared `/v1` API.

## Goal

Reach journey parity with the website on iOS while reusing the shared API
contract and domain model.

## Stack

- Swift and SwiftUI.
- Core Location and region monitoring.
- MapKit for route and place rendering.
- Shared CityTrace backend API.

## Foundation In Place

The `CityTraceKit` Swift package already maps the contract endpoints:

- `fetchCities()` -> `GET /v1/cities`
- `fetchPlaces(cityId:)` -> `GET /v1/cities/{cityId}/places`
- `fetchTrip(tripId:)` -> `GET /v1/trips/{tripId}`
- `updateTripProgress(tripId:progress:)` -> `PATCH /v1/trips/{tripId}/progress`
- `fetchSavedPlaces(userId:)` -> `GET /v1/users/{userId}/saved-places`
- `savePlace(userId:placeId:)` -> `PUT .../saved-places/{placeId}`
- `removeSavedPlace(userId:placeId:)` -> `DELETE .../saved-places/{placeId}`

## Scope

- Trip timeline with ordered stops.
- MapKit route and place rendering.
- Place detail with story and arrival actions.
- Saved places synced through the API.
- Arrival detection using Core Location region monitoring.
- Local persistence so progress and saves survive relaunch and offline use.

## Exit Criteria

- Timeline and map selection stay synchronized.
- Arrival and progress updates post to `/v1` and reconcile on relaunch.
- Saved places round-trip through the API.
- The app runs against local fixtures when the backend is unavailable.
- Security testing covers the shipped iOS client and its API integration, and
	critical findings are fixed before the phase closes.
- `CityTraceKit` tests build and pass in the supported toolchain.

## Next Phase

[Phase 4: Android Client](phase-4-android.md) mirrors this scope on Compose.
