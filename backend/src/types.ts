export type City = {
  id: string;
  name: string;
  countryCode?: string;
};

export type Place = {
  id: string;
  cityId: string;
  title: string;
  subtitle?: string;
  latitude?: number;
  longitude?: number;
};

export type TripStop = {
  placeId: string;
  order: number;
  status?: string;
};

export type Trip = {
  id: string;
  cityId?: string;
  title?: string;
  stops: TripStop[];
};

export type TripProgressUpdate = {
  arrivedStopId?: string;
  completedStopIds: string[];
  completedTrip: boolean;
};

export type EmptyResponse = Record<string, never>;
