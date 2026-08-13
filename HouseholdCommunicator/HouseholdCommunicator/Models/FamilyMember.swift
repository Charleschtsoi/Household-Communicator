import Foundation

struct FamilyMember: Identifiable, Codable, Hashable {
    var id: UUID
    var name: String
    var role: String
    var colorHex: String

    init(
        id: UUID = UUID(),
        name: String,
        role: String = "Family",
        colorHex: String = "#2F6F4E"
    ) {
        self.id = id
        self.name = name
        self.role = role
        self.colorHex = colorHex
    }
}
