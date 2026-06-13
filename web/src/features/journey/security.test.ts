import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fixturePlaces } from "./data";
import { createInitialJourneyState, loadJourneyState } from "./storage";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(moduleDir, "../../..");
const srcRoot = path.join(webRoot, "src");

const localStorageMock = {
  getItem: vi.fn<(key: string) => string | null>(),
  setItem: vi.fn<(key: string, value: string) => void>(),
  removeItem: vi.fn<(key: string) => void>(),
};

function listSourceFiles(dirPath: string): string[] {
  return readdirSync(dirPath).flatMap((entry) => {
    const entryPath = path.join(dirPath, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      return listSourceFiles(entryPath);
    }

    return entryPath.endsWith(".ts") || entryPath.endsWith(".tsx")
      ? [entryPath]
      : [];
  });
}

describe("CityTrace web security validation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("localStorage", localStorageMock);
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
    localStorageMock.removeItem.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sanitizes invalid persisted journey state", () => {
    const seed = createInitialJourneyState(fixturePlaces);

    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({
        selectedPlaceId: "bogus-place",
        savedPlaceIds: ["dam", "bogus-place"],
        statuses: {
          dam: "done",
          centraal: "evil",
        },
      }),
    );

    const state = loadJourneyState(fixturePlaces, seed);

    expect(state.selectedPlaceId).toBe(seed.selectedPlaceId);
    expect(state.savedPlaceIds).toEqual(["dam"]);
    expect(state.statuses.dam).toBe("done");
    expect(state.statuses.centraal).toBe(seed.statuses.centraal);
  });

  it("uses the shared /v1 backend contract when the API is configured", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);

      if (url.endsWith("/v1/cities/amsterdam/places")) {
        return new Response(
          JSON.stringify(
            fixturePlaces.map((place) => ({
              id: place.id,
              title: place.title,
              subtitle: place.subtitle,
            })),
          ),
          { status: 200 },
        );
      }

      if (url.endsWith("/v1/trips/amsterdam-highlights")) {
        return new Response(
          JSON.stringify({
            id: "amsterdam-highlights",
            stops: fixturePlaces.map((place, index) => ({
              place_id: place.id,
              order: index + 1,
              status: place.initialStatus,
            })),
          }),
          { status: 200 },
        );
      }

      if (url.endsWith("/v1/users/web-demo/saved-places")) {
        return new Response(JSON.stringify([{ id: "dam", title: "Dam Square" }]), {
          status: 200,
        });
      }

      throw new Error(`Unexpected fetch call: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);
    process.env.NEXT_PUBLIC_CITYTRACE_API_BASE = "https://citytrace.movenova.ai/";
    vi.resetModules();

    const { loadJourneySnapshot } = await import("./repository");
    const snapshot = await loadJourneySnapshot();

    expect(snapshot.remote).toBe(true);
    expect(snapshot.places.map((place) => place.id)).toEqual(
      fixturePlaces.map((place) => place.id),
    );
    expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual([
      "https://citytrace.movenova.ai/v1/cities/amsterdam/places",
      "https://citytrace.movenova.ai/v1/trips/amsterdam-highlights",
      "https://citytrace.movenova.ai/v1/users/web-demo/saved-places",
    ]);
  });

  it("contains no dangerouslySetInnerHTML usage in web source files", () => {
    const offenders = listSourceFiles(srcRoot)
      .filter((filePath) => !filePath.endsWith(".test.ts") && !filePath.endsWith(".test.tsx"))
      .filter((filePath) => readFileSync(filePath, "utf8").includes("dangerouslySetInnerHTML"));

    expect(offenders).toEqual([]);
  });
});