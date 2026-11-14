import Link from "next/link";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { nav, site } from "@/data/site";
import { getPublicContact } from "@/lib/repository";

function telegramHref(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://t.me/${value.replace(/^@/, "")}`;
}

export default async function Footer() {
  const contact = await getPublicContact();
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
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-11 items-center hover:text-gold-300 min-[431px]:min-h-0">{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <address className="space-y-3 text-sm not-italic">
          <p className="eyebrow mb-3">Aloqa</p>
          {contact.email ? (
            <p className="flex items-center gap-2">
              <Mail size={16} aria-hidden className="shrink-0 text-gold-400" />
              <a className="min-w-0 break-words hover:text-gold-300" href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
          ) : null}
          {contact.phone ? (
            <p className="flex items-center gap-2">
              <Phone size={16} aria-hidden className="shrink-0 text-gold-400" />
              <a className="min-w-0 break-words hover:text-gold-300" href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>
            </p>
          ) : null}
          {contact.telegram ? (
            <p className="flex items-center gap-2">
              <Send size={16} aria-hidden className="shrink-0 text-gold-400" />
              <a className="min-w-0 break-words hover:text-gold-300" href={telegramHref(contact.telegram)} target="_blank" rel="noopener noreferrer">{contact.telegram}</a>
            </p>
          ) : null}
          {contact.address ? (
            <p className="flex items-center gap-2">
              <MapPin size={16} aria-hidden className="shrink-0 text-gold-400" />
              <span className="min-w-0 break-words">{contact.address}</span>
            </p>
          ) : null}
        </address>
      </div>
      <p className="border-t border-white/10 px-5 py-5 text-center text-xs text-slate-500 sm:px-8">© {new Date().getFullYear()} {site.name}. Saytdagi materiallar ta'limiy xarakterga ega va yuridik maslahat emas.</p>
    </footer>
  );
}
