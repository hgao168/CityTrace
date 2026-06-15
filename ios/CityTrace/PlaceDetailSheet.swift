import SwiftUI
import CityTraceKit

struct PlaceDetailSheet: View {
    let place: JourneyPlace
    @ObservedObject var viewModel: JourneyViewModel
    @Environment(\.dismiss) private var dismiss

    private var status: JourneyPlaceStatus {
        viewModel.state.statuses[place.id] ?? .upcoming
    }
    private var isSaved: Bool {
        viewModel.state.savedPlaceIds.contains(place.id)
    }
    private var isDone: Bool { status == .done }
    private var placeNumber: Int {
        (viewModel.places.firstIndex(where: { $0.id == place.id }) ?? 0) + 1
    }

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    ZStack(alignment: .bottomLeading) {
                        Rectangle()
                            .fill(LinearGradient(
                                colors: [Color.accentColor.opacity(0.25), Color.accentColor.opacity(0.05)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ))
                            .frame(height: 180)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(place.category.uppercased())
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundStyle(.secondary)
                                .kerning(1)
                            Text(String(format: "%02d", placeNumber))
                                .font(.system(size: 52, weight: .bold, design: .rounded))
                                .foregroundStyle(Color.accentColor.opacity(0.25))
                        }
                        .padding(20)
                    }

                    VStack(alignment: .leading, spacing: 20) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("\(place.time) · TODAY")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundStyle(.secondary)
                                .kerning(0.5)
                            Text(place.title)
                                .font(.title2)
                                .fontWeight(.bold)
                            Text(place.subtitle)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }

                        HStack(spacing: 0) {
                            factCell(label: "Suggested time", value: place.duration)
                            Divider().frame(height: 36)
                            factCell(label: "From last stop", value: place.walk)
                            Divider().frame(height: 36)
                            factCell(label: "Total distance", value: place.distance)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(.secondarySystemBackground))
                        )

                        VStack(alignment: .leading, spacing: 8) {
                            Text("Why it matters")
                                .font(.headline)
                            Text(place.story)
                                .font(.body)
                                .foregroundStyle(.secondary)
                        }

                        HStack(spacing: 12) {
                            Button {
                                viewModel.toggleSaved()
                            } label: {
                                Label(
                                    isSaved ? "Saved" : "Save place",
                                    systemImage: isSaved ? "heart.fill" : "heart"
                                )
                                .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(.bordered)
                            .tint(isSaved ? .red : .accentColor)

                            Button {
                                viewModel.markArrived()
                            } label: {
                                Text(isDone ? "Place completed" : "Simulate arrival")
                                    .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(.borderedProminent)
                            .disabled(isDone)
                        }
                    }
                    .padding(20)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    private func factCell(label: String, value: String) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.subheadline)
                .fontWeight(.semibold)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
    }
}
