import { Hono } from "hono";
import { cors } from "hono/cors";
import { cities, places } from "./data";
import { getJourneyRepository } from "./repository";
import type { AppBindings } from "./repository";
import type { EmptyResponse, Trip, TripProgressUpdate } from "./types";

const app = new Hono<{ Bindings: AppBindings }>();

type JsonCity = {
  id: string;
  name: string;
  country_code?: string;
};

type JsonPlace = {
  id: string;
  city_id: string;
  title: string;
  subtitle?: string;
  latitude?: number;
  longitude?: number;
};

type JsonTripStop = {
  place_id: string;
  order: number;
  status?: string;
};

type JsonTrip = {
  id: string;
  city_id?: string;
  title?: string;
  stops: JsonTripStop[];
};

const toJsonCity = (city: (typeof cities)[number]): JsonCity => ({
  id: city.id,
  name: city.name,
  country_code: city.countryCode,
});

const toJsonPlace = (place: (typeof places)[number]): JsonPlace => ({
  id: place.id,
  city_id: place.cityId,
  title: place.title,
  subtitle: place.subtitle,
  latitude: place.latitude,
  longitude: place.longitude,
});

const toJsonTrip = (trip: Trip): JsonTrip => ({
  id: trip.id,
  city_id: trip.cityId,
  title: trip.title,
  stops: trip.stops.map((stop) => ({
    place_id: stop.placeId,
    order: stop.order,
    status: stop.status,
  })),
});

const parseTripProgressUpdate = (body: unknown): TripProgressUpdate | null => {
  if (!body || typeof body !== "object") {
    return null;
  }

  const payload = body as {
    arrived_stop_id?: unknown;
    arrivedStopId?: unknown;
    completed_stop_ids?: unknown;
    completedStopIds?: unknown;
    completed_trip?: unknown;
    completedTrip?: unknown;
  };

  const arrivedStopIdRaw = payload.arrived_stop_id ?? payload.arrivedStopId;
  const completedStopIdsRaw = payload.completed_stop_ids ?? payload.completedStopIds;
  const completedTripRaw = payload.completed_trip ?? payload.completedTrip;

  if (
    arrivedStopIdRaw !== undefined &&
    arrivedStopIdRaw !== null &&
    typeof arrivedStopIdRaw !== "string"
  ) {
    return null;
  }

  if (!Array.isArray(completedStopIdsRaw) || completedStopIdsRaw.some((id) => typeof id !== "string")) {
    return null;
  }

  if (typeof completedTripRaw !== "boolean") {
    return null;
  }

  return {
    arrivedStopId: arrivedStopIdRaw ?? undefined,
    completedStopIds: completedStopIdsRaw,
    completedTrip: completedTripRaw,
  };
};

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

app.get("/v1/cities", (c) => c.json(cities.map(toJsonCity)));

app.get("/v1/cities/:cityId/places", (c) => {
  const cityId = c.req.param("cityId");
  const cityPlaces = places.filter((place) => place.cityId === cityId);
  if (cityPlaces.length === 0) {
    return c.json({ error: "city_not_found" }, 404);
  }
  return c.json(cityPlaces.map(toJsonPlace));
});

app.get("/v1/trips/:tripId", async (c) => {
  const repository = getJourneyRepository(c.env);
  const trip = await repository.getTrip(c.req.param("tripId"));
  if (!trip) {
    return c.json({ error: "trip_not_found" }, 404);
  }
  return c.json(toJsonTrip(trip));
});

app.patch("/v1/trips/:tripId/progress", async (c) => {
  const tripId = c.req.param("tripId");
  const repository = getJourneyRepository(c.env);
  const trip = await repository.getTrip(tripId);

  if (!trip) {
    return c.json({ error: "trip_not_found" }, 404);
  }

  let payload: unknown;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "invalid_json" }, 400);
  }

  const update = parseTripProgressUpdate(payload);
  if (!update) {
    return c.json({ error: "invalid_completed_stop_ids" }, 400);
  }

  const validPlaceIds = new Set(trip.stops.map((stop) => stop.placeId));
  if (
    update.completedStopIds.some((id) => !validPlaceIds.has(id)) ||
    (update.arrivedStopId !== undefined && !validPlaceIds.has(update.arrivedStopId))
  ) {
    return c.json({ error: "invalid_stop_ids" }, 400);
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

  await repository.saveTrip(nextTrip);
  const empty: EmptyResponse = {};
  return c.json(empty);
});

app.get("/v1/users/:userId/saved-places", async (c) => {
  const userId = c.req.param("userId");
  const repository = getJourneyRepository(c.env);
  const saved = await repository.getSavedPlaceIds(userId);
  const result = places.filter((place) => saved.has(place.id));
  return c.json(result.map(toJsonPlace));
});

app.put("/v1/users/:userId/saved-places/:placeId", async (c) => {
  const userId = c.req.param("userId");
  const placeId = c.req.param("placeId");
  const repository = getJourneyRepository(c.env);
  const placeExists = places.some((place) => place.id === placeId);

  if (!placeExists) {
    return c.json({ error: "place_not_found" }, 404);
  }

  await repository.savePlace(userId, placeId);

  const empty: EmptyResponse = {};
  return c.json(empty);
});

app.delete("/v1/users/:userId/saved-places/:placeId", async (c) => {
  const userId = c.req.param("userId");
  const placeId = c.req.param("placeId");
  const repository = getJourneyRepository(c.env);

  await repository.removeSavedPlace(userId, placeId);

  const empty: EmptyResponse = {};
  return c.json(empty);
});

export default app;
