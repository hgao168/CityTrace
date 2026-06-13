import type { City, Place, Trip } from "./types";

export const cities: City[] = [
  {
    id: "amsterdam",
    name: "Amsterdam",
    countryCode: "NL",
  },
];

export const places: Place[] = [
  {
    id: "centraal",
    cityId: "amsterdam",
    title: "Amsterdam Centraal",
    subtitle: "Begin at the city's gateway on the water",
    latitude: 52.378,
    longitude: 4.9,
  },
  {
    id: "dam",
    cityId: "amsterdam",
    title: "Dam Square",
    subtitle: "Where the city began",
    latitude: 52.3731,
    longitude: 4.8922,
  },
  {
    id: "begijnhof",
    cityId: "amsterdam",
    title: "Begijnhof",
    subtitle: "A quiet courtyard hidden in the city center",
    latitude: 52.3692,
    longitude: 4.8903,
  },
  {
    id: "canal",
    cityId: "amsterdam",
    title: "Nine Streets & Canal Belt",
    subtitle: "Follow the curves of the Golden Age",
    latitude: 52.3706,
    longitude: 4.8833,
  },
  {
    id: "jordaan",
    cityId: "amsterdam",
    title: "Jordaan Lunch Walk",
    subtitle: "Taste local life in the old artisans' quarter",
    latitude: 52.3737,
    longitude: 4.8754,
  },
  {
    id: "anne-frank",
    cityId: "amsterdam",
    title: "Anne Frank House",
    subtitle: "Understand war and memory through one hidden room",
    latitude: 52.3752,
    longitude: 4.884,
  },
];

const tripTemplate: Trip = {
  id: "amsterdam-highlights",
  cityId: "amsterdam",
  title: "CityTrace Amsterdam Highlights",
  stops: places.map((place, index) => ({
    placeId: place.id,
    order: index + 1,
    status: index === 0 ? "done" : index === 1 ? "active" : "upcoming",
  })),
};

export const cloneTrip = (trip: Trip): Trip => ({
  id: trip.id,
  cityId: trip.cityId,
  title: trip.title,
  stops: trip.stops.map((stop) => ({ ...stop })),
});

export const tripTemplates = new Map<string, Trip>([[tripTemplate.id, tripTemplate]]);

export const trips = new Map<string, Trip>(
  Array.from(tripTemplates.entries(), ([id, trip]) => [id, cloneTrip(trip)]),
);

export const userSavedPlaceIds = new Map<string, Set<string>>();
