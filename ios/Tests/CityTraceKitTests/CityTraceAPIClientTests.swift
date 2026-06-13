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
