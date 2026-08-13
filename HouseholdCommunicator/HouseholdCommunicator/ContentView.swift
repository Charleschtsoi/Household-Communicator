import SwiftUI

struct ContentView: View {
    @Environment(HouseholdStore.self) private var store

    var body: some View {
        TabView {
            ChoresView()
                .tabItem {
                    Label("Chores", systemImage: "checklist")
                }

            ScheduleView()
                .tabItem {
                    Label("Schedule", systemImage: "calendar")
                }

            ShoppingView()
                .tabItem {
                    Label("Shopping", systemImage: "cart")
                }

            FamilyView()
                .tabItem {
                    Label("Family", systemImage: "house.fill")
                }
        }
        .tint(Color(hex: store.currentMember?.colorHex ?? "#2F6F4E"))
    }
}

#Preview {
    ContentView()
        .environment(HouseholdStore())
}
