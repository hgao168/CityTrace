import SwiftUI
import CityTraceKit

struct JourneyView: View {
    @ObservedObject var viewModel: JourneyViewModel

    var body: some View {
        NavigationView {
            ZStack(alignment: .bottom) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("YOUR DAY")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundStyle(.secondary)
                                .kerning(1)
                            Text("Today's Timeline")
                                .font(.title2)
                                .fontWeight(.bold)
                        }
                        .padding(.horizontal, 20)
                        .padding(.top, 20)
                        .padding(.bottom, 16)

                        if viewModel.isLoading {
                            ProgressView("Loading your journey…")
                                .frame(maxWidth: .infinity)
                                .padding(.top, 60)
                        } else {
                            VStack(spacing: 0) {
                                ForEach(viewModel.places, id: \.id) { place in
                                    PlaceRow(
                                        place: place,
                                        status: viewModel.state.statuses[place.id] ?? .upcoming,
                                        isSelected: viewModel.state.selectedPlaceId == place.id,
                                        isLast: place.id == viewModel.places.last?.id
                                    ) {
                                        viewModel.selectPlace(place.id, showDetail: true)
                                    }
                                }
                            }
                            .padding(.horizontal, 16)
                            .padding(.bottom, 40)
                        }
                    }
                }

                if !viewModel.toast.isEmpty {
                    Text(viewModel.toast)
                        .font(.subheadline)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(.black.opacity(0.85), in: Capsule())
                        .padding(.bottom, 20)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
            .animation(.easeInOut(duration: 0.3), value: viewModel.toast)
            .navigationTitle("CityTrace")
            .navigationBarTitleDisplayMode(.inline)
        }
        .sheet(isPresented: Binding(
            get: { viewModel.detailPlaceId != nil },
            set: { if !$0 { viewModel.detailPlaceId = nil } }
        )) {
            if let id = viewModel.detailPlaceId,
               let place = viewModel.places.first(where: { $0.id == id }) {
                PlaceDetailSheet(place: place, viewModel: viewModel)
            }
        }
    }
}

struct PlaceRow: View {
    let place: JourneyPlace
    let status: JourneyPlaceStatus
    let isSelected: Bool
    let isLast: Bool
    let onTap: () -> Void

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(spacing: 0) {
                ZStack {
                    if status == .active {
                        Circle()
                            .stroke(Color.accentColor, lineWidth: 2)
                            .frame(width: 20, height: 20)
                    }
                    Circle()
                        .fill(status == .upcoming ? Color(.systemGray4) : Color.accentColor)
                        .frame(width: 14, height: 14)
                }
                .padding(.top, 16)

                if !isLast {
                    Rectangle()
                        .fill(status == .done ? Color.accentColor.opacity(0.4) : Color(.systemGray5))
                        .frame(width: 2)
                        .frame(maxHeight: .infinity)
                }
            }
            .frame(width: 22)

            Button(action: onTap) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(place.time)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        Spacer()
                        statusBadge
                    }
                    Text(place.title)
                        .font(.headline)
                        .foregroundStyle(status == .done ? .secondary : .primary)
                    Text(place.subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                    HStack(spacing: 12) {
                        Label(place.duration, systemImage: "clock")
                        Label(place.walk, systemImage: "figure.walk")
                    }
                    .font(.caption)
                    .foregroundStyle(.tertiary)
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(isSelected ? Color.accentColor.opacity(0.08) : Color(.systemBackground))
                        .shadow(color: .black.opacity(0.06), radius: 4, y: 2)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(isSelected ? Color.accentColor.opacity(0.3) : Color.clear, lineWidth: 1.5)
                )
            }
            .buttonStyle(.plain)
            .padding(.vertical, 6)
        }
    }

    @ViewBuilder
    private var statusBadge: some View {
        switch status {
        case .done:
            Image(systemName: "checkmark.circle.fill")
                .foregroundStyle(.green)
                .font(.caption)
        case .active:
            Text("NOW")
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundStyle(.white)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(Color.accentColor, in: Capsule())
        case .upcoming:
            EmptyView()
        }
    }
}

struct SavedView: View {
    @ObservedObject var viewModel: JourneyViewModel

    private var savedPlaces: [JourneyPlace] {
        viewModel.places.filter { viewModel.state.savedPlaceIds.contains($0.id) }
    }

    var body: some View {
        NavigationView {
            Group {
                if savedPlaces.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "heart")
                            .font(.system(size: 44))
                            .foregroundStyle(.secondary)
                        Text("No saved places yet")
                            .font(.headline)
                        Text("Open a place and tap Save to keep it here.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding()
                } else {
                    List(savedPlaces, id: \.id) { place in
                        Button {
                            viewModel.selectPlace(place.id, showDetail: true)
                        } label: {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(place.title).font(.headline)
                                Text(place.subtitle)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(.vertical, 4)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .navigationTitle("Saved Places")
        }
        .sheet(isPresented: Binding(
            get: { viewModel.detailPlaceId != nil },
            set: { if !$0 { viewModel.detailPlaceId = nil } }
        )) {
            if let id = viewModel.detailPlaceId,
               let place = viewModel.places.first(where: { $0.id == id }) {
                PlaceDetailSheet(place: place, viewModel: viewModel)
            }
        }
    }
}
