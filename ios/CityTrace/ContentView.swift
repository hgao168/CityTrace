import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = JourneyViewModel()

    var body: some View {
        TabView {
            JourneyView(viewModel: viewModel)
                .tabItem { Label("Journey", systemImage: "map.fill") }
            SavedView(viewModel: viewModel)
                .tabItem { Label("Saved", systemImage: "heart.fill") }
        }
        .task { await viewModel.loadJourney() }
    }
}

#Preview {
    ContentView()
}
