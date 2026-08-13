import SwiftUI

struct ChoresView: View {
    @Environment(HouseholdStore.self) private var store
    @State private var showingAdd = false

    private var openChores: [Chore] {
        store.chores.filter { !$0.isDone }
    }

    private var doneChores: [Chore] {
        store.chores.filter(\.isDone)
    }

    var body: some View {
        NavigationStack {
            List {
                if openChores.isEmpty && doneChores.isEmpty {
                    ContentUnavailableView(
                        "No chores yet",
                        systemImage: "checklist",
                        description: Text("Add the first household task to get started.")
                    )
                }

                if !openChores.isEmpty {
                    Section("To do") {
                        ForEach(openChores) { chore in
                            ChoreRow(chore: chore)
                        }
                        .onDelete { offsets in
                            delete(from: openChores, at: offsets)
                        }
                    }
                }

                if !doneChores.isEmpty {
                    Section("Done") {
                        ForEach(doneChores) { chore in
                            ChoreRow(chore: chore)
                        }
                        .onDelete { offsets in
                            delete(from: doneChores, at: offsets)
                        }
                    }
                }
            }
            .navigationTitle("Chores")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingAdd = true
                    } label: {
                        Image(systemName: "plus")
                    }
                    .accessibilityLabel("Add chore")
                }
            }
            .sheet(isPresented: $showingAdd) {
                AddChoreSheet()
            }
        }
    }

    private func delete(from source: [Chore], at offsets: IndexSet) {
        let ids = offsets.map { source[$0].id }
        store.chores.removeAll { ids.contains($0.id) }
        store.save()
    }
}

private struct ChoreRow: View {
    @Environment(HouseholdStore.self) private var store
    let chore: Chore

    var body: some View {
        Button {
            store.toggleChore(chore)
        } label: {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: chore.isDone ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(chore.isDone ? Color(hex: "#2F6F4E") : .secondary)
                    .font(.title3)

                VStack(alignment: .leading, spacing: 4) {
                    Text(chore.title)
                        .font(.body.weight(.medium))
                        .strikethrough(chore.isDone)
                        .foregroundStyle(chore.isDone ? .secondary : .primary)

                    HStack(spacing: 8) {
                        Label(store.memberName(for: chore.assigneeID), systemImage: "person")
                        if let due = chore.dueDate {
                            Label(due.formatted(date: .abbreviated, time: .omitted), systemImage: "calendar")
                        }
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)

                    if !chore.notes.isEmpty {
                        Text(chore.notes)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer(minLength: 0)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

private struct AddChoreSheet: View {
    @Environment(HouseholdStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var notes = ""
    @State private var assigneeID: UUID?
    @State private var hasDueDate = true
    @State private var dueDate = Date()

    var body: some View {
        NavigationStack {
            Form {
                Section("Task") {
                    TextField("What needs doing?", text: $title)
                    TextField("Notes (optional)", text: $notes, axis: .vertical)
                        .lineLimit(2...4)
                }

                Section("Assign") {
                    Picker("Assignee", selection: $assigneeID) {
                        Text("Unassigned").tag(UUID?.none)
                        ForEach(store.members) { member in
                            Text(member.name).tag(Optional(member.id))
                        }
                    }
                }

                Section("Due") {
                    Toggle("Has due date", isOn: $hasDueDate)
                    if hasDueDate {
                        DatePicker("Due date", selection: $dueDate, displayedComponents: .date)
                    }
                }
            }
            .navigationTitle("New chore")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        store.addChore(
                            title: title.trimmingCharacters(in: .whitespacesAndNewlines),
                            notes: notes.trimmingCharacters(in: .whitespacesAndNewlines),
                            assigneeID: assigneeID,
                            dueDate: hasDueDate ? dueDate : nil
                        )
                        dismiss()
                    }
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .onAppear {
                assigneeID = store.currentMember?.id
            }
        }
    }
}

#Preview {
    ChoresView()
        .environment(HouseholdStore())
}
