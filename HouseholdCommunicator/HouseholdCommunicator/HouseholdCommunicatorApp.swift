import SwiftUI

@main
struct HouseholdCommunicatorApp: App {
    @State private var store = HouseholdStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(store)
        }
    }
}
