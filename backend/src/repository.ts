import { cloneTrip, tripTemplates, trips, userSavedPlaceIds } from "./data";
import type { Trip } from "./types";

type StopStatus = "done" | "active" | "upcoming";

const validStatuses = new Set<StopStatus>(["done", "active", "upcoming"]);

export type AppBindings = {
  CITYTRACE_API_BASE: string;
  DB?: D1Database;
};

export interface JourneyRepository {
  getTrip(tripId: string): Promise<Trip | null>;
  saveTrip(trip: Trip): Promise<void>;
  getSavedPlaceIds(userId: string): Promise<Set<string>>;
  savePlace(userId: string, placeId: string): Promise<void>;
  removeSavedPlace(userId: string, placeId: string): Promise<void>;
}

class InMemoryJourneyRepository implements JourneyRepository {
  async getTrip(tripId: string): Promise<Trip | null> {
    const trip = trips.get(tripId);
    return trip ? cloneTrip(trip) : null;
  }

  async saveTrip(trip: Trip): Promise<void> {
    trips.set(trip.id, cloneTrip(trip));
  }

  async getSavedPlaceIds(userId: string): Promise<Set<string>> {
    return new Set(userSavedPlaceIds.get(userId) ?? []);
  }

  async savePlace(userId: string, placeId: string): Promise<void> {
    const saved = userSavedPlaceIds.get(userId) ?? new Set<string>();
    saved.add(placeId);
    userSavedPlaceIds.set(userId, saved);
  }

  async removeSavedPlace(userId: string, placeId: string): Promise<void> {
    const saved = userSavedPlaceIds.get(userId);
    if (saved) {
      saved.delete(placeId);
    }
  }
}

class D1JourneyRepository implements JourneyRepository {
  private schemaReadyPromise: Promise<void> | null = null;

  constructor(private readonly db: D1Database) {}

  private async ensureSchemaReady(): Promise<void> {
    if (!this.schemaReadyPromise) {
      this.schemaReadyPromise = this.db
        .batch([
          this.db.prepare(
            "CREATE TABLE IF NOT EXISTS trip_stop_statuses (trip_id TEXT NOT NULL, place_id TEXT NOT NULL, status TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (trip_id, place_id))",
          ),
          this.db.prepare(
            "CREATE TABLE IF NOT EXISTS saved_places (user_id TEXT NOT NULL, place_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, place_id))",
          ),
        ])
        .then(() => undefined);
    }

    await this.schemaReadyPromise;
  }

  async getTrip(tripId: string): Promise<Trip | null> {
    const template = tripTemplates.get(tripId);
    if (!template) {
      return null;
    }

    await this.ensureSchemaReady();

    const response = await this.db
      .prepare("SELECT place_id, status FROM trip_stop_statuses WHERE trip_id = ?")
      .bind(tripId)
      .all<{ place_id: string; status: string }>();

    const statusByPlaceId = new Map<string, StopStatus>();
    for (const row of response.results) {
      if (validStatuses.has(row.status as StopStatus)) {
        statusByPlaceId.set(row.place_id, row.status as StopStatus);
      }
    }

    const trip = cloneTrip(template);
    trip.stops = trip.stops.map((stop) => ({
      ...stop,
      status: statusByPlaceId.get(stop.placeId) ?? stop.status,
    }));

    return trip;
  }

  async saveTrip(trip: Trip): Promise<void> {
    await this.ensureSchemaReady();

    const statements = [
      this.db.prepare("DELETE FROM trip_stop_statuses WHERE trip_id = ?").bind(trip.id),
      ...trip.stops.map((stop) =>
        this.db
          .prepare("INSERT INTO trip_stop_statuses (trip_id, place_id, status) VALUES (?, ?, ?)")
          .bind(trip.id, stop.placeId, stop.status ?? "upcoming"),
      ),
    ];

    await this.db.batch(statements);
  }

  async getSavedPlaceIds(userId: string): Promise<Set<string>> {
    await this.ensureSchemaReady();

    const response = await this.db
      .prepare("SELECT place_id FROM saved_places WHERE user_id = ?")
      .bind(userId)
      .all<{ place_id: string }>();

    return new Set(response.results.map((row) => row.place_id));
  }

  async savePlace(userId: string, placeId: string): Promise<void> {
    await this.ensureSchemaReady();

    await this.db
      .prepare("INSERT OR IGNORE INTO saved_places (user_id, place_id) VALUES (?, ?)")
      .bind(userId, placeId)
      .run();
  }

  async removeSavedPlace(userId: string, placeId: string): Promise<void> {
    await this.ensureSchemaReady();

    await this.db
      .prepare("DELETE FROM saved_places WHERE user_id = ? AND place_id = ?")
      .bind(userId, placeId)
      .run();
  }
}

const inMemoryRepository = new InMemoryJourneyRepository();
let d1Repository: D1JourneyRepository | null = null;

export const getJourneyRepository = (env: AppBindings): JourneyRepository => {
  if (env.DB) {
    d1Repository ??= new D1JourneyRepository(env.DB);
    return d1Repository;
  }

  return inMemoryRepository;
};
