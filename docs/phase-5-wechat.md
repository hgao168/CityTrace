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

## Completion

With Phase 5, all clients in [architecture.md](architecture.md) consume the
shared backend at journey parity.
