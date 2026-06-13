CREATE TABLE IF NOT EXISTS trip_stop_statuses (
  trip_id TEXT NOT NULL,
  place_id TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (trip_id, place_id)
);

CREATE TABLE IF NOT EXISTS saved_places (
  user_id TEXT NOT NULL,
  place_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, place_id)
);
