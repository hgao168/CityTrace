import type { Place } from "./types";

export const places: Place[] = [
  {
    id: "centraal",
    time: "09:00",
    title: "Amsterdam Centraal",
    subtitle: "Begin at the city's gateway on the water",
    category: "City Landmark",
    duration: "20 min",
    walk: "Starting point",
    distance: "0 km",
    initialStatus: "done",
    position: { left: 15.6, top: 72.7 },
    image:
      "linear-gradient(165deg, transparent 35%, #b75a3d 36% 52%, transparent 53%), linear-gradient(20deg, #668c85 0 30%, #d9b58c 31% 62%, #d9d0b6 63%)",
    story:
      "Built in the late 19th century, this Neo-Renaissance station forms a grand gateway into the city. It stands on three artificial islands supported by thousands of wooden piles and reshaped Amsterdam's relationship with its harbor.",
  },
  {
    id: "dam",
    time: "09:35",
    title: "Dam Square",
    subtitle: "Where the city began",
    category: "Historic Square",
    duration: "35 min",
    walk: "9 min walk",
    distance: "0.7 km",
    initialStatus: "active",
    position: { left: 32.8, top: 49.6 },
    image:
      "linear-gradient(90deg, transparent 18%, #cfa47d 19% 55%, transparent 56%), linear-gradient(160deg, #778a83 0 45%, #dbc5a9 46%)",
    story:
      "In the 13th century, a dam was built across the Amstel River, giving the city its name. Today, the Royal Palace, National Monument, and old commercial streets still reveal how trade, power, and public life converged here.",
  },
  {
    id: "begijnhof",
    time: "10:30",
    title: "Begijnhof",
    subtitle: "A quiet courtyard hidden in the city center",
    category: "Hidden Courtyard",
    duration: "30 min",
    walk: "11 min walk",
    distance: "1.5 km",
    initialStatus: "upcoming",
    position: { left: 52.4, top: 53.1 },
    image:
      "linear-gradient(100deg, transparent 32%, #4d6659 33% 40%, transparent 41%), linear-gradient(25deg, #5d7e6d 0 35%, #c99c77 36% 67%, #d8ccad 68%)",
    story:
      "This courtyard was once home to the Beguines, religious women who lived, worked, and cared for the sick without formally joining a convent. It also contains one of Amsterdam's few surviving medieval wooden houses.",
  },
  {
    id: "canal",
    time: "11:25",
    title: "Nine Streets & Canal Belt",
    subtitle: "Follow the curves of the Golden Age",
    category: "World Heritage",
    duration: "60 min",
    walk: "8 min walk",
    distance: "2.1 km",
    initialStatus: "upcoming",
    position: { left: 67.4, top: 32.3 },
    image:
      "linear-gradient(75deg, transparent 47%, #aad0d2 48% 58%, transparent 59%), linear-gradient(155deg, #607b76 0 42%, #b36f52 43% 62%, #d5bc92 63%)",
    story:
      "The 17th-century canal expansion organized waterworks, homes, and commerce into elegant concentric rings. The tall, narrow canal houses were not merely an aesthetic choice; they also reflect taxes once based on the width of a waterfront facade.",
  },
  {
    id: "jordaan",
    time: "13:30",
    title: "Jordaan Lunch Walk",
    subtitle: "Taste local life in the old artisans' quarter",
    category: "Neighborhood Life",
    duration: "75 min",
    walk: "13 min walk",
    distance: "3.2 km",
    initialStatus: "upcoming",
    position: { left: 80.2, top: 44.4 },
    image:
      "linear-gradient(25deg, transparent 42%, #356458 43% 53%, transparent 54%), linear-gradient(145deg, #7d9481 0 38%, #d6a15d 39% 65%, #dfcfad 66%)",
    story:
      "The Jordaan began as a dense residential district for workers and immigrants. In the late 20th century, galleries, cafes, and small studios moved in, while its narrow streets retained their intimate scale.",
  },
  {
    id: "anne-frank",
    time: "15:15",
    title: "Anne Frank House",
    subtitle: "Understand war and memory through one hidden room",
    category: "Site of Memory",
    duration: "90 min",
    walk: "7 min walk",
    distance: "4.0 km",
    initialStatus: "upcoming",
    position: { left: 89.2, top: 21.7 },
    image:
      "linear-gradient(90deg, transparent 17%, #6d4032 18% 25%, transparent 26% 53%, #6d4032 54% 61%, transparent 62%), linear-gradient(160deg, #84928d 0 42%, #98725e 43% 70%, #d2bea1 71%)",
    story:
      "Anne Frank and her family hid for two years in the secret annex behind this canal house. Through the original rooms, her diary, and personal objects, the museum gives human scale to Nazi persecution and reminds us why memory must be preserved.",
  },
];

export const initialStatuses = Object.fromEntries(
  places.map((place) => [place.id, place.initialStatus]),
);
