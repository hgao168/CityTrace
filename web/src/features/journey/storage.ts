import { initialStatuses, places } from "./data";
import type { JourneyState, PlaceStatus } from "./types";

const STORAGE_KEY = "citytrace:journey:v1";
const validStatuses = new Set<PlaceStatus>(["done", "active", "upcoming"]);

export const initialJourneyState: JourneyState = {
  selectedPlaceId: "dam",
  savedPlaceIds: [],
  statuses: initialStatuses,
};

export function loadJourneyState(): JourneyState {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as
      | Partial<JourneyState>
      | null;
    if (!stored) return initialJourneyState;

    const placeIds = new Set(places.map((place) => place.id));
    const statuses = { ...initialStatuses };

    for (const place of places) {
      const status = stored.statuses?.[place.id];
      if (status && validStatuses.has(status)) statuses[place.id] = status;
    }

    return {
      selectedPlaceId: placeIds.has(stored.selectedPlaceId ?? "")
        ? stored.selectedPlaceId!
        : initialJourneyState.selectedPlaceId,
      savedPlaceIds: Array.isArray(stored.savedPlaceIds)
        ? stored.savedPlaceIds.filter((placeId) => placeIds.has(placeId))
        : [],
      statuses,
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return initialJourneyState;
  }
}

export function saveJourneyState(state: JourneyState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The journey remains fully usable when storage is unavailable.
  }
}
