import SwiftUI

struct ShoppingView: View {
    @Environment(HouseholdStore.self) private var store
    @State private var showingAdd = false

    private var needed: [ShoppingItem] {
        store.shoppingItems.filter { !$0.isBought }
    }

    private var bought: [ShoppingItem] {
        store.shoppingItems.filter(\.isBought)
    }

    var body: some View {
        NavigationStack {
            List {
                if needed.isEmpty && bought.isEmpty {
                    ContentUnavailableView(
                        "List is empty",
                        systemImage: "cart",
                        description: Text("Add milk, bananas, or anything the household needs.")
                    )
                }

                if !needed.isEmpty {
                    Section("Need") {
                        ForEach(needed) { item in
                            ShoppingRow(item: item)
                        }
                        .onDelete { offsets in
                            delete(from: needed, at: offsets)
                        }
                    }
                }

                if !bought.isEmpty {
                    Section("Bought") {
                        ForEach(bought) { item in
                            ShoppingRow(item: item)
                        }
                        .onDelete { offsets in
                            delete(from: bought, at: offsets)
                        }
                    }
                }
            }
            .navigationTitle("Shopping")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    if !bought.isEmpty {
                        Button("Clear bought") {
                            store.clearBoughtItems()
                        }
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingAdd = true
                    } label: {
                        Image(systemName: "plus")
                    }
                    .accessibilityLabel("Add shopping item")
                }
            }
            .sheet(isPresented: $showingAdd) {
                AddShoppingItemSheet()
            }
        }
    }

    private func delete(from source: [ShoppingItem], at offsets: IndexSet) {
        let ids = offsets.map { source[$0].id }
        store.shoppingItems.removeAll { ids.contains($0.id) }
        store.save()
    }
}

private struct ShoppingRow: View {
    @Environment(HouseholdStore.self) private var store
    let item: ShoppingItem

    var body: some View {
        Button {
            store.toggleShoppingItem(item)
        } label: {
            HStack(spacing: 12) {
                Image(systemName: item.isBought ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(item.isBought ? Color(hex: "#2F6F4E") : .secondary)
                    .font(.title3)

                VStack(alignment: .leading, spacing: 4) {
                    Text(item.name)
                        .font(.body.weight(.medium))
                        .strikethrough(item.isBought)
                        .foregroundStyle(item.isBought ? .secondary : .primary)

                    HStack(spacing: 8) {
                        Text(item.quantity)
                        if !item.aisle.isEmpty {
                            Text("· \(item.aisle)")
                        }
                        if let addedBy = store.member(for: item.addedByID)?.name {
                            Text("· \(addedBy)")
                        }
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                }

                Spacer(minLength: 0)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

private struct AddShoppingItemSheet: View {
    @Environment(HouseholdStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var quantity = "1"
    @State private var aisle = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Item") {
                    TextField("What to buy?", text: $name)
                    TextField("Quantity", text: $quantity)
                    TextField("Aisle / category", text: $aisle)
                }
            }
            .navigationTitle("Add item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        store.addShoppingItem(
                            name: name.trimmingCharacters(in: .whitespacesAndNewlines),
                            quantity: quantity.trimmingCharacters(in: .whitespacesAndNewlines),
                            aisle: aisle.trimmingCharacters(in: .whitespacesAndNewlines)
                        )
                        dismiss()
                    }
                    .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
    }
}

#Preview {
    ShoppingView()
        .environment(HouseholdStore())
}
