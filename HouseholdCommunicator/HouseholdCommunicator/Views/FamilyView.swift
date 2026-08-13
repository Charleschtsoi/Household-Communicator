import SwiftUI

struct FamilyView: View {
    @Environment(HouseholdStore.self) private var store
    @State private var showingAdd = false

    private let accentPalette = ["#2F6F4E", "#C46B2B", "#3B6EA5", "#8B4D6B", "#5C6B3A"]

    var body: some View {
        NavigationStack {
            List {
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Household Communicator")
                            .font(.title2.weight(.semibold))
                        Text("Share chores, schedules, and shopping with the same family.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                    .listRowBackground(
                        LinearGradient(
                            colors: [Color(hex: "#E8F0EA"), Color(hex: "#F7F3EC")],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                }

                Section("Acting as") {
                    if store.members.isEmpty {
                        Text("Add a family member to get started.")
                            .foregroundStyle(.secondary)
                    } else {
                        Picker("Current person", selection: Binding(
                            get: { store.currentMemberID ?? store.members[0].id },
                            set: { store.setCurrentMember($0) }
                        )) {
                            ForEach(store.members) { member in
                                Text(member.name).tag(member.id)
                            }
                        }
                        .pickerStyle(.inline)
                        .labelsHidden()
                    }
                }

                Section("Members") {
                    ForEach(store.members) { member in
                        HStack(spacing: 12) {
                            Circle()
                                .fill(Color(hex: member.colorHex))
                                .frame(width: 12, height: 12)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(member.name)
                                    .font(.body.weight(.medium))
                                Text(member.role)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            if member.id == store.currentMemberID {
                                Text("You")
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(Color(hex: member.colorHex))
                            }
                        }
                    }
                }

                Section("Data") {
                    Button("Reset sample household") {
                        store.resetToSampleData()
                    }
                    Text("MVP data stays on this device via UserDefaults.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Family")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingAdd = true
                    } label: {
                        Image(systemName: "person.badge.plus")
                    }
                    .accessibilityLabel("Add family member")
                }
            }
            .sheet(isPresented: $showingAdd) {
                AddMemberSheet(palette: accentPalette)
            }
        }
    }
}

private struct AddMemberSheet: View {
    @Environment(HouseholdStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    let palette: [String]

    @State private var name = ""
    @State private var role = "Family"
    @State private var colorHex = "#2F6F4E"

    var body: some View {
        NavigationStack {
            Form {
                Section("Person") {
                    TextField("Name", text: $name)
                    TextField("Role (Parent, Kid, Roommate…)", text: $role)
                }

                Section("Color") {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 5), spacing: 12) {
                        ForEach(palette, id: \.self) { hex in
                            Circle()
                                .fill(Color(hex: hex))
                                .frame(width: 36, height: 36)
                                .overlay {
                                    if colorHex == hex {
                                        Image(systemName: "checkmark")
                                            .font(.caption.weight(.bold))
                                            .foregroundStyle(.white)
                                    }
                                }
                                .onTapGesture { colorHex = hex }
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
            .navigationTitle("Add member")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        store.addMember(
                            name: name.trimmingCharacters(in: .whitespacesAndNewlines),
                            role: role.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                                ? "Family"
                                : role.trimmingCharacters(in: .whitespacesAndNewlines),
                            colorHex: colorHex
                        )
                        dismiss()
                    }
                    .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .onAppear {
                colorHex = palette[store.members.count % palette.count]
            }
        }
    }
}

#Preview {
    FamilyView()
        .environment(HouseholdStore())
}
