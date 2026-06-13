import { buildInitialStatuses } from "./data";
import type { JourneyState, Place, PlaceStatus } from "./types";

const STORAGE_KEY = "citytrace:journey:v1";
const validStatuses = new Set<PlaceStatus>(["done", "active", "upcoming"]);

export function createInitialJourneyState(places: Place[]): JourneyState {
  const statuses = buildInitialStatuses(places);
  const activePlace = places.find((place) => place.initialStatus === "active");

  return {
    selectedPlaceId: activePlace?.id ?? places[0]?.id ?? "",
    savedPlaceIds: [],
    statuses,
  };
}

export function loadJourneyState(places: Place[], seed: JourneyState): JourneyState {
  if (places.length === 0) return seed;

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as
      | Partial<JourneyState>
      | null;
    if (!stored) return seed;

    const placeIds = new Set(places.map((place) => place.id));
    const statuses = { ...seed.statuses };

    for (const place of places) {
      const status = stored.statuses?.[place.id];
      if (status && validStatuses.has(status)) statuses[place.id] = status;
    }

    return {
      selectedPlaceId: placeIds.has(stored.selectedPlaceId ?? "")
        ? stored.selectedPlaceId!
        : seed.selectedPlaceId,
      savedPlaceIds: Array.isArray(stored.savedPlaceIds)
        ? stored.savedPlaceIds.filter((placeId) => placeIds.has(placeId))
        : seed.savedPlaceIds,
      statuses,
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return seed;
  }
}

export function saveJourneyState(state: JourneyState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The journey remains fully usable when storage is unavailable.
  }
}
