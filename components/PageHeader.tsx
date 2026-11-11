import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PageHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-navy-800 to-navy-950 py-16 sm:py-24">
      <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="container-x relative">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-3xl min-[431px]:text-4xl sm:text-5xl">{title}</h1>
        {text && <p className="mt-4 max-w-2xl text-base text-slate-400 min-[431px]:text-lg">{text}</p>}
      </div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, href, cta = "Barchasi" }: { eyebrow: string; title: string; href?: string; cta?: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-3 min-[431px]:mb-10 min-[431px]:gap-4">
      <div className="min-w-0"><p className="eyebrow">{eyebrow}</p><h2 className="mt-2 text-3xl sm:text-4xl">{title}</h2></div>
      {href && <Link href={href} className="group inline-flex min-h-11 items-center gap-1 text-sm font-medium text-gold-400 hover:text-gold-300 min-[431px]:min-h-0">{cta}<ArrowRight size={16} aria-hidden className="transition group-hover:translate-x-1" /></Link>}
    </div>
  );
}

export const Placeholder = ({ text = "Namunaviy ma'lumotlar: haqiqiy kontent bilan almashtiriladi." }: { text?: string }) => (
  <p role="note" className="mb-8 rounded-xl border border-gold-500/30 bg-gold-500/5 px-4 py-3 text-sm text-gold-300">{text}</p>
);
