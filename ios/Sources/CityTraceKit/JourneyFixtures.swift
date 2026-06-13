import Foundation

public let fixtureJourneyPlaces: [JourneyPlace] = [
    JourneyPlace(
        id: "centraal",
        time: "09:00",
        title: "Amsterdam Centraal",
        subtitle: "Begin at the city's gateway on the water",
        category: "City Landmark",
        duration: "20 min",
        walk: "Starting point",
        distance: "0 km",
        story: "Built in the late 19th century, this Neo-Renaissance station forms a grand gateway into the city.",
        initialStatus: .done,
        latitude: 52.379189,
        longitude: 4.899431
    ),
    JourneyPlace(
        id: "dam",
        time: "09:35",
        title: "Dam Square",
        subtitle: "Where the city began",
        category: "Historic Square",
        duration: "35 min",
        walk: "9 min walk",
        distance: "0.7 km",
        story: "In the 13th century, a dam was built across the Amstel River, giving the city its name.",
        initialStatus: .active,
        latitude: 52.37317,
        longitude: 4.89228
    ),
    JourneyPlace(
        id: "begijnhof",
        time: "10:30",
        title: "Begijnhof",
        subtitle: "A quiet courtyard hidden in the city center",
        category: "Hidden Courtyard",
        duration: "30 min",
        walk: "11 min walk",
        distance: "1.5 km",
        story: "This courtyard was once home to the Beguines, religious women who lived and worked without formal vows.",
        initialStatus: .upcoming,
        latitude: 52.36907,
        longitude: 4.8908
    ),
    JourneyPlace(
        id: "canal",
        time: "11:25",
        title: "Nine Streets & Canal Belt",
        subtitle: "Follow the curves of the Golden Age",
        category: "World Heritage",
        duration: "60 min",
        walk: "8 min walk",
        distance: "2.1 km",
        story: "The 17th-century canal expansion organized waterworks, homes, and commerce into elegant concentric rings.",
        initialStatus: .upcoming,
        latitude: 52.3734,
        longitude: 4.8833
    ),
    JourneyPlace(
        id: "jordaan",
        time: "13:30",
        title: "Jordaan Lunch Walk",
        subtitle: "Taste local life in the old artisans' quarter",
        category: "Neighborhood Life",
        duration: "75 min",
        walk: "13 min walk",
        distance: "3.2 km",
        story: "The Jordaan began as a dense residential district for workers and immigrants.",
        initialStatus: .upcoming,
        latitude: 52.37403,
        longitude: 4.87993
    ),
    JourneyPlace(
        id: "anne-frank",
        time: "15:15",
        title: "Anne Frank House",
        subtitle: "Understand war and memory through one hidden room",
        category: "Site of Memory",
        duration: "90 min",
        walk: "7 min walk",
        distance: "4.0 km",
        story: "Anne Frank and her family hid for two years in the secret annex behind this canal house.",
        initialStatus: .upcoming,
        latitude: 52.37522,
        longitude: 4.88398
    )
]
