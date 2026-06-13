import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 12) {
            Text("CityTrace")
                .font(.title)
                .fontWeight(.semibold)
            Text("iOS app shell for TestFlight pipeline")
                .foregroundStyle(.secondary)
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
