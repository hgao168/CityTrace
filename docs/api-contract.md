# CityTrace API Contract

All clients should consume the same versioned API.

Initial resources:

| Resource | Purpose |
| --- | --- |
| `GET /v1/cities` | Available CityTrace destinations |
| `GET /v1/cities/{cityId}/places` | Curated places and stories |
| `GET /v1/trips/{tripId}` | Ordered route, schedule, and stop metadata |
| `PATCH /v1/trips/{tripId}/progress` | Record arrival and completion |
| `GET /v1/users/{userId}/saved-places` | Read saved places |
| `PUT /v1/users/{userId}/saved-places/{placeId}` | Save a place |
| `DELETE /v1/users/{userId}/saved-places/{placeId}` | Remove a saved place |

Publish an OpenAPI document in `backend` before native clients depend on these
endpoints.
