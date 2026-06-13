const VALID_STATUSES = ["done", "active", "upcoming"];

function createInitialJourneyState(places) {
  const statuses = places.reduce(function (result, place) {
    result[place.id] = place.initialStatus;
    return result;
  }, {});
  const activePlace = places.find(function (place) {
    return place.initialStatus === "active";
  });

  return {
    selectedPlaceId: activePlace ? activePlace.id : places[0] ? places[0].id : "",
    savedPlaceIds: [],
    statuses,
  };
}

function sanitizeJourneyState(places, candidate, seed) {
  if (!candidate || typeof candidate !== "object") return seed;

  const placeIds = places.map(function (place) {
    return place.id;
  });
  const statuses = Object.assign({}, seed.statuses);

  places.forEach(function (place) {
    const status = candidate.statuses && candidate.statuses[place.id];
    if (VALID_STATUSES.indexOf(status) >= 0) statuses[place.id] = status;
  });

  return {
    selectedPlaceId:
      placeIds.indexOf(candidate.selectedPlaceId) >= 0
        ? candidate.selectedPlaceId
        : seed.selectedPlaceId,
    savedPlaceIds: Array.isArray(candidate.savedPlaceIds)
      ? candidate.savedPlaceIds.filter(function (placeId, index, values) {
          return placeIds.indexOf(placeId) >= 0 && values.indexOf(placeId) === index;
        })
      : seed.savedPlaceIds,
    statuses,
  };
}

function advanceJourney(places, journey) {
  const selectedIndex = places.findIndex(function (place) {
    return place.id === journey.selectedPlaceId;
  });
  if (selectedIndex < 0) return journey;

  const statuses = {};
  places.forEach(function (place, index) {
    statuses[place.id] =
      index <= selectedIndex
        ? "done"
        : index === selectedIndex + 1
          ? "active"
          : "upcoming";
  });

  return {
    selectedPlaceId: places[selectedIndex + 1]
      ? places[selectedIndex + 1].id
      : journey.selectedPlaceId,
    savedPlaceIds: journey.savedPlaceIds.slice(),
    statuses,
  };
}

function progressPayload(statuses) {
  const entries = Object.keys(statuses);
  const completedStopIds = entries.filter(function (placeId) {
    return statuses[placeId] === "done";
  });
  const activeStopId = entries.find(function (placeId) {
    return statuses[placeId] === "active";
  });

  return {
    arrived_stop_id: activeStopId,
    completed_stop_ids: completedStopIds,
    completed_trip: entries.length > 0 && completedStopIds.length === entries.length,
  };
}

function haversineMeters(latitudeA, longitudeA, latitudeB, longitudeB) {
  const radians = Math.PI / 180;
  const latitudeDelta = (latitudeB - latitudeA) * radians;
  const longitudeDelta = (longitudeB - longitudeA) * radians;
  const startLatitude = latitudeA * radians;
  const endLatitude = latitudeB * radians;
  const value =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

module.exports = {
  advanceJourney,
  createInitialJourneyState,
  haversineMeters,
  progressPayload,
  sanitizeJourneyState,
};
