const assert = require("node:assert/strict");
const test = require("node:test");
const { places } = require("../data/places");
const config = require("../config");
const {
  advanceJourney,
  createInitialJourneyState,
  haversineMeters,
  progressPayload,
  sanitizeJourneyState,
} = require("../utils/journey");

test("creates the same initial journey as the website", function () {
  assert.equal(config.apiBase, "https://citytrace.movenova.ai");
  const state = createInitialJourneyState(places);
  assert.equal(state.selectedPlaceId, "dam");
  assert.equal(state.statuses.centraal, "done");
  assert.equal(state.statuses.dam, "active");
  assert.equal(state.statuses.begijnhof, "upcoming");
});

test("sanitizes untrusted local storage values", function () {
  const seed = createInitialJourneyState(places);
  const state = sanitizeJourneyState(
    places,
    {
      selectedPlaceId: "not-a-place",
      savedPlaceIds: ["dam", "unknown", "dam"],
      statuses: {
        centraal: "broken",
        dam: "done",
      },
    },
    seed,
  );

  assert.equal(state.selectedPlaceId, "dam");
  assert.deepEqual(state.savedPlaceIds, ["dam"]);
  assert.equal(state.statuses.centraal, "done");
  assert.equal(state.statuses.dam, "done");
});

test("arrival advances the active stop and produces API progress", function () {
  const seed = createInitialJourneyState(places);
  const next = advanceJourney(places, seed);
  const payload = progressPayload(next.statuses);

  assert.equal(next.selectedPlaceId, "begijnhof");
  assert.equal(next.statuses.dam, "done");
  assert.equal(next.statuses.begijnhof, "active");
  assert.deepEqual(payload.completed_stop_ids, ["centraal", "dam"]);
  assert.equal(payload.arrived_stop_id, "begijnhof");
  assert.equal(payload.completed_trip, false);
});

test("location distance supports nearby arrival detection", function () {
  const distance = haversineMeters(52.3731, 4.8922, 52.3732, 4.8923);
  assert.ok(distance > 0);
  assert.ok(distance < 20);
});
