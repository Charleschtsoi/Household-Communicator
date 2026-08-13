import SwiftUI

struct ScheduleView: View {
    @Environment(HouseholdStore.self) private var store
    @State private var showingAdd = false

    var body: some View {
        NavigationStack {
            List {
                if store.upcomingEvents.isEmpty {
                    ContentUnavailableView(
                        "Nothing scheduled",
                        systemImage: "calendar",
                        description: Text("Add shared family events so everyone stays aligned.")
                    )
                } else {
                    ForEach(store.upcomingEvents) { event in
                        ScheduleEventRow(event: event)
                    }
                    .onDelete(perform: store.deleteEvents)
                }
            }
            .navigationTitle("Schedule")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingAdd = true
                    } label: {
                        Image(systemName: "plus")
                    }
                    .accessibilityLabel("Add event")
                }
            }
            .sheet(isPresented: $showingAdd) {
                AddEventSheet()
            }
        }
    }
}

private struct ScheduleEventRow: View {
    @Environment(HouseholdStore.self) private var store
    let event: ScheduleEvent

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(event.title)
                .font(.headline)

            Text(event.start.formatted(date: .abbreviated, time: .shortened)
                + " – "
                + event.end.formatted(date: .omitted, time: .shortened))
                .font(.subheadline)
                .foregroundStyle(.secondary)

            if !event.location.isEmpty {
                Label(event.location, systemImage: "mappin.and.ellipse")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            if !event.detail.isEmpty {
                Text(event.detail)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            if !event.participantIDs.isEmpty {
                Text(participantNames)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(Color(hex: "#2F6F4E"))
            }
        }
        .padding(.vertical, 4)
    }

    private var participantNames: String {
        event.participantIDs
            .compactMap { store.member(for: $0)?.name }
            .joined(separator: ", ")
    }
}

private struct AddEventSheet: View {
    @Environment(HouseholdStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var detail = ""
    @State private var location = ""
    @State private var start = Date()
    @State private var end = Date().addingTimeInterval(3600)
    @State private var selectedParticipants: Set<UUID> = []

    var body: some View {
        NavigationStack {
            Form {
                Section("Event") {
                    TextField("Title", text: $title)
                    TextField("Details", text: $detail, axis: .vertical)
                        .lineLimit(2...4)
                    TextField("Location", text: $location)
                }

                Section("When") {
                    DatePicker("Starts", selection: $start)
                    DatePicker("Ends", selection: $end)
                }

                Section("Who") {
                    ForEach(store.members) { member in
                        Toggle(isOn: Binding(
                            get: { selectedParticipants.contains(member.id) },
                            set: { isOn in
                                if isOn {
                                    selectedParticipants.insert(member.id)
                                } else {
                                    selectedParticipants.remove(member.id)
                                }
                            }
                        )) {
                            Text(member.name)
                        }
                    }
                }
            }
            .navigationTitle("New event")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        let safeEnd = end < start ? start.addingTimeInterval(3600) : end
                        store.addEvent(
                            title: title.trimmingCharacters(in: .whitespacesAndNewlines),
                            detail: detail.trimmingCharacters(in: .whitespacesAndNewlines),
                            start: start,
                            end: safeEnd,
                            participantIDs: Array(selectedParticipants),
                            location: location.trimmingCharacters(in: .whitespacesAndNewlines)
                        )
                        dismiss()
                    }
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .onAppear {
                if let current = store.currentMember?.id {
                    selectedParticipants = [current]
                }
            }
        }
    }
}

#Preview {
    ScheduleView()
        .environment(HouseholdStore())
}
