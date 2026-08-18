import Link from "next/link";
import type { Locale } from "@/lib/types";
import { t } from "@/lib/i18n";

export function BottomNav({
  active,
  locale,
}: {
  active: "today" | "needs" | "household";
  locale: Locale;
}) {
  const d = t(locale);
  const item = (href: string, key: typeof active, label: string) => (
    <Link
      href={href}
      className={`px-2 py-2 text-[0.8rem] ${
        active === key ? "font-extrabold text-accent" : "font-semibold text-muted"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky bottom-0 mt-auto grid grid-cols-3 border-t border-line bg-[#fffcf6]/px-2 pb-3 pt-2 text-center">
      {item("/today", "today", d.today)}
      {item("/needs", "needs", d.needs)}
      {item("/household", "household", d.household)}
    </nav>
  );
}
