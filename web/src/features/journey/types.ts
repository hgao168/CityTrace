export type PlaceStatus = "done" | "active" | "upcoming";

export type Place = {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  category: string;
  duration: string;
  walk: string;
  distance: string;
  initialStatus: PlaceStatus;
  position: {
    left: number;
    top: number;
  };
  image: string;
  story: string;
};

export type JourneyState = {
  selectedPlaceId: string;
  savedPlaceIds: string[];
  statuses: Record<string, PlaceStatus>;
};
