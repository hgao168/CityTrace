# Phase 4: Android Client

Phase 4 delivers the native Jetpack Compose client described in
[architecture.md](architecture.md), built on the shared `/v1` API.

## Goal

Reach journey parity with the website and iOS on Android using the same API
contract and domain model.

## Stack

- Kotlin and Jetpack Compose.
- Android location and geofencing APIs.
- Google Maps or MapLibre for route and place rendering.
- Shared CityTrace backend API.

## Scope

- Shared API client mapping the contract endpoints in
  [api-contract.md](api-contract.md).
- Trip timeline with ordered stops.
- Map route and place rendering.
- Place detail with story and arrival actions.
- Saved places synced through the API.
- Arrival detection using geofencing.
- Local persistence for offline progress and saves.

## Exit Criteria

- Timeline and map selection stay synchronized.
- Arrival and progress updates post to `/v1` and reconcile on relaunch.
- Saved places round-trip through the API.
- The app runs against local fixtures when the backend is unavailable.
- Instrumented tests cover journey selection, progress, and persistence.
- Security testing covers the shipped Android client and its API integration,
  and critical findings are fixed before the phase closes.

## Next Phase

[Phase 5: WeChat Mini Program](phase-5-wechat.md) extends reach to WeChat.
