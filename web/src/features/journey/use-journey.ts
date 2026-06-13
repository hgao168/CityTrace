"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fixturePlaces } from "./data";
import {
  loadJourneySnapshot,
  savePlace,
  syncTripProgress,
  unsavePlace,
} from "./repository";
import {
  createInitialJourneyState,
  loadJourneyState,
  saveJourneyState,
} from "./storage";
import type { JourneyState, PlaceStatus } from "./types";

export function useJourney() {
  const [places, setPlaces] = useState(fixturePlaces);
  const [journey, setJourney] = useState<JourneyState>(
    createInitialJourneyState(fixturePlaces),
  );
  const [detailPlaceId, setDetailPlaceId] = useState<string | null>(null);
  const [mapScale, setMapScale] = useState(1);
  const [toast, setToast] = useState("");
  const [activeView, setActiveView] = useState("journey");
  const [hasNotification, setHasNotification] = useState(true);
  const [hasRestoredJourney, setHasRestoredJourney] = useState(false);
  const [isRemote, setIsRemote] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 2800);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapJourney() {
      const snapshot = await loadJourneySnapshot();
      if (!isMounted) return;

      setPlaces(snapshot.places);
      setIsRemote(snapshot.remote);

      if (snapshot.remote) {
        const storedState = loadJourneyState(snapshot.places, snapshot.state);
        setJourney({
          ...snapshot.state,
          selectedPlaceId: storedState.selectedPlaceId,
        });
      } else {
        setJourney(
          loadJourneyState(snapshot.places, createInitialJourneyState(snapshot.places)),
        );
      }

      setHasRestoredJourney(true);
    }

    void bootstrapJourney();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasRestoredJourney) saveJourneyState(journey);
  }, [hasRestoredJourney, journey]);

  useEffect(() => {
    document.body.style.overflow = detailPlaceId ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [detailPlaceId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetailPlaceId(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const selectPlace = useCallback((placeId: string, showDetails = false) => {
    setJourney((current) => ({ ...current, selectedPlaceId: placeId }));
    if (showDetails) setDetailPlaceId(placeId);
  }, []);

  const toggleSaved = useCallback(() => {
    const selectedPlaceId = journey.selectedPlaceId;
    const isSaved = journey.savedPlaceIds.includes(selectedPlaceId);
    const shouldSave = !isSaved;

    showToast(
      isSaved
        ? "Place removed from your saved list"
        : "Place added to your saved list",
    );

    setJourney((current) => {
      return {
        ...current,
        savedPlaceIds: isSaved
          ? current.savedPlaceIds.filter(
              (placeId) => placeId !== current.selectedPlaceId,
            )
          : [...current.savedPlaceIds, current.selectedPlaceId],
      };
    });

    if (isRemote && selectedPlaceId) {
      const request = shouldSave
        ? savePlace(selectedPlaceId)
        : unsavePlace(selectedPlaceId);
      void request.catch(() => {
        showToast("Could not sync saved places right now.");
      });
    }
  }, [isRemote, journey.savedPlaceIds, journey.selectedPlaceId, showToast]);

  const markArrived = useCallback(() => {
    const selectedIndex = places.findIndex(
      (place) => place.id === journey.selectedPlaceId,
    );
    if (selectedIndex === -1) return;

    const nextStatuses: Record<string, PlaceStatus> = {};
    places.forEach((place, index) => {
      nextStatuses[place.id] =
        index <= selectedIndex
          ? "done"
          : index === selectedIndex + 1
            ? "active"
            : "upcoming";
    });

    const arrivedPlace = places[selectedIndex];
    const nextPlace = places[selectedIndex + 1];

    showToast(
      nextPlace
        ? `You arrived at ${arrivedPlace.title}. Next stop: ${nextPlace.title}.`
        : "Today's city walk is complete. Your journey has been saved.",
    );
    setDetailPlaceId(null);

    setJourney((current) => {
      return {
        ...current,
        selectedPlaceId: nextPlace?.id ?? current.selectedPlaceId,
        statuses: nextStatuses,
      };
    });

    if (isRemote) {
      void syncTripProgress(nextStatuses).catch(() => {
        showToast("Could not sync journey progress right now.");
      });
    }
  }, [isRemote, journey.selectedPlaceId, places, showToast]);

  const changeMapScale = useCallback((change: number) => {
    setMapScale((current) =>
      Math.min(1.35, Math.max(0.85, current + change)),
    );
  }, []);

  const selectView = useCallback(
    (view: string, label: string) => {
      setActiveView(view);
      if (view !== "journey") {
        showToast(`${label} will be available in the next release`);
      }
    },
    [showToast],
  );

  const showNotification = useCallback(() => {
    setHasNotification(false);
    showToast("09:35 Dam Square: You are nearby. Open the historical story.");
  }, [showToast]);

  const doneCount = places.filter(
    (place) => journey.statuses[place.id] === "done",
  ).length;
  const detailPlace = places.find((place) => place.id === detailPlaceId) ?? null;
  const completedPlaces = places.filter(
    (place) => journey.statuses[place.id] === "done",
  );
  const currentPlace = completedPlaces.at(-1) ?? places[0] ?? fixturePlaces[0];

  return {
    activeView,
    changeMapScale,
    closeDetails: () => setDetailPlaceId(null),
    currentPlace,
    detailPlace,
    doneCount,
    hasRestoredJourney,
    hasNotification,
    isRemote,
    journey,
    mapScale,
    markArrived,
    focusMap: () => setMapScale(1.15),
    places,
    recenterMap: () => setMapScale(1),
    selectPlace,
    selectView,
    showNotification,
    showToast,
    toast,
    toggleSaved,
  };
}
