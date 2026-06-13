const places = [
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
    latitude: 52.378,
    longitude: 4.9,
    imageTone: "brick",
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
    latitude: 52.3731,
    longitude: 4.8922,
    imageTone: "sand",
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
    latitude: 52.3692,
    longitude: 4.8903,
    imageTone: "garden",
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
    latitude: 52.3706,
    longitude: 4.8833,
    imageTone: "canal",
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
    latitude: 52.3737,
    longitude: 4.8754,
    imageTone: "gold",
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
    latitude: 52.3752,
    longitude: 4.884,
    imageTone: "memory",
    story:
      "Anne Frank and her family hid for two years in the secret annex behind this canal house. Through the original rooms, her diary, and personal objects, the museum gives human scale to Nazi persecution and reminds us why memory must be preserved.",
  },
];

function buildInitialStatuses(items) {
  return items.reduce(function (statuses, place) {
    statuses[place.id] = place.initialStatus;
    return statuses;
  }, {});
}

module.exports = {
  buildInitialStatuses,
  places,
};
