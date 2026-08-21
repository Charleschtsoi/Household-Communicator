import type { Category, Locale, PresenceStatus, RecurringCadence } from "./types";

/**
 * Bilingual glossary (EN ↔ 繁體中文).
 * Brand name stays English in both locales.
 * Shopping board = what we still need; Record = bought log + optional prices.
 */
const en = {
  brand: "Household Communicator",
  tagline:
    "Know what the house needs, who’s buying it, and—only if you want—where you’ve stepped out to.",
  metaDescription:
    "Shared household shopping needs, optional presence, and light spend totals.",

  // Onboarding
  getStarted: "Get started",
  createHousehold: "Create household",
  householdName: "Household name",
  householdNamePlaceholder: "e.g. Flat 12B",
  yourName: "Your name",
  create: "Create",
  back: "Back",
  inviteHousehold: "Invite your household",
  inviteHint: "Share the code, then add the first thing you need.",
  inviteCode: "Invite code",
  copyLink: "Copy invite link",
  copied: "Copied",
  addWhatWeNeed: "Add what we need",
  skipForNow: "Skip for now",
  joinHousehold: "Join household",
  join: "Join",
  inviteAgain: "Invite again",
  householdFull: "This household is full (max 10 people).",
  inviteNotFound: "Invite code not found.",
  joinFailed: "Could not join. Check the code and try again.",

  // Nav
  today: "Today",
  needs: "List",
  record: "Record",
  household: "Household",

  // Shopping list
  openNeeds: "What we need",
  needsHint: "Items the household still needs. Claim one before you buy it.",
  nothingYet: "Nothing on the list yet",
  nothingHint:
    "Add what the house needs so everyone can claim it—before someone buys milk twice.",
  addNeed: "Add item",
  firstNeed: "First item",
  item: "Item",
  quantity: "Quantity",
  qty: "Qty",
  category: "Category",
  urgent: "Urgent (notifies everyone)",
  urgentChip: "Urgent",
  urgentSection: "Urgent",
  recurring: "Recurring staple",
  cadence: "How often",
  addToList: "Add to list",
  claim: "Claim",
  reassign: "Reassign",
  clearClaim: "Clear claim",
  bought: "Bought",
  claimed: "Claimed",
  open: "Still needed",
  unclaimed: "Unclaimed",
  filtersOpen: "Still needed",
  filtersClaimed: "Claimed",
  filtersRecurring: "Recurring",

  // Mark bought → Record
  markBought: "Mark as bought",
  boughtHint:
    "This leaves the shopping list and moves to Record. Amount is optional.",
  whoBought: "Who bought",
  amountOptional: "Amount (optional)",
  currency: "Currency",
  currencyCode: "HKD",
  saveArchive: "Save to Record",
  cancel: "Cancel",
  amountPlaceholder: "28.50",
  amountNone: "No amount",

  // Record
  recordHint: "Bought items leave the list and show up here with optional prices.",
  completed: "Completed",
  noRecordsYet: "No purchases logged yet",
  noRecordsHint: "When someone marks an item as bought, it moves here from the list.",
  thisMonth: "This month",
  householdTotal: "Household total",
  optionalAmounts: "Optional amounts only · no IOUs",
  viewRecord: "View Record",

  // Presence
  updateMine: "Update my status",
  presenceSection: "Who’s out",
  sharePresence: "Share where you are",
  presenceHint: "Only what you choose. No GPS. No live map. Back-by is optional.",
  status: "Status",
  place: "Place",
  placePlaceholder: "Market / office / gym",
  backBy: "Back by",
  save: "Save",
  imHome: "I’m home — clear",
  presencePrivacy: "Presence",
  presencePrivacyHint: "Share only when you choose · no GPS",
  home: "Home",
  out: "Out",
  homeSoon: "Home soon",

  // Household / settings
  members: "Members",
  settings: "Settings",
  language: "Language",
  langEnglish: "English",
  langZhHant: "繁體中文",
  owner: "Owner",
  member: "Member",
  signOut: "Sign out",

  // Categories & cadence
  groceries: "Groceries",
  householdCat: "Household",
  personal: "Personal",
  other: "Other",
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",

  // Session recovery
  sessionResetTitle: "Start fresh",
  sessionResetBody:
    "Your login session is still here, but this device can’t load the household right now. Start over to create or join again.",
  startOver: "Start over",
  clearCookiesViaReset: "Or clear local session cookies",
};

type Dict = typeof en;

const zh: Dict = {
  brand: "Household Communicator",
  tagline: "知道家裡需要買什麼、誰去買——以及（如果你願意分享）你外出到哪裡。",
  metaDescription: "家庭共用購物清單、可選外出狀態，以及輕量花費統計。",

  getStarted: "開始使用",
  createHousehold: "建立家庭",
  householdName: "家庭名稱",
  householdNamePlaceholder: "例如：12B 單位",
  yourName: "你的名字",
  create: "建立",
  back: "返回",
  inviteHousehold: "邀請家人",
  inviteHint: "先分享邀請碼，再新增第一個需要購買的項目。",
  inviteCode: "邀請碼",
  copyLink: "複製邀請連結",
  copied: "已複製",
  addWhatWeNeed: "新增家裡需要",
  skipForNow: "暫時略過",
  joinHousehold: "加入家庭",
  join: "加入",
  inviteAgain: "再次邀請",
  householdFull: "這個家庭已滿（最多 10 人）。",
  inviteNotFound: "找不到邀請碼。",
  joinFailed: "無法加入，請確認邀請碼後再試。",

  today: "今日",
  needs: "清單",
  record: "紀錄",
  household: "家庭",

  openNeeds: "家裡需要",
  needsHint: "家裡仍需要購買的項目。購買前可先認領。",
  nothingYet: "清單還沒有項目",
  nothingHint: "先新增家裡需要買的東西，大家就能認領——避免牛奶買兩次。",
  addNeed: "新增項目",
  firstNeed: "第一個項目",
  item: "項目",
  quantity: "數量",
  qty: "數量",
  category: "分類",
  urgent: "緊急（通知所有人）",
  urgentChip: "緊急",
  urgentSection: "緊急",
  recurring: "定期必需品",
  cadence: "重複週期",
  addToList: "加入清單",
  claim: "認領",
  reassign: "改派",
  clearClaim: "取消認領",
  bought: "已買",
  claimed: "已認領",
  open: "仍需要",
  unclaimed: "未認領",
  filtersOpen: "仍需要",
  filtersClaimed: "已認領",
  filtersRecurring: "定期",

  markBought: "標記為已買",
  boughtHint: "會從購物清單移除，並移到「紀錄」。金額可選。",
  whoBought: "購買人",
  amountOptional: "金額（可選）",
  currency: "貨幣",
  currencyCode: "HKD",
  saveArchive: "存到紀錄",
  cancel: "取消",
  amountPlaceholder: "28.50",
  amountNone: "未填金額",

  recordHint: "已購買的項目會離開清單，並顯示在這裡（可附金額）。",
  completed: "已完成",
  noRecordsYet: "還沒有購買紀錄",
  noRecordsHint: "有人標記為已買後，項目會從清單移到這裡。",
  thisMonth: "本月",
  householdTotal: "家庭合計",
  optionalAmounts: "僅統計有填金額的項目 · 不做分帳",
  viewRecord: "查看紀錄",

  updateMine: "更新我的狀態",
  presenceSection: "誰外出了",
  sharePresence: "分享你的所在",
  presenceHint: "只分享你願意公開的內容。無 GPS、無即時地圖，預計回家時間可選。",
  status: "狀態",
  place: "地點",
  placePlaceholder: "超市 / 辦公室 / 健身房",
  backBy: "預計回來",
  save: "儲存",
  imHome: "我回家了 — 清除",
  presencePrivacy: "外出狀態",
  presencePrivacyHint: "你選擇分享才會顯示 · 無 GPS",
  home: "在家",
  out: "外出",
  homeSoon: "快回家",

  members: "成員",
  settings: "設定",
  language: "語言",
  langEnglish: "English",
  langZhHant: "繁體中文",
  owner: "擁有者",
  member: "成員",
  signOut: "登出",

  groceries: "食品雜貨",
  householdCat: "家居",
  personal: "個人",
  other: "其他",
  weekly: "每週",
  biweekly: "每兩週",
  monthly: "每月",

  sessionResetTitle: "重新開始",
  sessionResetBody:
    "登入狀態仍在，但這個裝置目前載入不到家庭資料。請重新開始以建立或加入家庭。",
  startOver: "重新開始",
  clearCookiesViaReset: "或清除本機工作階段 Cookie",
};

export function t(locale: Locale): Dict {
  return locale === "zh-Hant" ? zh : en;
}

export function parseLocale(value: string | undefined | null): Locale {
  return value === "zh-Hant" ? "zh-Hant" : "en";
}

export function htmlLang(locale: Locale): string {
  return locale === "zh-Hant" ? "zh-Hant" : "en";
}

export function categoryLabel(locale: Locale, category: Category) {
  const d = t(locale);
  const map: Record<Category, string> = {
    groceries: d.groceries,
    household: d.householdCat,
    personal: d.personal,
    other: d.other,
  };
  return map[category];
}

export function cadenceLabel(locale: Locale, cadence: RecurringCadence) {
  const d = t(locale);
  return cadence === "weekly" ? d.weekly : cadence === "biweekly" ? d.biweekly : d.monthly;
}

export function presenceLabel(locale: Locale, status: PresenceStatus) {
  const d = t(locale);
  return status === "home" ? d.home : status === "out" ? d.out : d.homeSoon;
}
