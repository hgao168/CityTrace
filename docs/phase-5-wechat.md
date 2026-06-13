# Phase 5: WeChat Mini Program

Phase 5 delivers the WeChat client described in
[architecture.md](architecture.md), reusing the shared `/v1` API.

## Goal

Bring the CityTrace journey to WeChat with platform-appropriate UX while keeping
the shared API contract and domain model.

## Stack

- WeChat Mini Program framework.
- WeChat location and map components.
- Shared CityTrace backend API.

## Scope

- API client mapping the contract endpoints in
  [api-contract.md](api-contract.md), routed through approved request domains.
- Trip timeline with ordered stops.
- Map route and place rendering with WeChat map components.
- Place detail with story and arrival actions.
- Saved places synced through the API.
- Arrival detection using WeChat location APIs.
- Local storage fallback for progress and saves.

## Platform Constraints

- Network requests must use HTTPS and registered request domains.
- Respect Mini Program package size limits with lazy-loaded content.
- Map and location features follow WeChat permission prompts.

## Exit Criteria

- Timeline and map selection stay synchronized.
- Arrival and progress updates post to `/v1` and reconcile on reentry.
- Saved places round-trip through the API.
- The Mini Program runs against local fixtures during development.
- Security testing covers the Mini Program build and its backend integration,
  and critical findings are fixed before the phase closes.
- Submission passes WeChat review for permissions and request domains.

## Implemented Foundation

- Native Mini Program project under `wechat/`.
- Journey timeline synchronized with native WeChat map markers and route line.
- Place details, story content, saved places, and arrival progression.
- `wx.getLocation` permission flow and 150-meter nearby arrival prompt.
- Shared `/v1` API repository with bundled Amsterdam fixture fallback.
- Versioned `wx` local storage recovery and offline persistence.
- Node contract checks for journey state, progress payloads, and proximity.

The client defaults to the deployed D1-backed API at
`https://citytrace.movenova.ai`. Before production submission, register that
hostname as a WeChat request domain, replace the placeholder AppID, and
complete device review in WeChat Developer Tools.

The current backend persists progress by trip ID, so the MVP route progress is
shared across clients using `amsterdam-highlights`. A future authenticated
traveler-trip resource should isolate progress per user before public launch.

## Completion

With Phase 5, all clients in [architecture.md](architecture.md) consume the
shared backend at journey parity.
