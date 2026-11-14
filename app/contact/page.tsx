import type { Metadata } from "next";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import { getPublicContact } from "@/lib/repository";

export const metadata: Metadata = {
  title: "Aloqa",
  description: "QDU Street Law Club bilan bog'lanish.",
  openGraph: { title: "Aloqa", description: "Savol, taklif yoki hamkorlik bo'yicha yozing." },
};

function telegramHref(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://t.me/${value.replace(/^@/, "")}`;
}

export default async function Contact() {
  const contact = await getPublicContact();
  const items: { label: string; value: string; href?: string; external?: boolean; icon: typeof Mail }[] = [];
  if (contact.email) items.push({ icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` });
  if (contact.phone) items.push({ icon: Phone, label: "Telefon", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` });
  if (contact.telegram) items.push({ icon: Send, label: "Telegram", value: contact.telegram, href: telegramHref(contact.telegram), external: true });
  if (contact.address) items.push({ icon: MapPin, label: "Manzil", value: contact.address });

  return (
    <>
      <PageHeader eyebrow="Aloqa" title="Biz bilan bog'laning" text="Savol, taklif yoki hamkorlik bo'yicha yozing." />
      <div className="container-x grid gap-10 py-12 lg:grid-cols-2">
        <div className="space-y-4">
          {items.length === 0 ? <p className="card p-6 text-sm text-slate-400">Aloqa ma'lumotlari hali kiritilmagan.</p> : null}
          {items.map((item) => (
            <div key={item.label} className="card flex items-center gap-4 p-5">
              <item.icon className="shrink-0 text-gold-400" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-slate-500">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="break-words text-white hover:text-gold-300" {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{item.value}</a>
                ) : (
                  <p className="break-words text-white">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <ContactForm email={contact.email} />
      </div>
    </>
  );
}
