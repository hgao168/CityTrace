const repository = require("../../services/repository");
const storage = require("../../utils/storage");
const journeyUtils = require("../../utils/journey");

const AMSTERDAM_CENTER = {
  latitude: 52.3731,
  longitude: 4.8897,
};

function decoratePlaces(places, state) {
  return places.map(function (place, index) {
    const status = state.statuses[place.id] || "upcoming";
    return Object.assign({}, place, {
      index: index + 1,
      number: String(index + 1).padStart(2, "0"),
      status,
      selected: state.selectedPlaceId === place.id,
      saved: state.savedPlaceIds.indexOf(place.id) >= 0,
    });
  });
}

function buildMarkers(places) {
  return places.map(function (place) {
    const selected = place.selected;
    const done = place.status === "done";
    return {
      id: place.index,
      placeId: place.id,
      latitude: place.latitude,
      longitude: place.longitude,
      iconPath: done
        ? "/assets/marker-done.png"
        : selected
          ? "/assets/marker-active.png"
          : "/assets/marker-upcoming.png",
      width: selected ? 38 : 31,
      height: selected ? 38 : 31,
      callout: {
        content: done ? "Completed: " + place.title : place.title,
        color: "#25342f",
        fontSize: 12,
        borderRadius: 8,
        bgColor: "#fffdf8",
        padding: 8,
        display: selected ? "ALWAYS" : "BYCLICK",
      },
      label: {
        content: done ? "OK" : String(place.index),
        color: "#ffffff",
        fontSize: done ? 9 : 12,
        anchorX: done ? -6 : -3,
        anchorY: -22,
        borderWidth: 8,
        borderColor: done ? "#50776b" : selected ? "#d86f53" : "#9a6657",
        borderRadius: 16,
        bgColor: done ? "#50776b" : selected ? "#d86f53" : "#9a6657",
        padding: 1,
      },
    };
  });
}

Page({
  data: {
    activeTab: "journey",
    center: AMSTERDAM_CENTER,
    detailPlace: null,
    doneCount: 0,
    hasNotification: true,
    isRemote: false,
    journey: {
      selectedPlaceId: "",
      savedPlaceIds: [],
      statuses: {},
    },
    loading: true,
    mapScale: 13,
    markers: [],
    places: [],
    polyline: [],
    progressPercent: 0,
    toast: "",
  },

  onLoad: function () {
    this.bootstrap();
  },

  onPullDownRefresh: function () {
    this.bootstrap().finally(function () {
      wx.stopPullDownRefresh();
    });
  },

  bootstrap: function () {
    const page = this;
    page.setData({ loading: true });

    return repository.loadJourneySnapshot().then(function (snapshot) {
      const seed = snapshot.state;
      const restored = storage.loadJourneyState(
        snapshot.places,
        seed,
        journeyUtils.sanitizeJourneyState,
      );
      page.applyJourney(snapshot.places, restored, {
        isRemote: snapshot.remote,
        loading: false,
      });
    });
  },

  applyJourney: function (places, state, extra) {
    const decorated = decoratePlaces(places, state);
    const doneCount = decorated.filter(function (place) {
      return place.status === "done";
    }).length;
    const points = decorated.map(function (place) {
      return {
        latitude: place.latitude,
        longitude: place.longitude,
      };
    });

    this.setData(
      Object.assign(
        {
          doneCount,
          journey: state,
          markers: buildMarkers(decorated),
          places: decorated,
          polyline: [
            {
              points,
              color: "#d86f53",
              width: 5,
              dottedLine: false,
              arrowLine: true,
              borderColor: "#fffdf8",
              borderWidth: 2,
            },
          ],
          progressPercent: Math.round((doneCount / Math.max(1, places.length)) * 100),
        },
        extra || {},
      ),
    );
    storage.saveJourneyState(state);
  },

  selectTimelinePlace: function (event) {
    this.openPlace(event.currentTarget.dataset.id);
  },

  selectMarker: function (event) {
    const marker = this.data.markers.find(function (item) {
      return item.id === event.detail.markerId;
    });
    if (marker) this.openPlace(marker.placeId);
  },

  openPlace: function (placeId) {
    const state = Object.assign({}, this.data.journey, {
      selectedPlaceId: placeId,
    });
    const place = this.data.places.find(function (item) {
      return item.id === placeId;
    });
    this.applyJourney(this.data.places, state, { detailPlace: place || null });
  },

  closeDetails: function () {
    this.setData({ detailPlace: null });
  },

  blockTap: function () {},

  toggleSaved: function () {
    const page = this;
    const state = this.data.journey;
    const placeId = state.selectedPlaceId;
    const isSaved = state.savedPlaceIds.indexOf(placeId) >= 0;
    const savedPlaceIds = isSaved
      ? state.savedPlaceIds.filter(function (id) {
          return id !== placeId;
        })
      : state.savedPlaceIds.concat(placeId);
    const nextState = Object.assign({}, state, { savedPlaceIds });
    const selectedPlace = this.data.places.find(function (place) {
      return place.id === placeId;
    });

    this.applyJourney(this.data.places, nextState, {
      detailPlace: selectedPlace
        ? Object.assign({}, selectedPlace, { saved: !isSaved })
        : null,
    });
    this.showToast(isSaved ? "Removed from saved places" : "Saved for later");

    if (this.data.isRemote) {
      const action = isSaved
        ? repository.unsavePlace(placeId)
        : repository.savePlace(placeId);
      action.catch(function () {
        page.showToast("Saved locally. Cloud sync is unavailable.");
      });
    }
  },

  markArrived: function () {
    const page = this;
    const current = this.data.places.find(function (place) {
      return place.id === page.data.journey.selectedPlaceId;
    });
    if (!current || current.status === "done") return;

    const nextState = journeyUtils.advanceJourney(
      this.data.places,
      this.data.journey,
    );
    const nextPlace = this.data.places.find(function (place) {
      return place.id === nextState.selectedPlaceId;
    });
    this.applyJourney(this.data.places, nextState, { detailPlace: null });
    this.showToast(
      nextPlace && nextPlace.id !== current.id
        ? "Arrived at " + current.title + ". Next: " + nextPlace.title
        : "Today's city walk is complete.",
    );

    if (this.data.isRemote) {
      repository.syncTripProgress(nextState.statuses).catch(function () {
        page.showToast("Progress saved locally. Cloud sync is unavailable.");
      });
    }
  },

  locateUser: function () {
    const page = this;
    wx.getLocation({
      type: "gcj02",
      isHighAccuracy: true,
      success: function (location) {
        const selected = page.data.places.find(function (place) {
          return place.id === page.data.journey.selectedPlaceId;
        });
        page.setData({
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          mapScale: 15,
        });

        if (!selected) return;
        if (page.data.isRemote) {
          repository
            .findNearbyStops(location.latitude, location.longitude, 150)
            .then(function (response) {
              const nearby = (response.nearby_stops || []).find(function (stop) {
                return stop.place_id === selected.id;
              });
              page.presentArrivalDistance(
                selected,
                nearby ? nearby.distance_m : null,
              );
            })
            .catch(function () {
              page.presentLocalArrivalDistance(selected, location);
            });
          return;
        }

        page.presentLocalArrivalDistance(selected, location);
      },
      fail: function () {
        wx.showModal({
          title: "Location unavailable",
          content:
            "Allow location access in WeChat settings to detect nearby stops.",
          confirmText: "Open settings",
          success: function (result) {
            if (result.confirm) wx.openSetting();
          },
        });
      },
    });
  },

  presentLocalArrivalDistance: function (selected, location) {
    const distance = journeyUtils.haversineMeters(
      location.latitude,
      location.longitude,
      selected.latitude,
      selected.longitude,
    );
    this.presentArrivalDistance(selected, Math.round(distance));
  },

  presentArrivalDistance: function (selected, distance) {
    const page = this;
    if (distance !== null && distance <= 150 && selected.status !== "done") {
      wx.showModal({
        title: "You are nearby",
        content:
          selected.title +
          " is " +
          Math.round(distance) +
          " m away. Mark this stop as arrived?",
        confirmText: "Arrived",
        success: function (result) {
          if (result.confirm) page.markArrived();
        },
      });
    } else {
      page.showToast(
        distance === null
          ? "Location updated. The selected stop is outside the nearby radius."
          : "Location updated. " + selected.title + " is " + distance + " m away.",
      );
    }
  },

  recenterMap: function () {
    const selected = this.data.places.find(
      function (place) {
        return place.id === this.data.journey.selectedPlaceId;
      }.bind(this),
    );
    this.setData({
      center: selected || AMSTERDAM_CENTER,
      mapScale: 14,
    });
  },

  zoomIn: function () {
    this.setData({ mapScale: Math.min(18, this.data.mapScale + 1) });
  },

  zoomOut: function () {
    this.setData({ mapScale: Math.max(10, this.data.mapScale - 1) });
  },

  showNotification: function () {
    this.setData({ hasNotification: false });
    this.showToast("09:35 Dam Square: You are nearby. Open the historical story.");
  },

  adjustTrip: function () {
    this.showToast("Your trip is on schedule and should finish before 5:00 PM.");
  },

  selectTab: function (event) {
    const tab = event.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    if (tab !== "journey") {
      this.showToast("This section will be available in the next release.");
    }
  },

  showToast: function (message) {
    clearTimeout(this.toastTimer);
    this.setData({ toast: message });
    this.toastTimer = setTimeout(
      function () {
        this.setData({ toast: "" });
      }.bind(this),
      2800,
    );
  },

  onUnload: function () {
    clearTimeout(this.toastTimer);
  },
});
