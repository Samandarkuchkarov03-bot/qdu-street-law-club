"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { Quiz } from "@/types";
import { gradeQuiz } from "@/lib/grade-quiz";

export default function QuizRunner({ quizzes }: { quizzes: Quiz[] }) {
  const [category, setCategory] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [grading, setGrading] = useState(false);

  const categories = Array.from(new Set(quizzes.map((item) => item.category).filter(Boolean)));
  const visible = quizzes.filter((item) => !category || item.category === category);

  function openQuiz(next: Quiz) {
    setQuiz(next);
    setIndex(0);
    setPicks({});
    setScore(null);
    setResults({});
    setError("");
  }

  function reset() {
    setQuiz(null);
    setIndex(0);
    setPicks({});
    setScore(null);
    setResults({});
    setError("");
  }

  if (quizzes.length === 0) {
    return <p className="card p-10 text-center text-slate-400">Hali nashr qilingan test yo'q.</p>;
  }

  if (!quiz) {
    return (
      <div>
        {categories.length > 0 ? (
          <div className="mb-6 flex flex-wrap gap-2">
            <button type="button" onClick={() => setCategory("")} className={!category ? "btn-gold" : "btn-ghost"}>Barchasi</button>
            {categories.map((item) => (
              <button key={item} type="button" onClick={() => setCategory(item)} className={category === item ? "btn-gold" : "btn-ghost"}>{item}</button>
            ))}
          </div>
        ) : null}
        {visible.length === 0 ? <p className="card p-10 text-center">Bu kategoriyada test yo'q.</p> : null}
        <ul className="grid gap-5 md:grid-cols-2">
          {visible.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => openQuiz(item)} className="card min-h-11 w-full p-5 text-left min-[431px]:p-6">
                {item.category ? <p className="text-xs font-semibold uppercase tracking-wider text-gold-400">{item.category}</p> : null}
                <h3 className="mt-2 text-xl">{item.title}</h3>
                {item.description ? <p className="mt-2 text-sm text-slate-400">{item.description}</p> : null}
                <p className="mt-4 text-sm font-semibold text-gold-400">{item.questions.length} ta savol · Boshlash</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (quiz.questions.length === 0) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p>Bu testda hali savol yo'q.</p>
        <button type="button" onClick={reset} className="btn-gold mt-6">Testlar ro'yxati</button>
      </div>
    );
  }

  const finished = score !== null;
  if (finished) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="card p-6 text-center min-[431px]:p-10">
          <p className="eyebrow">Natija</p>
          <p className="mt-3 font-serif text-6xl text-gold-400">{score}/{quiz.questions.length}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => openQuiz(quiz)} className="btn-gold"><RotateCcw size={16} aria-hidden />Qayta ishlash</button>
            <button type="button" onClick={reset} className="btn-ghost">Boshqa test</button>
          </div>
        </div>
        {quiz.questions.map((question, number) => (
          <article key={question.id} className="card p-5">
            <h3 className="text-lg">{number + 1}. {question.q}</h3>
            <ul className="mt-4 space-y-2">
              {question.options.map((option) => {
                const picked = picks[question.id] === option.id;
                const verdict = results[question.id];
                const tone = picked && verdict === true ? "border-emerald-400 bg-emerald-400/10" : picked && verdict === false ? "border-red-400 bg-red-400/10" : "border-white/10";
                return (
                  <li key={option.id} className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${tone}`}>
                    <span>{option.text}</span>
                    {picked && verdict === true ? <CheckCircle2 size={18} aria-label="To'g'ri javob" className="shrink-0 text-emerald-400" /> : null}
                    {picked && verdict === false ? <XCircle size={18} aria-label="Noto'g'ri javob" className="shrink-0 text-red-400" /> : null}
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    );
  }

  const current = quiz.questions[index];
  const selected = picks[current.id] ?? "";

  async function finish(nextPicks: Record<string, string>) {
    setGrading(true);
    setError("");
    const result = await gradeQuiz(quiz!.id, quiz!.questions.map((question) => ({ questionId: question.id, optionId: nextPicks[question.id] })));
    setGrading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setScore(result.score);
    setResults(Object.fromEntries(result.results.map((item) => [item.questionId, item.correct])));
  }

  return (
    <div className="card mx-auto max-w-2xl p-6 sm:p-8">
      <p className="text-sm text-slate-500">{quiz.title} · {index + 1}/{quiz.questions.length}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded bg-white/10"><div className="h-full bg-gold-500 transition-all duration-500" style={{ width: `${(index / quiz.questions.length) * 100}%` }} /></div>
      <h2 className="mt-6 text-xl min-[431px]:text-2xl">{current.q}</h2>
      <ul className="mt-6 space-y-3">
        {current.options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              onClick={() => setPicks({ ...picks, [current.id]: option.id })}
              className={`flex min-h-11 w-full items-center rounded-xl border px-4 py-3 text-left transition ${selected === option.id ? "border-gold-400 bg-gold-500/10" : "border-white/15 hover:border-gold-400"}`}
            >
              {option.text}
            </button>
          </li>
        ))}
      </ul>
      {error ? <p role="alert" className="mt-4 text-sm text-red-300">{error}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        {index > 0 ? <button type="button" onClick={() => setIndex(index - 1)} className="btn-ghost">Oldingi</button> : null}
        {index + 1 < quiz.questions.length ? (
          <button type="button" disabled={!selected} onClick={() => setIndex(index + 1)} className="btn-gold disabled:cursor-not-allowed disabled:opacity-50">Keyingi savol</button>
        ) : (
          <button type="button" disabled={!selected || grading} onClick={() => void finish(picks)} className="btn-gold disabled:cursor-not-allowed disabled:opacity-50">{grading ? "Hisoblanmoqda..." : "Natijani ko'rish"}</button>
        )}
      </div>
    </div>
  );
}
