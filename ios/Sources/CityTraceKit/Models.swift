import Foundation

public enum PlaceStatus: String, Codable, Equatable, Sendable {
    case done
    case active
    case upcoming
}

public struct City: Codable, Equatable, Sendable {
    public let id: String
    public let name: String
    public let countryCode: String?

    public init(id: String, name: String, countryCode: String? = nil) {
        self.id = id
        self.name = name
        self.countryCode = countryCode
    }
}

public struct Place: Codable, Equatable, Sendable {
    public let id: String
    public let cityId: String
    public let title: String
    public let subtitle: String?
    public let latitude: Double?
    public let longitude: Double?

    public init(
        id: String,
        cityId: String,
        title: String,
        subtitle: String? = nil,
        latitude: Double? = nil,
        longitude: Double? = nil
    ) {
        self.id = id
        self.cityId = cityId
        self.title = title
        self.subtitle = subtitle
        self.latitude = latitude
        self.longitude = longitude
    }
}

public struct Trip: Codable, Equatable, Sendable {
    public let id: String
    public let cityId: String?
    public let title: String?
    public let stops: [TripStop]

    public init(id: String, cityId: String? = nil, title: String? = nil, stops: [TripStop] = []) {
        self.id = id
        self.cityId = cityId
        self.title = title
        self.stops = stops
    }
}

public struct TripStop: Codable, Equatable, Sendable {
    public let placeId: String
    public let order: Int
    public let status: String?

    public init(placeId: String, order: Int, status: String? = nil) {
        self.placeId = placeId
        self.order = order
        self.status = status
    }
}

public struct TripProgressUpdate: Codable, Equatable, Sendable {
    public let arrivedStopId: String?
    public let completedStopIds: [String]
    public let completedTrip: Bool

    public init(arrivedStopId: String? = nil, completedStopIds: [String] = [], completedTrip: Bool = false) {
        self.arrivedStopId = arrivedStopId
        self.completedStopIds = completedStopIds
        self.completedTrip = completedTrip
    }
}

public struct EmptyResponse: Codable, Equatable, Sendable {
    public init() {}
}

public struct NearbyTripStopsResponse: Codable, Equatable, Sendable {
    public struct Origin: Codable, Equatable, Sendable {
        public let lat: Double
        public let lng: Double

        public init(lat: Double, lng: Double) {
            self.lat = lat
            self.lng = lng
        }
    }

    public struct NearbyStop: Codable, Equatable, Sendable {
        public let placeId: String
        public let order: Int
        public let status: String
        public let title: String
        public let latitude: Double
        public let longitude: Double
        public let distanceM: Int

        public init(
            placeId: String,
            order: Int,
            status: String,
            title: String,
            latitude: Double,
            longitude: Double,
            distanceM: Int
        ) {
            self.placeId = placeId
            self.order = order
            self.status = status
            self.title = title
            self.latitude = latitude
            self.longitude = longitude
            self.distanceM = distanceM
        }
    }

    public let tripId: String
    public let origin: Origin
    public let radiusM: Double
    public let nearbyStops: [NearbyStop]

    public init(tripId: String, origin: Origin, radiusM: Double, nearbyStops: [NearbyStop]) {
        self.tripId = tripId
        self.origin = origin
        self.radiusM = radiusM
        self.nearbyStops = nearbyStops
    }
}
