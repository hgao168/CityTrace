"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { places } from "./data";
import {
  initialJourneyState,
  loadJourneyState,
  saveJourneyState,
} from "./storage";
import type { JourneyState, PlaceStatus } from "./types";

export function useJourney() {
  const [journey, setJourney] = useState<JourneyState>(initialJourneyState);
  const [detailPlaceId, setDetailPlaceId] = useState<string | null>(null);
  const [mapScale, setMapScale] = useState(1);
  const [toast, setToast] = useState("");
  const [activeView, setActiveView] = useState("journey");
  const [hasNotification, setHasNotification] = useState(true);
  const [hasRestoredJourney, setHasRestoredJourney] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setJourney(loadJourneyState());
    setHasRestoredJourney(true);
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

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 2800);
  }, []);

  const selectPlace = useCallback((placeId: string, showDetails = false) => {
    setJourney((current) => ({ ...current, selectedPlaceId: placeId }));
    if (showDetails) setDetailPlaceId(placeId);
  }, []);

  const toggleSaved = useCallback(() => {
    setJourney((current) => {
      const isSaved = current.savedPlaceIds.includes(current.selectedPlaceId);
      showToast(
        isSaved
          ? "Place removed from your saved list"
          : "Place added to your saved list",
      );
      return {
        ...current,
        savedPlaceIds: isSaved
          ? current.savedPlaceIds.filter(
              (placeId) => placeId !== current.selectedPlaceId,
            )
          : [...current.savedPlaceIds, current.selectedPlaceId],
      };
    });
  }, [showToast]);

  const markArrived = useCallback(() => {
    setJourney((current) => {
      const selectedIndex = places.findIndex(
        (place) => place.id === current.selectedPlaceId,
      );
      const statuses: Record<string, PlaceStatus> = {};
      places.forEach((place, index) => {
        statuses[place.id] =
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

      return {
        ...current,
        selectedPlaceId: nextPlace?.id ?? current.selectedPlaceId,
        statuses,
      };
    });
  }, [showToast]);

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
  const currentPlace = completedPlaces.at(-1) ?? places[0];

  return {
    activeView,
    changeMapScale,
    closeDetails: () => setDetailPlaceId(null),
    currentPlace,
    detailPlace,
    doneCount,
    hasNotification,
    journey,
    mapScale,
    markArrived,
    focusMap: () => setMapScale(1.15),
    recenterMap: () => setMapScale(1),
    selectPlace,
    selectView,
    showNotification,
    showToast,
    toast,
    toggleSaved,
  };
}
