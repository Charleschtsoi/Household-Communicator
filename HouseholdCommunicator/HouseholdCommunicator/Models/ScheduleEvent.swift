import Foundation

struct ScheduleEvent: Identifiable, Codable, Hashable {
    var id: UUID
    var title: String
    var detail: String
    var start: Date
    var end: Date
    var participantIDs: [UUID]
    var location: String

    init(
        id: UUID = UUID(),
        title: String,
        detail: String = "",
        start: Date,
        end: Date,
        participantIDs: [UUID] = [],
        location: String = ""
    ) {
        self.id = id
        self.title = title
        self.detail = detail
        self.start = start
        self.end = end
        self.participantIDs = participantIDs
        self.location = location
    }
}
