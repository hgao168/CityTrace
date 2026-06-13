import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestHarness } from "wrangler";

const TRIP_ID = "amsterdam-highlights";
const TRIP_PATH = `/v1/trips/${TRIP_ID}`;
const BASE_URL = "http://citytrace.movenova.ai";
const TEST_USER_ID = "vitest-d1-user";
const TEST_PLACE_ID = "canal";

const server = createTestHarness({
  root: "..",
  workers: [{ configPath: "./backend/wrangler.jsonc" }],
});

const request = async (path: string, init?: Parameters<typeof server.fetch>[1]) =>
  server.fetch(`${BASE_URL}${path}`, init);

const resetTripState = async (): Promise<void> => {
  const response = await request(`${TRIP_PATH}/progress`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      arrived_stop_id: "dam",
      completed_stop_ids: ["centraal"],
      completed_trip: false,
    }),
  });

  expect(response.status).toBe(200);
};

const clearSavedPlaceState = async (): Promise<void> => {
  const response = await request(`/v1/users/${TEST_USER_ID}/saved-places/${TEST_PLACE_ID}`, {
    method: "DELETE",
  });

  expect(response.status).toBe(200);
};

describe("CityTrace D1 persistence integration", () => {
  beforeAll(async () => {
    await server.listen();
  }, 30000);

  afterAll(async () => {
    await server.close();
  });

  beforeEach(async () => {
    await resetTripState();
    await clearSavedPlaceState();
  });

  it("persists trip progress through the D1-backed worker", async () => {
    const updateResponse = await request(`${TRIP_PATH}/progress`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        arrived_stop_id: "begijnhof",
        completed_stop_ids: ["centraal", "dam"],
        completed_trip: false,
      }),
    });

    expect(updateResponse.status).toBe(200);

    const tripResponse = await request(TRIP_PATH);
    expect(tripResponse.status).toBe(200);

    const trip = (await tripResponse.json()) as {
      stops: Array<{ place_id: string; order: number; status: string }>;
    };

    expect(trip.stops).toEqual([
      { place_id: "centraal", order: 1, status: "done" },
      { place_id: "dam", order: 2, status: "done" },
      { place_id: "begijnhof", order: 3, status: "active" },
      { place_id: "canal", order: 4, status: "upcoming" },
      { place_id: "jordaan", order: 5, status: "upcoming" },
      { place_id: "anne-frank", order: 6, status: "upcoming" },
    ]);
  });

  it("persists saved-place writes through the D1-backed worker", async () => {
    const savePath = `/v1/users/${TEST_USER_ID}/saved-places/${TEST_PLACE_ID}`;

    const firstSave = await request(savePath, { method: "PUT" });
    const secondSave = await request(savePath, { method: "PUT" });

    expect(firstSave.status).toBe(200);
    expect(secondSave.status).toBe(200);

    const savedResponse = await request(`/v1/users/${TEST_USER_ID}/saved-places`);
    expect(savedResponse.status).toBe(200);

    const savedPlaces = (await savedResponse.json()) as Array<{ id: string }>;
    expect(savedPlaces.map((place) => place.id)).toEqual([TEST_PLACE_ID]);

    const deleteResponse = await request(savePath, { method: "DELETE" });
    expect(deleteResponse.status).toBe(200);

    const afterDeleteResponse = await request(`/v1/users/${TEST_USER_ID}/saved-places`);
    expect(afterDeleteResponse.status).toBe(200);

    const remainingPlaces = (await afterDeleteResponse.json()) as Array<{ id: string }>;
    expect(remainingPlaces).toEqual([]);
  });
});