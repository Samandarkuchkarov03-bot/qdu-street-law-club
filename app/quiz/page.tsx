import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import QuizRunner from "@/components/QuizRunner";
import { getQuizzes } from "@/lib/repository";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const metadata: Metadata = {
  title: "Huquqiy testlar",
  description: "QDU Street Law Clubning interaktiv huquqiy testlari. Natija test yakunida hisoblanadi.",
  openGraph: { title: "Huquqiy testlar", description: "Bilimingizni sinab ko'ring." },
};

export default async function Quiz() {
  const quizzes = await getQuizzes();
  return (
    <>
      <PageHeader eyebrow="Interaktiv" title="Huquqiy testlar" text="Savollarga javob bering. To'g'ri javoblar test tugagach ko'rsatiladi." />
      <div className="container-x py-12"><QuizRunner quizzes={quizzes} /></div>
    </>
  );
}
