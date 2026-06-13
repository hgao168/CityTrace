import { beforeEach, describe, expect, it } from "vitest";
import { resetJourneyData } from "./data";
import app from "./index";

const request = async (path: string, init?: RequestInit): Promise<Response> =>
  app.fetch(new Request(`http://localhost${path}`, init));

describe("CityTrace backend contract", () => {
  beforeEach(() => {
    resetJourneyData();
  });

  it("lists places for the Amsterdam city seed", async () => {
    const response = await request("/v1/cities/amsterdam/places");

    expect(response.status).toBe(200);

    const payload = (await response.json()) as Array<{ id: string; city_id: string }>;
    expect(payload.length).toBeGreaterThan(0);
    expect(payload.every((place) => place.city_id === "amsterdam")).toBe(true);
  });

  it("persists trip progress updates idempotently", async () => {
    const payload = {
      arrived_stop_id: "begijnhof",
      completed_stop_ids: ["centraal", "dam"],
      completed_trip: false,
    };

    const firstResponse = await request("/v1/trips/amsterdam-highlights/progress", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const secondResponse = await request("/v1/trips/amsterdam-highlights/progress", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);

    const tripResponse = await request("/v1/trips/amsterdam-highlights");
    expect(tripResponse.status).toBe(200);

    const trip = (await tripResponse.json()) as {
      stops: Array<{ place_id: string; status: string }>;
    };

    expect(trip.stops).toEqual([
      { place_id: "centraal", status: "done" },
      { place_id: "dam", status: "done" },
      { place_id: "begijnhof", status: "active" },
      { place_id: "canal", status: "upcoming" },
      { place_id: "jordaan", status: "upcoming" },
      { place_id: "anne-frank", status: "upcoming" },
    ].map((stop, index) => ({ ...stop, order: index + 1 })));
  });

  it("saves and removes places idempotently", async () => {
    const savePath = "/v1/users/web-demo/saved-places/canal";

    const firstSave = await request(savePath, { method: "PUT" });
    const secondSave = await request(savePath, { method: "PUT" });

    expect(firstSave.status).toBe(200);
    expect(secondSave.status).toBe(200);

    const savedResponse = await request("/v1/users/web-demo/saved-places");
    const savedPlaces = (await savedResponse.json()) as Array<{ id: string }>;
    expect(savedPlaces.map((place) => place.id)).toEqual(["canal"]);

    const firstDelete = await request(savePath, { method: "DELETE" });
    const secondDelete = await request(savePath, { method: "DELETE" });

    expect(firstDelete.status).toBe(200);
    expect(secondDelete.status).toBe(200);

    const afterDeleteResponse = await request("/v1/users/web-demo/saved-places");
    const remainingPlaces = (await afterDeleteResponse.json()) as Array<{ id: string }>;
    expect(remainingPlaces).toEqual([]);
  });

  it("returns nearby trip stops ordered by distance", async () => {
    const response = await request(
      "/v1/trips/amsterdam-highlights/nearby?lat=52.3731&lng=4.8922&radius_m=1000&limit=3",
    );

    expect(response.status).toBe(200);

    const payload = (await response.json()) as {
      nearby_stops: Array<{ place_id: string; distance_m: number }>;
    };

    expect(payload.nearby_stops).toHaveLength(3);
    expect(payload.nearby_stops[0]?.place_id).toBe("dam");
    expect(payload.nearby_stops[0]?.distance_m).toBeLessThanOrEqual(
      payload.nearby_stops[1]?.distance_m ?? Number.POSITIVE_INFINITY,
    );
    expect(payload.nearby_stops[1]?.distance_m).toBeLessThanOrEqual(
      payload.nearby_stops[2]?.distance_m ?? Number.POSITIVE_INFINITY,
    );
  });
});