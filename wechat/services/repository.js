const config = require("../config");
const fixture = require("../data/places");
const journey = require("../utils/journey");

function endpoint(path) {
  const base = String(config.apiBase || "").replace(/\/$/, "");
  return base + path;
}

function request(path, method, data) {
  if (!config.apiBase) {
    return Promise.reject(new Error("CityTrace API base is not configured"));
  }

  return new Promise(function (resolve, reject) {
    wx.request({
      url: endpoint(path),
      method: method || "GET",
      data,
      header: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      success: function (response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data);
          return;
        }
        reject(new Error(method + " " + path + " failed with " + response.statusCode));
      },
      fail: reject,
    });
  });
}

function mapPlaces(apiPlaces) {
  return apiPlaces.map(function (apiPlace, index) {
    const fallback =
      fixture.places.find(function (place) {
        return place.id === apiPlace.id;
      }) || fixture.places[Math.min(index, fixture.places.length - 1)];

    return Object.assign({}, fallback, {
      id: apiPlace.id,
      title: apiPlace.title,
      subtitle: apiPlace.subtitle || fallback.subtitle,
      latitude:
        typeof apiPlace.latitude === "number" ? apiPlace.latitude : fallback.latitude,
      longitude:
        typeof apiPlace.longitude === "number"
          ? apiPlace.longitude
          : fallback.longitude,
    });
  });
}

function mapState(places, trip, savedPlaces) {
  const seed = journey.createInitialJourneyState(places);
  const statuses = Object.assign({}, seed.statuses);
  const ids = places.map(function (place) {
    return place.id;
  });

  (trip.stops || []).forEach(function (stop) {
    const placeId = stop.place_id || stop.placeId;
    if (ids.indexOf(placeId) >= 0 && stop.status) statuses[placeId] = stop.status;
  });

  const activeStop = (trip.stops || []).find(function (stop) {
    return stop.status === "active";
  });
  const activePlaceId = activeStop && (activeStop.place_id || activeStop.placeId);

  return {
    selectedPlaceId:
      ids.indexOf(activePlaceId) >= 0 ? activePlaceId : seed.selectedPlaceId,
    savedPlaceIds: (savedPlaces || [])
      .map(function (place) {
        return place.id;
      })
      .filter(function (placeId) {
        return ids.indexOf(placeId) >= 0;
      }),
    statuses,
  };
}

function loadJourneySnapshot() {
  return Promise.all([
    request("/v1/cities/" + config.cityId + "/places", "GET"),
    request("/v1/trips/" + config.tripId, "GET"),
    request("/v1/users/" + config.userId + "/saved-places", "GET"),
  ])
    .then(function (responses) {
      const places = mapPlaces(responses[0]);
      return {
        places,
        state: mapState(places, responses[1], responses[2]),
        remote: true,
      };
    })
    .catch(function () {
      return {
        places: fixture.places,
        state: journey.createInitialJourneyState(fixture.places),
        remote: false,
      };
    });
}

function savePlace(placeId) {
  return request(
    "/v1/users/" + config.userId + "/saved-places/" + placeId,
    "PUT",
  );
}

function unsavePlace(placeId) {
  return request(
    "/v1/users/" + config.userId + "/saved-places/" + placeId,
    "DELETE",
  );
}

function syncTripProgress(statuses) {
  return request(
    "/v1/trips/" + config.tripId + "/progress",
    "PATCH",
    journey.progressPayload(statuses),
  );
}

function findNearbyStops(latitude, longitude, radiusMeters) {
  const query =
    "?lat=" +
    encodeURIComponent(latitude) +
    "&lng=" +
    encodeURIComponent(longitude) +
    "&radius_m=" +
    encodeURIComponent(radiusMeters || 150) +
    "&limit=6";
  return request("/v1/trips/" + config.tripId + "/nearby" + query, "GET");
}

module.exports = {
  findNearbyStops,
  loadJourneySnapshot,
  savePlace,
  syncTripProgress,
  unsavePlace,
};
