import Foundation

public enum JourneyPlaceStatus: String, Codable, CaseIterable, Sendable {
    case done
    case active
    case upcoming
}

public struct JourneyPlace: Codable, Equatable, Sendable {
    public let id: String
    public let time: String
    public let title: String
    public let subtitle: String
    public let category: String
    public let duration: String
    public let walk: String
    public let distance: String
    public let story: String
    public let initialStatus: JourneyPlaceStatus
    public let latitude: Double?
    public let longitude: Double?

    public init(
        id: String,
        time: String,
        title: String,
        subtitle: String,
        category: String,
        duration: String,
        walk: String,
        distance: String,
        story: String,
        initialStatus: JourneyPlaceStatus,
        latitude: Double? = nil,
        longitude: Double? = nil
    ) {
        self.id = id
        self.time = time
        self.title = title
        self.subtitle = subtitle
        self.category = category
        self.duration = duration
        self.walk = walk
        self.distance = distance
        self.story = story
        self.initialStatus = initialStatus
        self.latitude = latitude
        self.longitude = longitude
    }
}

public struct JourneyState: Codable, Equatable, Sendable {
    public let selectedPlaceId: String
    public let savedPlaceIds: [String]
    public let statuses: [String: JourneyPlaceStatus]

    public init(selectedPlaceId: String, savedPlaceIds: [String], statuses: [String: JourneyPlaceStatus]) {
        self.selectedPlaceId = selectedPlaceId
        self.savedPlaceIds = savedPlaceIds
        self.statuses = statuses
    }

    public static func initial(from places: [JourneyPlace]) -> JourneyState {
        let statuses = Dictionary(uniqueKeysWithValues: places.map { ($0.id, $0.initialStatus) })
        let activePlaceId = places.first(where: { $0.initialStatus == .active })?.id

        return JourneyState(
            selectedPlaceId: activePlaceId ?? places.first?.id ?? "",
            savedPlaceIds: [],
            statuses: statuses
        )
    }
}

public struct JourneySnapshot: Equatable, Sendable {
    public let places: [JourneyPlace]
    public let state: JourneyState
    public let remote: Bool

    public init(places: [JourneyPlace], state: JourneyState, remote: Bool) {
        self.places = places
        self.state = state
        self.remote = remote
    }
}
