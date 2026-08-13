import Foundation
import SwiftUI

@Observable
final class HouseholdStore {
    var members: [FamilyMember] = []
    var chores: [Chore] = []
    var events: [ScheduleEvent] = []
    var shoppingItems: [ShoppingItem] = []
    var currentMemberID: UUID?

    private let storageKey = "household.communicator.v1"

    init(loadSampleIfEmpty: Bool = true) {
        if !load() && loadSampleIfEmpty {
            seedSampleData()
            save()
        }
    }

    var currentMember: FamilyMember? {
        members.first { $0.id == currentMemberID } ?? members.first
    }

    func member(for id: UUID?) -> FamilyMember? {
        guard let id else { return nil }
        return members.first { $0.id == id }
    }

    func memberName(for id: UUID?) -> String {
        member(for: id)?.name ?? "Unassigned"
    }

    // MARK: - Members

    func addMember(name: String, role: String, colorHex: String) {
        let member = FamilyMember(name: name, role: role, colorHex: colorHex)
        members.append(member)
        if currentMemberID == nil {
            currentMemberID = member.id
        }
        save()
    }

    func setCurrentMember(_ id: UUID) {
        currentMemberID = id
        save()
    }

    // MARK: - Chores

    func addChore(title: String, notes: String, assigneeID: UUID?, dueDate: Date?) {
        chores.insert(
            Chore(title: title, notes: notes, assigneeID: assigneeID, dueDate: dueDate),
            at: 0
        )
        save()
    }

    func toggleChore(_ chore: Chore) {
        guard let index = chores.firstIndex(where: { $0.id == chore.id }) else { return }
        chores[index].isDone.toggle()
        save()
    }

    func deleteChores(at offsets: IndexSet) {
        chores.remove(atOffsets: offsets)
        save()
    }

    // MARK: - Schedule

    func addEvent(
        title: String,
        detail: String,
        start: Date,
        end: Date,
        participantIDs: [UUID],
        location: String
    ) {
        events.append(
            ScheduleEvent(
                title: title,
                detail: detail,
                start: start,
                end: end,
                participantIDs: participantIDs,
                location: location
            )
        )
        events.sort { $0.start < $1.start }
        save()
    }

    func deleteEvents(at offsets: IndexSet) {
        events.remove(atOffsets: offsets)
        save()
    }

    var upcomingEvents: [ScheduleEvent] {
        events.sorted { $0.start < $1.start }
    }

    // MARK: - Shopping

    func addShoppingItem(name: String, quantity: String, aisle: String) {
        shoppingItems.insert(
            ShoppingItem(
                name: name,
                quantity: quantity,
                aisle: aisle,
                addedByID: currentMember?.id
            ),
            at: 0
        )
        save()
    }

    func toggleShoppingItem(_ item: ShoppingItem) {
        guard let index = shoppingItems.firstIndex(where: { $0.id == item.id }) else { return }
        shoppingItems[index].isBought.toggle()
        save()
    }

    func clearBoughtItems() {
        shoppingItems.removeAll { $0.isBought }
        save()
    }

    func deleteShoppingItems(at offsets: IndexSet) {
        shoppingItems.remove(atOffsets: offsets)
        save()
    }

    // MARK: - Persistence

    private struct Snapshot: Codable {
        var members: [FamilyMember]
        var chores: [Chore]
        var events: [ScheduleEvent]
        var shoppingItems: [ShoppingItem]
        var currentMemberID: UUID?
    }

    @discardableResult
    func save() -> Bool {
        let snapshot = Snapshot(
            members: members,
            chores: chores,
            events: events,
            shoppingItems: shoppingItems,
            currentMemberID: currentMemberID
        )
        do {
            let data = try JSONEncoder().encode(snapshot)
            UserDefaults.standard.set(data, forKey: storageKey)
            return true
        } catch {
            return false
        }
    }

    @discardableResult
    func load() -> Bool {
        guard let data = UserDefaults.standard.data(forKey: storageKey) else { return false }
        do {
            let snapshot = try JSONDecoder().decode(Snapshot.self, from: data)
            members = snapshot.members
            chores = snapshot.chores
            events = snapshot.events
            shoppingItems = snapshot.shoppingItems
            currentMemberID = snapshot.currentMemberID ?? snapshot.members.first?.id
            return true
        } catch {
            return false
        }
    }

    func resetToSampleData() {
        seedSampleData()
        save()
    }

    private func seedSampleData() {
        let alex = FamilyMember(name: "Alex", role: "Parent", colorHex: "#2F6F4E")
        let jordan = FamilyMember(name: "Jordan", role: "Parent", colorHex: "#C46B2B")
        let sam = FamilyMember(name: "Sam", role: "Kid", colorHex: "#3B6EA5")

        members = [alex, jordan, sam]
        currentMemberID = alex.id

        let calendar = Calendar.current
        let today = calendar.startOfDay(for: .now)

        chores = [
            Chore(title: "Empty dishwasher", assigneeID: sam.id, dueDate: today),
            Chore(title: "Take out recycling", assigneeID: jordan.id, dueDate: today),
            Chore(title: "Wipe kitchen counters", assigneeID: alex.id, dueDate: calendar.date(byAdding: .day, value: 1, to: today))
        ]

        let dinnerStart = calendar.date(bySettingHour: 18, minute: 30, second: 0, of: .now) ?? .now
        let practiceStart = calendar.date(byAdding: .day, value: 1, to: calendar.date(bySettingHour: 16, minute: 0, second: 0, of: .now) ?? .now) ?? .now

        events = [
            ScheduleEvent(
                title: "Family dinner",
                detail: "Tacos night",
                start: dinnerStart,
                end: dinnerStart.addingTimeInterval(3600),
                participantIDs: [alex.id, jordan.id, sam.id],
                location: "Home"
            ),
            ScheduleEvent(
                title: "Soccer practice",
                detail: "Bring water bottle",
                start: practiceStart,
                end: practiceStart.addingTimeInterval(5400),
                participantIDs: [sam.id, jordan.id],
                location: "West Field"
            )
        ]

        shoppingItems = [
            ShoppingItem(name: "Milk", quantity: "1 gal", aisle: "Dairy", addedByID: alex.id),
            ShoppingItem(name: "Bananas", quantity: "1 bunch", aisle: "Produce", addedByID: jordan.id),
            ShoppingItem(name: "Paper towels", quantity: "1 pack", aisle: "Household", addedByID: alex.id)
        ]
    }
}

extension Color {
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch cleaned.count {
        case 6:
            (a, r, g, b) = (255, (int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff)
        case 8:
            (a, r, g, b) = ((int >> 24) & 0xff, (int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff)
        default:
            (a, r, g, b) = (255, 47, 111, 78)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
