import Link from "next/link";
import type { Locale } from "@/lib/types";
import { t } from "@/lib/i18n";

export function BottomNav({
  active,
  locale,
}: {
  active: "today" | "needs" | "record" | "household";
  locale: Locale;
}) {
  const d = t(locale);
  const item = (href: string, key: typeof active, label: string) => (
    <Link
      href={href}
      className={`px-1 py-2 text-[0.72rem] sm:text-[0.8rem] ${
        active === key ? "font-extrabold text-accent" : "font-semibold text-muted"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky bottom-0 mt-auto grid grid-cols-4 border-t border-line bg-[#fffcf6]/px-1 pb-3 pt-2 text-center">
      {item("/today", "today", d.today)}
      {item("/needs", "needs", d.needs)}
      {item("/record", "record", d.record)}
      {item("/household", "household", d.household)}
    </nav>
  );
}
