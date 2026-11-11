import Link from "next/link";
import { Mail, MapPin, Send } from "lucide-react";
import { nav, site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-navy-900 min-[431px]:mt-24">
      <div className="container-x grid gap-10 py-10 min-[431px]:py-14 md:grid-cols-3">
        <div className="min-w-0">
          <p className="font-serif text-xl text-white">{site.name}</p>
          <p className="mt-3 max-w-xs text-sm">{site.university} talabalarining huquqiy ta'lim klubi. {site.tagline}</p>
        </div>
        <nav aria-label="Pastki menyu">
          <p className="eyebrow mb-3">Sahifalar</p>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
            {nav.map((l) => (<li key={l.href}><Link href={l.href} className="inline-flex min-h-11 items-center hover:text-gold-300 min-[431px]:min-h-0">{l.label}</Link></li>))}
          </ul>
        </nav>
        <address className="space-y-3 text-sm not-italic">
          <p className="eyebrow mb-3">Aloqa</p>
          <p className="flex items-center gap-2"><Mail size={16} aria-hidden className="shrink-0 text-gold-400" /><span className="min-w-0 break-words">{site.email}</span></p>
          <p className="flex items-center gap-2"><Send size={16} aria-hidden className="shrink-0 text-gold-400" /><span className="min-w-0 break-words">{site.telegram}</span></p>
          <p className="flex items-center gap-2"><MapPin size={16} aria-hidden className="shrink-0 text-gold-400" /><span className="min-w-0 break-words">{site.address}</span></p>
        </address>
      </div>
      <p className="border-t border-white/10 px-5 py-5 text-center text-xs text-slate-500 sm:px-8">© {new Date().getFullYear()} {site.name}. Saytdagi materiallar ta'limiy xarakterga ega va yuridik maslahat emas.</p>
    </footer>
  );
}
