import SwiftUI
import CityTraceKit

@MainActor
final class JourneyViewModel: ObservableObject {
    @Published var places: [JourneyPlace] = []
    @Published var state: JourneyState = JourneyState(selectedPlaceId: "", savedPlaceIds: [], statuses: [:])
    @Published var detailPlaceId: String? = nil
    @Published var isRemote: Bool = false
    @Published var isLoading: Bool = true
    @Published var toast: String = ""

    private let service: CityTraceJourneyService
    private var toastTask: Task<Void, Never>?

    init() {
        let baseURL = URL(string: "https://citytrace.movenova.ai")!
        let apiClient = CityTraceAPIClient(baseURL: baseURL)
        self.service = CityTraceJourneyService(apiClient: apiClient)
    }

    func loadJourney() async {
        let snapshot = await service.loadJourneySnapshot()
        places = snapshot.places
        state = snapshot.state
        isRemote = snapshot.remote
        isLoading = false
    }

    func selectPlace(_ placeId: String, showDetail: Bool = false) {
        state = JourneyState(
            selectedPlaceId: placeId,
            savedPlaceIds: state.savedPlaceIds,
            statuses: state.statuses
        )
        if showDetail { detailPlaceId = placeId }
        service.persistJourneyState(state)
    }

    func markArrived() {
        guard let idx = places.firstIndex(where: { $0.id == state.selectedPlaceId }) else { return }

        var newStatuses = state.statuses
        for (i, place) in places.enumerated() {
            if i <= idx {
                newStatuses[place.id] = .done
            } else if i == idx + 1 {
                newStatuses[place.id] = .active
            } else {
                newStatuses[place.id] = .upcoming
            }
        }

        let arrived = places[idx]
        let next = (idx + 1 < places.count) ? places[idx + 1] : nil
        showToast(
            next != nil
                ? "Arrived at \(arrived.title). Next: \(next!.title)."
                : "Today's city walk is complete!"
        )

        state = JourneyState(
            selectedPlaceId: state.selectedPlaceId,
            savedPlaceIds: state.savedPlaceIds,
            statuses: newStatuses
        )
        detailPlaceId = nil
        service.persistJourneyState(state)

        if isRemote {
            Task { try? await service.syncTripProgress(statuses: newStatuses) }
        }
    }

    func toggleSaved() {
        let id = state.selectedPlaceId
        let wasSaved = state.savedPlaceIds.contains(id)
        var newSaved = state.savedPlaceIds
        if wasSaved {
            newSaved.removeAll { $0 == id }
        } else {
            newSaved.append(id)
        }
        showToast(wasSaved ? "Place removed from your saved list" : "Place added to your saved list")
        state = JourneyState(
            selectedPlaceId: state.selectedPlaceId,
            savedPlaceIds: newSaved,
            statuses: state.statuses
        )
        service.persistJourneyState(state)

        if isRemote {
            Task {
                if wasSaved {
                    try? await service.unsavePlace(placeId: id)
                } else {
                    try? await service.savePlace(placeId: id)
                }
            }
        }
    }

    private func showToast(_ message: String) {
        toastTask?.cancel()
        toast = message
        toastTask = Task { @MainActor [weak self] in
            try? await Task.sleep(for: .seconds(2.8))
            guard !Task.isCancelled else { return }
            self?.toast = ""
        }
    }
}
