# CityTrace Delivery Phases

This plan sequences CityTrace delivery against the platform boundaries in
[architecture.md](architecture.md) and the shared API in
[api-contract.md](api-contract.md). Each phase has its own detailed document.

## Sequencing

```text
Phase 1  Website Foundation      web/        Reference client (delivered)
Phase 2  Shared Backend          backend/    Versioned /v1 API + data
Phase 3  iOS Client              ios/        SwiftUI app on shared API
Phase 4  Android Client          android/    Compose app on shared API
Phase 5  WeChat Mini Program     wechat/     Mini Program on shared API
```

## Principles

- The website stays the experience reference until each client reaches parity.
- All clients consume the same versioned `/v1` API and never embed business
  rules that belong in the backend.
- Each phase keeps local fixtures or static fallbacks so development and
  previews work without a live backend.
- Domain contracts (`Place`, trip, journey state) stay consistent across
  platforms.

## Phase Index

- [Phase 1: Website Foundation](phase-1-web.md)
- [Phase 2: Shared Backend](phase-2-backend.md)
- [Phase 3: iOS Client](phase-3-ios.md)
- [Phase 4: Android Client](phase-4-android.md)
- [Phase 5: WeChat Mini Program](phase-5-wechat.md)

## Cross-Phase Exit Criteria

- The published OpenAPI document matches implemented `/v1` behavior.
- Each client passes the same journey acceptance checks: selection, progress,
  arrival, saved places, and reload persistence.
- No client regresses the desktop or mobile reference experience.
