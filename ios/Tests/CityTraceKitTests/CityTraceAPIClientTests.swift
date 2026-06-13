import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif
import XCTest
@testable import CityTraceKit

final class CityTraceAPIClientTests: XCTestCase {
    func testFetchCitiesBuildsExpectedRequest() async throws {
        let transport = MockTransport()
        transport.nextData = "[{\"id\":\"paris\",\"name\":\"Paris\"}]".data(using: .utf8)

        let client = CityTraceAPIClient(baseURL: URL(string: "https://api.citytrace.test")!, transport: transport)

        let cities = try await client.fetchCities()

        XCTAssertEqual(cities.count, 1)
        XCTAssertEqual(transport.lastRequest?.url?.absoluteString, "https://api.citytrace.test/v1/cities")
        XCTAssertEqual(transport.lastRequest?.httpMethod, "GET")
    }

    func testUpdateTripProgressUsesPatchAndBody() async throws {
        let transport = MockTransport()
        transport.nextData = "{}".data(using: .utf8)

        let client = CityTraceAPIClient(baseURL: URL(string: "https://api.citytrace.test")!, transport: transport)

        let response = try await client.updateTripProgress(
            tripId: "trip-1",
            progress: TripProgressUpdate(arrivedStopId: "stop-2", completedStopIds: ["stop-1"], completedTrip: false)
        )

        XCTAssertEqual(response, EmptyResponse())
        XCTAssertEqual(transport.lastRequest?.url?.absoluteString, "https://api.citytrace.test/v1/trips/trip-1/progress")
        XCTAssertEqual(transport.lastRequest?.httpMethod, "PATCH")
        XCTAssertNotNil(transport.lastRequest?.httpBody)
    }

        func testFetchNearbyStopsBuildsQueryAndDecodesResponse() async throws {
                let transport = MockTransport()
                transport.nextData = """
                {
                    "trip_id":"amsterdam-highlights",
                    "origin":{"lat":52.37,"lng":4.89},
                    "radius_m":1000,
                    "nearby_stops":[
                        {
                            "place_id":"dam",
                            "order":2,
                            "status":"active",
                            "title":"Dam Square",
                            "latitude":52.373,
                            "longitude":4.892,
                            "distance_m":120
                        }
                    ]
                }
                """.data(using: .utf8)

                let client = CityTraceAPIClient(baseURL: URL(string: "https://api.citytrace.test")!, transport: transport)

                let response = try await client.fetchNearbyStops(
                        tripId: "amsterdam-highlights",
                        latitude: 52.37,
                        longitude: 4.89,
                        radiusMeters: 1000,
                        limit: 3
                )

                XCTAssertEqual(response.tripId, "amsterdam-highlights")
                XCTAssertEqual(response.nearbyStops.first?.placeId, "dam")
                XCTAssertEqual(response.nearbyStops.first?.distanceM, 120)
                XCTAssertEqual(
                        transport.lastRequest?.url?.absoluteString,
                        "https://api.citytrace.test/v1/trips/amsterdam-highlights/nearby?lat=52.37&lng=4.89&radius_m=1000.0&limit=3"
                )
                XCTAssertEqual(transport.lastRequest?.httpMethod, "GET")
        }
}

final class MockTransport: HTTPTransport, @unchecked Sendable {
    var nextData: Data?
    var nextStatusCode = 200
    var lastRequest: URLRequest?

    func data(for request: URLRequest) async throws -> (Data, URLResponse) {
        lastRequest = request

        let response = HTTPURLResponse(
            url: request.url ?? URL(string: "https://api.citytrace.test")!,
            statusCode: nextStatusCode,
            httpVersion: "HTTP/1.1",
            headerFields: ["Content-Type": "application/json"]
        )!

        return (nextData ?? Data(), response)
    }
}
