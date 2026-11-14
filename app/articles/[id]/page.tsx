import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import SmartImage from "@/components/SmartImage";
import { getArticle } from "@/lib/repository";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type Params = { params: { id: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const article = await getArticle(params.id);
  if (!article) return { title: "Maqola topilmadi" };
  return {
    title: article.title,
    description: article.excerpt || article.title,
    openGraph: { title: article.title, description: article.excerpt || article.title },
  };
}

export default async function ArticlePage({ params }: Params) {
  const article = await getArticle(params.id);
  if (!article) notFound();
  const paragraphs = article.content.split(/\n+/).map((part) => part.trim()).filter(Boolean);

  return (
    <article className="container-x max-w-3xl py-12">
      <Link href="/articles" className="text-sm font-semibold text-gold-400 hover:text-gold-300">Barcha maqolalar</Link>
      <h1 className="mt-4 text-3xl sm:text-5xl">{article.title}</h1>
      <p className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
        {article.createdLabel ? <span>{article.createdLabel}</span> : null}
        <span className="inline-flex items-center gap-1"><Clock size={14} aria-hidden />{article.readMinutes} daqiqa</span>
      </p>
      {article.imageUrl ? (
        <div className="relative mt-8 h-64 overflow-hidden rounded-2xl bg-navy-900 sm:h-80">
          {article.video ? <video src={article.imageUrl} controls className="h-full w-full object-cover" /> : <SmartImage src={article.imageUrl} alt={article.title} className="object-cover" />}
        </div>
      ) : null}
      <div className="mt-8 space-y-4 text-base leading-7 text-slate-300">
        {paragraphs.length ? paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>) : <p>{article.excerpt}</p>}
      </div>
    </article>
  );
}
