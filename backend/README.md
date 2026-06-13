# CityTrace Backend

Backend service workspace for all CityTrace clients.

Initial service boundaries:

- Places and editorial stories
- Trips, ordered stops, and progress
- Saved places and traveler profiles
- Geospatial route and proximity queries
- Media and multilingual guide metadata

Recommended foundation:

- TypeScript service
- PostgreSQL with PostGIS
- REST API under `/v1`
- OpenAPI as the client contract

The current MVP remains local-first until this service is implemented.
