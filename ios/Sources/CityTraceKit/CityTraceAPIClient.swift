import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public enum CityTraceAPIError: Error, Equatable {
    case invalidURL
    case invalidResponse
    case httpStatus(Int)
}

public protocol HTTPTransport: Sendable {
    func data(for request: URLRequest) async throws -> (Data, URLResponse)
}

extension URLSession: HTTPTransport {
    public func data(for request: URLRequest) async throws -> (Data, URLResponse) {
        try await data(for: request, delegate: nil)
    }
}

public struct CityTraceAPIClient: Sendable {
    private let baseURL: URL
    private let transport: HTTPTransport
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    public init(baseURL: URL, transport: HTTPTransport = URLSession.shared) {
        self.baseURL = baseURL
        self.transport = transport

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        self.decoder = decoder

        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        self.encoder = encoder
    }

    public func fetchCities() async throws -> [City] {
        try await send(path: "/v1/cities", method: "GET", decode: [City].self)
    }

    public func fetchPlaces(cityId: String) async throws -> [Place] {
        try await send(path: "/v1/cities/\(cityId)/places", method: "GET", decode: [Place].self)
    }

    public func fetchTrip(tripId: String) async throws -> Trip {
        try await send(path: "/v1/trips/\(tripId)", method: "GET", decode: Trip.self)
    }

    public func updateTripProgress(tripId: String, progress: TripProgressUpdate) async throws -> EmptyResponse {
        try await send(path: "/v1/trips/\(tripId)/progress", method: "PATCH", body: progress, decode: EmptyResponse.self)
    }

    public func fetchSavedPlaces(userId: String) async throws -> [Place] {
        try await send(path: "/v1/users/\(userId)/saved-places", method: "GET", decode: [Place].self)
    }

    public func savePlace(userId: String, placeId: String) async throws -> EmptyResponse {
        try await send(path: "/v1/users/\(userId)/saved-places/\(placeId)", method: "PUT", decode: EmptyResponse.self)
    }

    public func removeSavedPlace(userId: String, placeId: String) async throws -> EmptyResponse {
        try await send(path: "/v1/users/\(userId)/saved-places/\(placeId)", method: "DELETE", decode: EmptyResponse.self)
    }

    private func send<Response: Decodable>(
        path: String,
        method: String,
        decode: Response.Type
    ) async throws -> Response {
        try await send(path: path, method: method, body: Optional<Data>.none, decode: decode)
    }

    private func send<RequestBody: Encodable, Response: Decodable>(
        path: String,
        method: String,
        body: RequestBody,
        decode: Response.Type
    ) async throws -> Response {
        let bodyData = try encoder.encode(body)
        return try await send(path: path, method: method, body: bodyData, decode: decode)
    }

    private func send<Response: Decodable>(
        path: String,
        method: String,
        body: Data?,
        decode: Response.Type
    ) async throws -> Response {
        guard let url = URL(string: path, relativeTo: baseURL) else {
            throw CityTraceAPIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        let (data, response) = try await transport.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw CityTraceAPIError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw CityTraceAPIError.httpStatus(httpResponse.statusCode)
        }

        if data.isEmpty, let empty = EmptyResponse() as? Response {
            return empty
        }

        return try decoder.decode(Response.self, from: data)
    }
}
