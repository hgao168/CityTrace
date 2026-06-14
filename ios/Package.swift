// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CityTraceKit",
    platforms: [
        .iOS(.v16),
        .macOS(.v12)
    ],
    products: [
        .library(
            name: "CityTraceKit",
            targets: ["CityTraceKit"]
        )
    ],
    targets: [
        .target(
            name: "CityTraceKit"
        ),
        .testTarget(
            name: "CityTraceKitTests",
            dependencies: ["CityTraceKit"]
        )
    ]
)
