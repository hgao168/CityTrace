# CityTrace Backend

Backend service workspace for all CityTrace clients.

Phase 2 foundation targets Cloudflare Workers and the production domain
`citytrace.movenova.ai`.

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

## Phase 2 Bootstrap

### Run locally

```powershell
npm install
npm run backend:dev
```

The Worker runs locally through Wrangler and serves contract endpoints under
`/v1`.

### Deploy to Cloudflare

```powershell
npm run backend:deploy
```

Set Cloudflare account and route configuration in `backend/wrangler.jsonc`.
Use a route on `citytrace.movenova.ai` for `/v1/*` traffic.

### API Contract

OpenAPI output is maintained in `backend/openapi.yaml`.

The current MVP remains local-first until this service is implemented.
