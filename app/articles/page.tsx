import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { getArticles } from "@/lib/repository";

export const metadata: Metadata = { title: "Maqolalar" };

export default async function Articles() {
  const articles = await getArticles();
  return (
    <>
      <PageHeader eyebrow="Huquqiy ta'lim" title="Maqolalar" text="Qisqa va tushunarli huquqiy materiallar. Ta'limiy maqsadda; yuridik maslahat emas." />
      <div className="container-x max-w-3xl space-y-5 py-12">
        {articles.map((a) => (
          <article key={a.id} className="card p-6">
            <div className="flex flex-wrap items-center gap-3 text-xs"><span className="rounded-full bg-gold-500/15 px-3 py-1 font-semibold text-gold-300">{a.category}</span><span className="flex items-center gap-1 text-slate-500"><Clock size={14} aria-hidden />{a.readMinutes} daqiqa</span></div>
            <h2 className="mt-3 text-2xl">{a.title}</h2>
            <p className="mt-2 text-slate-400">{a.excerpt}</p>
            <details className="group mt-4">
              <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-gold-400 hover:text-gold-300">To'liq o'qish</summary>
              <div className="mt-4 space-y-3 border-l-2 border-gold-500/40 pl-4">{a.body.map((p) => <p key={p}>{p}</p>)}</div>
            </details>
          </article>
        ))}
      </div>
    </>
  );
}
