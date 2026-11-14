import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import ArticleList from "@/components/ArticleList";
import { getArticles } from "@/lib/repository";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const metadata: Metadata = {
  title: "Maqolalar",
  description: "QDU Street Law Clubning nashr qilingan huquqiy maqolalari. Ta'limiy material, yuridik maslahat emas.",
  openGraph: { title: "Maqolalar", description: "Nashr qilingan huquqiy maqolalar." },
};

export default async function Articles() {
  const articles = await getArticles();
  return (
    <>
      <PageHeader eyebrow="Huquqiy ta'lim" title="Maqolalar" text="Qisqa va tushunarli huquqiy materiallar. Ta'limiy maqsadda; yuridik maslahat emas." />
      <div className="container-x max-w-3xl py-12">
        <ArticleList articles={articles} />
      </div>
    </>
  );
}
