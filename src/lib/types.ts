export type Locale = "en" | "zh-Hant";
export type Role = "owner" | "member";
export type Category = "groceries" | "household" | "personal" | "other";
export type NeedStatus = "open" | "claimed" | "bought";
export type PresenceStatus = "home" | "out" | "home_soon";
export type RecurringCadence = "weekly" | "biweekly" | "monthly";

export type Household = {
  id: string;
  name: string;
  inviteCode: string;
  currency: "HKD";
  createdAt: string;
};

export type Member = {
  id: string;
  householdId: string;
  displayName: string;
  role: Role;
  locale: Locale;
  createdAt: string;
};

export type Need = {
  id: string;
  householdId: string;
  name: string;
  quantity: number;
  category: Category;
  status: NeedStatus;
  claimedById: string | null;
  urgent: boolean;
  recurringCadence: RecurringCadence | null;
  notes: string | null;
  createdById: string;
  boughtAt: string | null;
  boughtById: string | null;
  amount: number | null;
  createdAt: string;
};

export type Presence = {
  memberId: string;
  householdId: string;
  status: PresenceStatus;
  placeText: string | null;
  backBy: string | null;
  updatedAt: string;
};

export type Db = {
  households: Household[];
  members: Member[];
  needs: Need[];
  presence: Presence[];
};

export const CATEGORIES: Category[] = [
  "groceries",
  "household",
  "personal",
  "other",
];

export const MAX_HOUSEHOLD_MEMBERS = 10;
