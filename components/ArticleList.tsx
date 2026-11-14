"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Search } from "lucide-react";
import type { Article } from "@/types";
import SmartImage from "@/components/SmartImage";

export default function ArticleList({ articles }: { articles: Article[] }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return articles;
    return articles.filter((article) => `${article.title} ${article.excerpt} ${article.content}`.toLowerCase().includes(query));
  }, [articles, q]);

  if (articles.length === 0) {
    return <p className="card p-10 text-center text-slate-400">Hali nashr qilingan maqola yo'q.</p>;
  }

  return (
    <div>
      <form role="search" onSubmit={(event) => event.preventDefault()} className="relative mb-8">
        <label htmlFor="article-search" className="sr-only">Maqola qidirish</label>
        <Search size={18} aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input id="article-search" type="search" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Sarlavha yoki matn bo'yicha qidirish" className="input pl-11" />
      </form>
      <p aria-live="polite" className="mb-4 text-sm text-slate-500">{list.length} ta maqola</p>
      {list.length === 0 ? <p className="card p-10 text-center">Hech narsa topilmadi.</p> : null}
      <div className="space-y-5">
        {list.map((article) => (
          <article key={article.id} className="card overflow-hidden">
            {article.imageUrl ? (
              <div className="relative h-48 w-full bg-navy-900">
                {article.video ? <video src={article.imageUrl} className="h-full w-full object-cover" muted playsInline /> : <SmartImage src={article.imageUrl} alt="" className="object-cover" />}
              </div>
            ) : null}
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {article.createdLabel ? <span>{article.createdLabel}</span> : null}
                <span className="flex items-center gap-1"><Clock size={14} aria-hidden />{article.readMinutes} daqiqa</span>
              </div>
              <h2 className="mt-3 text-2xl">{article.title}</h2>
              {article.excerpt ? <p className="mt-2 text-slate-400">{article.excerpt}</p> : null}
              <Link href={`/articles/${article.id}`} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-gold-400 hover:text-gold-300">To'liq o'qish</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
