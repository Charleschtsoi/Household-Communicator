import Foundation

struct Chore: Identifiable, Codable, Hashable {
    var id: UUID
    var title: String
    var notes: String
    var assigneeID: UUID?
    var isDone: Bool
    var dueDate: Date?
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        notes: String = "",
        assigneeID: UUID? = nil,
        isDone: Bool = false,
        dueDate: Date? = nil,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.notes = notes
        self.assigneeID = assigneeID
        self.isDone = isDone
        self.dueDate = dueDate
        self.createdAt = createdAt
    }
}
