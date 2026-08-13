import Foundation

struct ShoppingItem: Identifiable, Codable, Hashable {
    var id: UUID
    var name: String
    var quantity: String
    var aisle: String
    var isBought: Bool
    var addedByID: UUID?
    var createdAt: Date

    init(
        id: UUID = UUID(),
        name: String,
        quantity: String = "1",
        aisle: String = "",
        isBought: Bool = false,
        addedByID: UUID? = nil,
        createdAt: Date = .now
    ) {
        self.id = id
        self.name = name
        self.quantity = quantity
        self.aisle = aisle
        self.isBought = isBought
        self.addedByID = addedByID
        self.createdAt = createdAt
    }
}
