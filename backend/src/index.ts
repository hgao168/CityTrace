import { Hono } from "hono";
import { cors } from "hono/cors";
import { cities, places, trips, userSavedPlaceIds } from "./data";
import type { EmptyResponse, Trip, TripProgressUpdate } from "./types";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: ["https://citytrace.movenova.ai", "http://localhost:3000"],
    allowMethods: ["GET", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);

app.get("/", (c) =>
  c.json({
    service: "citytrace-backend",
    status: "ok",
    version: "0.1.0",
    spec: "backend/openapi.yaml",
  }),
);

app.get("/v1/cities", (c) => c.json(cities));

app.get("/v1/cities/:cityId/places", (c) => {
  const cityId = c.req.param("cityId");
  const cityPlaces = places.filter((place) => place.cityId === cityId);
  if (cityPlaces.length === 0) {
    return c.json({ error: "city_not_found" }, 404);
  }
  return c.json(cityPlaces);
});

app.get("/v1/trips/:tripId", (c) => {
  const trip = trips.get(c.req.param("tripId"));
  if (!trip) {
    return c.json({ error: "trip_not_found" }, 404);
  }
  return c.json(trip);
});

app.patch("/v1/trips/:tripId/progress", async (c) => {
  const tripId = c.req.param("tripId");
  const trip = trips.get(tripId);

  if (!trip) {
    return c.json({ error: "trip_not_found" }, 404);
  }

  let update: TripProgressUpdate;
  try {
    update = await c.req.json<TripProgressUpdate>();
  } catch {
    return c.json({ error: "invalid_json" }, 400);
  }

  if (!Array.isArray(update.completedStopIds)) {
    return c.json({ error: "invalid_completed_stop_ids" }, 400);
  }

  const completed = new Set(update.completedStopIds);
  const nextTrip: Trip = {
    ...trip,
    stops: trip.stops.map((stop) => {
      if (completed.has(stop.placeId)) {
        return { ...stop, status: "done" };
      }
      if (update.arrivedStopId && stop.placeId === update.arrivedStopId) {
        return { ...stop, status: "active" };
      }
      return { ...stop, status: "upcoming" };
    }),
  };

  if (update.completedTrip) {
    nextTrip.stops = nextTrip.stops.map((stop) => ({ ...stop, status: "done" }));
  }

  trips.set(tripId, nextTrip);
  const empty: EmptyResponse = {};
  return c.json(empty);
});

app.get("/v1/users/:userId/saved-places", (c) => {
  const userId = c.req.param("userId");
  const saved = userSavedPlaceIds.get(userId) ?? new Set<string>();
  const result = places.filter((place) => saved.has(place.id));
  return c.json(result);
});

app.put("/v1/users/:userId/saved-places/:placeId", (c) => {
  const userId = c.req.param("userId");
  const placeId = c.req.param("placeId");
  const placeExists = places.some((place) => place.id === placeId);

  if (!placeExists) {
    return c.json({ error: "place_not_found" }, 404);
  }

  const saved = userSavedPlaceIds.get(userId) ?? new Set<string>();
  saved.add(placeId);
  userSavedPlaceIds.set(userId, saved);

  const empty: EmptyResponse = {};
  return c.json(empty);
});

app.delete("/v1/users/:userId/saved-places/:placeId", (c) => {
  const userId = c.req.param("userId");
  const placeId = c.req.param("placeId");
  const saved = userSavedPlaceIds.get(userId);

  if (saved) {
    saved.delete(placeId);
  }

  const empty: EmptyResponse = {};
  return c.json(empty);
});

export default app;
