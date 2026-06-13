import { fixturePlaces } from "./data";
import { createInitialJourneyState } from "./storage";
import type { JourneyState, Place, PlaceStatus } from "./types";

type ApiPlace = {
  id: string;
  title: string;
  subtitle?: string;
  latitude?: number;
  longitude?: number;
};

type ApiTripStop = {
  place_id: string;
  order: number;
  status: PlaceStatus;
};

type ApiTrip = {
  id: string;
  stops: ApiTripStop[];
};

export type JourneySnapshot = {
  places: Place[];
  state: JourneyState;
  remote: boolean;
};

const CITY_ID = "amsterdam";
const TRIP_ID = "amsterdam-highlights";
const USER_ID = "web-demo";

function getApiBase(): string {
  const configuredBase = process.env.NEXT_PUBLIC_CITYTRACE_API_BASE?.trim() ?? "";
  if (configuredBase) {
    return configuredBase.endsWith("/")
      ? configuredBase.slice(0, -1)
      : configuredBase;
  }

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname === "127.0.0.1" || hostname === "localhost") {
      return "http://127.0.0.1:8787";
    }
  }

  return "";
}

function endpoint(path: string): string {
  return `${getApiBase()}${path}`;
}

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(endpoint(path), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`GET ${path} failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

async function apiPut(path: string, body?: unknown): Promise<void> {
  const response = await fetch(endpoint(path), {
    method: "PUT",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`PUT ${path} failed with ${response.status}`);
  }
}

async function apiPatch(path: string, body: unknown): Promise<void> {
  const response = await fetch(endpoint(path), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`PATCH ${path} failed with ${response.status}`);
  }
}

async function apiDelete(path: string): Promise<void> {
  const response = await fetch(endpoint(path), { method: "DELETE" });
  if (!response.ok) {
    throw new Error(`DELETE ${path} failed with ${response.status}`);
  }
}

function toUiPlaces(apiPlaces: ApiPlace[]): Place[] {
  const fallbackById = new Map(fixturePlaces.map((place) => [place.id, place]));

  return apiPlaces.map((apiPlace, index) => {
    const fallback =
      fallbackById.get(apiPlace.id) ??
      fixturePlaces[Math.min(index, fixturePlaces.length - 1)];

    if (!fallback) {
      return {
        id: apiPlace.id,
        time: "",
        title: apiPlace.title,
        subtitle: apiPlace.subtitle ?? "",
        category: "City Spot",
        duration: "30 min",
        walk: "",
        distance: "",
        initialStatus: "upcoming",
        position: {
          left: 15 + (index % 6) * 14,
          top: 24 + ((index + 2) % 5) * 12,
        },
        image:
          "linear-gradient(140deg, #8fa58f 0 36%, #d0a679 37% 70%, #e2d3b8 71%)",
        story: "",
      };
    }

    return {
      ...fallback,
      id: apiPlace.id,
      title: apiPlace.title,
      subtitle: apiPlace.subtitle ?? fallback.subtitle,
    };
  });
}

function toState(places: Place[], trip: ApiTrip, savedPlaces: ApiPlace[]): JourneyState {
  const placeIds = new Set(places.map((place) => place.id));
  const seed = createInitialJourneyState(places);
  const statuses = { ...seed.statuses };

  for (const stop of trip.stops) {
    if (placeIds.has(stop.place_id)) {
      statuses[stop.place_id] = stop.status;
    }
  }

  const activeStop = trip.stops.find((stop) => stop.status === "active");

  return {
    selectedPlaceId:
      activeStop && placeIds.has(activeStop.place_id)
        ? activeStop.place_id
        : seed.selectedPlaceId,
    savedPlaceIds: savedPlaces
      .map((saved) => saved.id)
      .filter((placeId) => placeIds.has(placeId)),
    statuses,
  };
}

export async function loadJourneySnapshot(): Promise<JourneySnapshot> {
  try {
    const [placesResponse, tripResponse, savedResponse] = await Promise.all([
      apiGet<ApiPlace[]>(`/v1/cities/${CITY_ID}/places`),
      apiGet<ApiTrip>(`/v1/trips/${TRIP_ID}`),
      apiGet<ApiPlace[]>(`/v1/users/${USER_ID}/saved-places`),
    ]);

    const places = toUiPlaces(placesResponse);
    const state = toState(places, tripResponse, savedResponse);

    return { places, state, remote: true };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("CityTrace remote bootstrap failed", error);
    }

    const places = fixturePlaces;
    return {
      places,
      state: createInitialJourneyState(places),
      remote: false,
    };
  }
}

export async function savePlace(placeId: string): Promise<void> {
  await apiPut(`/v1/users/${USER_ID}/saved-places/${placeId}`);
}

export async function unsavePlace(placeId: string): Promise<void> {
  await apiDelete(`/v1/users/${USER_ID}/saved-places/${placeId}`);
}

export async function syncTripProgress(statuses: Record<string, PlaceStatus>): Promise<void> {
  const completedStopIds = Object.entries(statuses)
    .filter(([, status]) => status === "done")
    .map(([placeId]) => placeId);
  const activeStopId = Object.entries(statuses).find(([, status]) => status === "active")?.[0];

  await apiPatch(`/v1/trips/${TRIP_ID}/progress`, {
    arrived_stop_id: activeStopId,
    completed_stop_ids: completedStopIds,
    completed_trip: Object.values(statuses).every((status) => status === "done"),
  });
}
