# CityTrace MVP

A zero-dependency city day-tour web MVP that demonstrates these core experiences:

- Highlights: curated historical places and detailed stories
- Timeline: route times, walking distances, and completion status
- Map: two-way interaction between places, route, location, and timeline
- Location trigger: an arrival simulation for nearby-place experiences
- Progress: automatic progress updates and next-stop recommendations

## Run

Open `index.html` directly in a browser, or start any static file server in this directory:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## MVP Scope

The current map is an interactive illustration that requires no API key. Place data is stored in `app.js`. A production version can replace it with MapLibre or Mapbox and move places, routes, and user trips to a backend API.

Recommended next steps:

1. Add MapLibre and real GeoJSON routes.
2. Add GPS, geofencing, and background location permissions.
3. Use PostgreSQL and PostGIS for place storage and distance queries.
4. Add a content management system and multilingual audio guides.
5. Package the web MVP as a React Native or Expo mobile app.
