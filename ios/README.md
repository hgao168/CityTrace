# CityTrace iOS

Native iOS client workspace.

Planned stack:

- Swift and SwiftUI
- Core Location and region monitoring
- MapKit for route and place rendering
- Shared CityTrace backend API

Implemented API functions are now available in the Swift package `CityTraceKit`
under `Sources/CityTraceKit/CityTraceAPIClient.swift`.

## Implemented Functions

- `fetchCities()` -> `GET /v1/cities`
- `fetchPlaces(cityId:)` -> `GET /v1/cities/{cityId}/places`
- `fetchTrip(tripId:)` -> `GET /v1/trips/{tripId}`
- `updateTripProgress(tripId:progress:)` -> `PATCH /v1/trips/{tripId}/progress`
- `fetchSavedPlaces(userId:)` -> `GET /v1/users/{userId}/saved-places`
- `savePlace(userId:placeId:)` -> `PUT /v1/users/{userId}/saved-places/{placeId}`
- `removeSavedPlace(userId:placeId:)` -> `DELETE /v1/users/{userId}/saved-places/{placeId}`

## Quick Start

```swift
import CityTraceKit

let api = CityTraceAPIClient(baseURL: URL(string: "https://api.citytrace.example")!)
let cities = try await api.fetchCities()
```

Keep API contracts aligned with `docs/api-contract.md`.

## Windows Test Helper

Use the helper script to configure Swift runtime/toolchain paths and run tests
with cleanup and retry logic.
The script uses a per-attempt scratch build path to reduce linker file-lock
issues on Windows:

```powershell
Set-Location ios
.\scripts\run-swift-tests.ps1
```

Optional flags:

- `-RetryCount 5` to increase retry attempts.
- `-SkipClean` to skip `swift package clean` before the first test run.
- `-TestTimeoutSeconds 240` to control per-attempt timeout for hung test runs.
- `-BuildOnly` to run `swift build` instead of `swift test`.

Build-only example:

```powershell
Set-Location ios
.\scripts\run-swift-tests.ps1 -BuildOnly -RetryCount 2 -TestTimeoutSeconds 180
```
