import Foundation

public struct JourneyAPIContext: Equatable, Sendable {
    public let cityId: String
    public let tripId: String
    public let userId: String

    public init(cityId: String, tripId: String, userId: String) {
        self.cityId = cityId
        self.tripId = tripId
        self.userId = userId
    }

    public static let webDemo = JourneyAPIContext(
        cityId: "amsterdam",
        tripId: "amsterdam-highlights",
        userId: "web-demo"
    )
}

public protocol JourneyStateStore {
    func loadState() throws -> JourneyState?
    func saveState(_ state: JourneyState) throws
}

public final class FileJourneyStateStore: JourneyStateStore {
    private let fileURL: URL
    private let fileManager: FileManager
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder

    public init(fileURL: URL? = nil, fileManager: FileManager = .default) {
        self.fileManager = fileManager
        self.fileURL = fileURL ?? FileJourneyStateStore.defaultFileURL(fileManager: fileManager)
        self.encoder = JSONEncoder()
        self.decoder = JSONDecoder()
    }

    public func loadState() throws -> JourneyState? {
        guard fileManager.fileExists(atPath: fileURL.path) else {
            return nil
        }

        let data = try Data(contentsOf: fileURL)
        return try decoder.decode(JourneyState.self, from: data)
    }

    public func saveState(_ state: JourneyState) throws {
        let data = try encoder.encode(state)
        try fileManager.createDirectory(
            at: fileURL.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        try data.write(to: fileURL, options: .atomic)
    }

    private static func defaultFileURL(fileManager: FileManager) -> URL {
        let baseDirectory =
            fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first ??
            fileManager.urls(for: .documentDirectory, in: .userDomainMask).first ??
            fileManager.temporaryDirectory

        return baseDirectory
            .appendingPathComponent("CityTrace", isDirectory: true)
            .appendingPathComponent("journey-state-v1.json")
    }
}

public final class CityTraceJourneyService {
    private let apiClient: CityTraceAPIClient
    private let context: JourneyAPIContext
    private let fixtures: [JourneyPlace]
    private let stateStore: JourneyStateStore

    public init(
        apiClient: CityTraceAPIClient,
        context: JourneyAPIContext = .webDemo,
        fixtures: [JourneyPlace] = fixtureJourneyPlaces,
        stateStore: JourneyStateStore = FileJourneyStateStore()
    ) {
        self.apiClient = apiClient
        self.context = context
        self.fixtures = fixtures
        self.stateStore = stateStore
    }

    public func loadJourneySnapshot() async -> JourneySnapshot {
        do {
            async let placesResponse = apiClient.fetchPlaces(cityId: context.cityId)
            async let tripResponse = apiClient.fetchTrip(tripId: context.tripId)
            async let savedResponse = apiClient.fetchSavedPlaces(userId: context.userId)

            let places = toJourneyPlaces(apiPlaces: try await placesResponse)
            let remoteState = toState(places: places, trip: try await tripResponse, savedPlaces: try await savedResponse)
            let state = mergeWithLocalState(seed: remoteState, places: places, mergeSavedAndStatuses: false)

            return JourneySnapshot(places: places, state: state, remote: true)
        } catch {
            let places = fixtures
            let state = mergeWithLocalState(seed: JourneyState.initial(from: places), places: places, mergeSavedAndStatuses: true)
            return JourneySnapshot(places: places, state: state, remote: false)
        }
    }

    public func savePlace(placeId: String) async throws {
        _ = try await apiClient.savePlace(userId: context.userId, placeId: placeId)
    }

    public func unsavePlace(placeId: String) async throws {
        _ = try await apiClient.removeSavedPlace(userId: context.userId, placeId: placeId)
    }

    public func syncTripProgress(statuses: [String: JourneyPlaceStatus]) async throws {
        let completedStopIds = statuses
            .filter { $0.value == .done }
            .map(\.key)
            .sorted()

        let arrivedStopId = statuses.first(where: { $0.value == .active })?.key
        let completedTrip = !statuses.isEmpty && statuses.values.allSatisfy { $0 == .done }

        let update = TripProgressUpdate(
            arrivedStopId: arrivedStopId,
            completedStopIds: completedStopIds,
            completedTrip: completedTrip
        )

        _ = try await apiClient.updateTripProgress(tripId: context.tripId, progress: update)
    }

    public func persistJourneyState(_ state: JourneyState) {
        do {
            try stateStore.saveState(state)
        } catch {
            // Journey can continue when persistence is unavailable.
        }
    }

    private func toJourneyPlaces(apiPlaces: [Place]) -> [JourneyPlace] {
        let fallbackByID = Dictionary(uniqueKeysWithValues: fixtures.map { ($0.id, $0) })

        return apiPlaces.enumerated().map { index, apiPlace in
            if let fallback = fallbackByID[apiPlace.id] {
                return JourneyPlace(
                    id: apiPlace.id,
                    time: fallback.time,
                    title: apiPlace.title,
                    subtitle: apiPlace.subtitle ?? fallback.subtitle,
                    category: fallback.category,
                    duration: fallback.duration,
                    walk: fallback.walk,
                    distance: fallback.distance,
                    story: fallback.story,
                    initialStatus: fallback.initialStatus,
                    latitude: apiPlace.latitude ?? fallback.latitude,
                    longitude: apiPlace.longitude ?? fallback.longitude
                )
            }

            return JourneyPlace(
                id: apiPlace.id,
                time: "",
                title: apiPlace.title,
                subtitle: apiPlace.subtitle ?? "",
                category: "City Spot",
                duration: "30 min",
                walk: "",
                distance: "",
                story: "",
                initialStatus: index == 0 ? .active : .upcoming,
                latitude: apiPlace.latitude,
                longitude: apiPlace.longitude
            )
        }
    }

    private func toState(places: [JourneyPlace], trip: Trip, savedPlaces: [Place]) -> JourneyState {
        let placeIDs = Set(places.map(\.id))
        var statuses = JourneyState.initial(from: places).statuses

        for stop in trip.stops {
            guard placeIDs.contains(stop.placeId) else {
                continue
            }

            statuses[stop.placeId] = status(from: stop.status)
        }

        let activeStop = trip.stops.first(where: { status(from: $0.status) == .active })

        return JourneyState(
            selectedPlaceId: activeStop?.placeId ?? JourneyState.initial(from: places).selectedPlaceId,
            savedPlaceIds: savedPlaces.map(\.id).filter { placeIDs.contains($0) },
            statuses: statuses
        )
    }

    private func mergeWithLocalState(seed: JourneyState, places: [JourneyPlace], mergeSavedAndStatuses: Bool) -> JourneyState {
        guard let storedState = try? stateStore.loadState() else {
            return seed
        }

        let placeIDs = Set(places.map(\.id))
        let selectedPlaceID = placeIDs.contains(storedState.selectedPlaceId)
            ? storedState.selectedPlaceId
            : seed.selectedPlaceId

        guard mergeSavedAndStatuses else {
            return JourneyState(
                selectedPlaceId: selectedPlaceID,
                savedPlaceIds: seed.savedPlaceIds,
                statuses: seed.statuses
            )
        }

        var mergedStatuses = seed.statuses
        for (placeID, status) in storedState.statuses where placeIDs.contains(placeID) {
            mergedStatuses[placeID] = status
        }

        let mergedSavedPlaceIDs = storedState.savedPlaceIds.filter { placeIDs.contains($0) }

        return JourneyState(
            selectedPlaceId: selectedPlaceID,
            savedPlaceIds: mergedSavedPlaceIDs,
            statuses: mergedStatuses
        )
    }

    private func status(from value: String?) -> JourneyPlaceStatus {
        guard let value, let status = JourneyPlaceStatus(rawValue: value) else {
            return .upcoming
        }

        return status
    }
}
