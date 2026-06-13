import { beforeEach, describe, expect, it } from "vitest";
import { resetJourneyData } from "./data";
import app from "./index";

const request = async (path: string, init?: RequestInit): Promise<Response> =>
  app.fetch(new Request(`http://localhost${path}`, init));

describe("CityTrace backend security validation", () => {
  beforeEach(() => {
    resetJourneyData();
  });

  it("returns CORS headers for allowed production origins", async () => {
    const response = await request("/v1/cities", {
      headers: { Origin: "https://citytrace.movenova.ai" },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "https://citytrace.movenova.ai",
    );
  });

  it("returns CORS headers for allowed local Playwright origins", async () => {
    const response = await request("/v1/cities", {
      headers: { Origin: "http://127.0.0.1:3100" },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://127.0.0.1:3100",
    );
  });

  it("does not emit CORS allow-origin for disallowed origins", async () => {
    const response = await request("/v1/cities", {
      headers: { Origin: "https://evil.example" },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("rejects malformed JSON writes", async () => {
    const response = await request("/v1/trips/amsterdam-highlights/progress", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: "{not-json}",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_json" });
  });

  it("rejects progress updates with unknown stop ids", async () => {
    const response = await request("/v1/trips/amsterdam-highlights/progress", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        arrived_stop_id: "bogus-stop",
        completed_stop_ids: ["centraal"],
        completed_trip: false,
      }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_stop_ids" });
  });

  it("rejects invalid nearby-query coordinates and radius values", async () => {
    const invalidCoordinatesResponse = await request(
      "/v1/trips/amsterdam-highlights/nearby?lat=nope&lng=4.8922",
    );
    const invalidRadiusResponse = await request(
      "/v1/trips/amsterdam-highlights/nearby?lat=52.3731&lng=4.8922&radius_m=-1",
    );

    expect(invalidCoordinatesResponse.status).toBe(400);
    await expect(invalidCoordinatesResponse.json()).resolves.toEqual({
      error: "invalid_coordinates",
    });

    expect(invalidRadiusResponse.status).toBe(400);
    await expect(invalidRadiusResponse.json()).resolves.toEqual({
      error: "invalid_radius_m",
    });
  });
});