import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif
import XCTest
@testable import CityTraceKit

final class JourneyServiceTests: XCTestCase {
    func testLoadJourneySnapshotUsesRemoteStateAndStoredSelection() async {
        let transport = QueueTransport(items: [
            .ok("""
            [
              {"id":"centraal","city_id":"amsterdam","title":"Amsterdam Centraal","subtitle":"Remote subtitle"},
              {"id":"dam","city_id":"amsterdam","title":"Dam Square"}
            ]
            """),
            .ok("""
            {
              "id":"amsterdam-highlights",
              "stops":[
                {"place_id":"centraal","order":1,"status":"done"},
                {"place_id":"dam","order":2,"status":"active"}
              ]
            }
            """),
                        .ok("""
                        [
                            {"id":"dam","city_id":"amsterdam","title":"Dam Square"}
                        ]
                        """)
        ])

        let api = CityTraceAPIClient(baseURL: URL(string: "https://api.citytrace.test")!, transport: transport)
        let stateStore = InMemoryJourneyStateStore(state: JourneyState(
            selectedPlaceId: "centraal",
            savedPlaceIds: ["dam"],
            statuses: ["centraal": .done, "dam": .active]
        ))
        let service = CityTraceJourneyService(apiClient: api, stateStore: stateStore)

        let snapshot = await service.loadJourneySnapshot()

        XCTAssertTrue(snapshot.remote)
        XCTAssertEqual(snapshot.state.selectedPlaceId, "centraal")
        XCTAssertEqual(snapshot.state.savedPlaceIds, ["dam"])
        XCTAssertEqual(snapshot.places.first?.subtitle, "Remote subtitle")
    }

    func testLoadJourneySnapshotFallsBackToFixturesWhenRemoteFails() async {
        let transport = QueueTransport(items: [.failure(URLError(.cannotConnectToHost))])
        let api = CityTraceAPIClient(baseURL: URL(string: "https://api.citytrace.test")!, transport: transport)
        let service = CityTraceJourneyService(apiClient: api, stateStore: InMemoryJourneyStateStore())

        let snapshot = await service.loadJourneySnapshot()

        XCTAssertFalse(snapshot.remote)
        XCTAssertEqual(snapshot.places.count, fixtureJourneyPlaces.count)
        XCTAssertEqual(snapshot.state.selectedPlaceId, "dam")
    }

    func testSyncTripProgressPostsExpectedPayload() async throws {
        let transport = QueueTransport(items: [.ok("{}")])
        let api = CityTraceAPIClient(baseURL: URL(string: "https://api.citytrace.test")!, transport: transport)
        let service = CityTraceJourneyService(apiClient: api, stateStore: InMemoryJourneyStateStore())

        try await service.syncTripProgress(statuses: [
            "centraal": .done,
            "dam": .active,
            "begijnhof": .upcoming,
        ])

        let firstRequest = await transport.firstRequest()
        let request = try XCTUnwrap(firstRequest)
        XCTAssertEqual(request.httpMethod, "PATCH")
        XCTAssertEqual(request.url?.path, "/v1/trips/amsterdam-highlights/progress")

        let bodyData = try XCTUnwrap(request.httpBody)
        let body = try JSONSerialization.jsonObject(with: bodyData) as? [String: Any]
        XCTAssertEqual(body?["arrived_stop_id"] as? String, "dam")
        XCTAssertEqual(body?["completed_trip"] as? Bool, false)
        XCTAssertEqual(body?["completed_stop_ids"] as? [String], ["centraal"])
    }
}

private final class InMemoryJourneyStateStore: JourneyStateStore {
    var state: JourneyState?

    init(state: JourneyState? = nil) {
        self.state = state
    }

    func loadState() throws -> JourneyState? {
        state
    }

    func saveState(_ state: JourneyState) throws {
        self.state = state
    }
}

private actor QueueTransport: HTTPTransport {
    enum Item {
        case ok(String, statusCode: Int = 200)
        case failure(Error)
    }

    private var items: [Item]
    private var requests: [URLRequest] = []

    init(items: [Item]) {
        self.items = items
    }

    func data(for request: URLRequest) async throws -> (Data, URLResponse) {
        requests.append(request)
        let item = items.isEmpty ? Item.ok("{}") : items.removeFirst()

        switch item {
        case let .failure(error):
            throw error
        case let .ok(body, statusCode):
            let response = HTTPURLResponse(
                url: request.url ?? URL(string: "https://api.citytrace.test")!,
                statusCode: statusCode,
                httpVersion: "HTTP/1.1",
                headerFields: ["Content-Type": "application/json"]
            )!
            return (Data(body.utf8), response)
        }
    }

    func firstRequest() -> URLRequest? {
        requests.first
    }
}
