import type { Metadata } from "next";
import { Mail, MapPin, Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Aloqa",
  description: "QDU Street Law Club bilan bog'lanish: email, Telegram va manzil.",
  openGraph: { title: "Aloqa", description: "Savol, taklif yoki hamkorlik bo'yicha yozing." },
};

export default function Contact() {
  const items = [
    { icon: Mail, label: "Email", value: site.email },
    { icon: Send, label: "Telegram", value: site.telegram },
    { icon: MapPin, label: "Manzil", value: site.address },
  ];
  return (
    <>
      <PageHeader eyebrow="Aloqa" title="Biz bilan bog'laning" text="Savol, taklif yoki hamkorlik bo'yicha yozing." />
      <div className="container-x grid gap-10 py-12 lg:grid-cols-2">
        <div className="space-y-4">
          {items.map((it) => (
            <div key={it.label} className="card flex items-center gap-4 p-5">
              <it.icon className="shrink-0 text-gold-400" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-slate-500">{it.label}</p>
                <p className="break-words text-white">{it.value}</p>
              </div>
            </div>
          ))}
        </div>
        <ContactForm />
      </div>
    </>
  );
}
