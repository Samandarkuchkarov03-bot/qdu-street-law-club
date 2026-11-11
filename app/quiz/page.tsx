import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import QuizRunner from "@/components/QuizRunner";
import { getQuizzes } from "@/lib/repository";

export const metadata: Metadata = { title: "Huquqiy testlar" };

export default async function Quiz() {
  const quizzes = await getQuizzes();
  return (
    <>
      <PageHeader eyebrow="Interaktiv" title="Huquqiy testlar" text="Bilimingizni sinab ko'ring va har bir javob izohini o'qing." />
      <div className="container-x py-12"><QuizRunner quizzes={quizzes} /></div>
    </>
  );
}
