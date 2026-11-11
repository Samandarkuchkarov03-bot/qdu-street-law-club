"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Scale, X } from "lucide-react";
import { nav, site } from "@/data/site";

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const cls = (href: string) =>
    `rounded-full px-3 py-2 text-sm transition ${path === href ? "text-gold-400" : "text-slate-300 hover:text-white"} ${href === "/join" ? "!bg-gold-500 !text-navy-950 font-semibold hover:!bg-gold-400" : ""}`;

  useEffect(() => { setOpen(false); }, [path]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/80 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between gap-3">
        <Link href="/" onClick={() => setOpen(false)} className="flex min-w-0 items-center gap-2 font-serif text-base font-semibold text-white min-[431px]:gap-2.5 min-[431px]:text-lg">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold-500 text-navy-950"><Scale size={20} aria-hidden /></span>
          <span className="truncate">{site.name}</span>
        </Link>
        <nav aria-label="Asosiy menyu" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {nav.map((l) => (<li key={l.href}><Link href={l.href} className={cls(l.href)} aria-current={path === l.href ? "page" : undefined}>{l.label}</Link></li>))}
          </ul>
        </nav>
        <button className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-white xl:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Menyuni yopish" : "Menyuni ochish"} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobil menyu" className="max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-white/10 bg-navy-950 xl:hidden">
          <ul className="container-x flex flex-col gap-1 py-3">
            {nav.map((l) => (<li key={l.href}><Link href={l.href} onClick={() => setOpen(false)} className={`flex min-h-11 items-center ${cls(l.href)}`}>{l.label}</Link></li>))}
          </ul>
        </nav>
      )}
    </header>
  );
}
