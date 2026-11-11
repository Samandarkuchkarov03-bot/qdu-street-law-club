"use client";
import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { Quiz } from "@/types";

export default function QuizRunner({ quizzes }: { quizzes: Quiz[] }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const reset = () => { setQuiz(null); setI(0); setPick(null); setScore(0); };

  if (!quiz) return (
    <ul className="grid gap-5 md:grid-cols-2">
      {quizzes.map((z) => (
        <li key={z.id}><button onClick={() => setQuiz(z)} className="card min-h-11 w-full p-5 text-left min-[431px]:p-6">
          <h3 className="text-xl">{z.title}</h3><p className="mt-2 text-sm text-slate-400">{z.description}</p>
          <p className="mt-4 text-sm font-semibold text-gold-400">{z.questions.length} ta savol · Boshlash →</p>
        </button></li>
      ))}
    </ul>
  );

  const done = i >= quiz.questions.length;
  if (done) return (
    <div className="card mx-auto max-w-xl p-6 text-center min-[431px]:p-10">
      <p className="eyebrow">Natija</p>
      <p className="mt-3 font-serif text-6xl text-gold-400">{score}/{quiz.questions.length}</p>
      <button onClick={reset} className="btn-gold mt-8"><RotateCcw size={16} aria-hidden />Boshqa test</button>
    </div>
  );

  const cur = quiz.questions[i];
  return (
    <div className="card mx-auto max-w-2xl p-6 sm:p-8">
      <p className="text-sm text-slate-500">{quiz.title} · {i + 1}/{quiz.questions.length}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded bg-white/10"><div className="h-full bg-gold-500 transition-all duration-500" style={{ width: `${(i / quiz.questions.length) * 100}%` }} /></div>
      <h2 className="mt-6 text-xl min-[431px]:text-2xl">{cur.q}</h2>
      <ul className="mt-6 space-y-3">
        {cur.options.map((o, k) => {
          const state = pick === null ? "border-white/15 hover:border-gold-400" : k === cur.answer ? "border-emerald-400 bg-emerald-400/10" : k === pick ? "border-red-400 bg-red-400/10" : "border-white/10 opacity-60";
          return (<li key={o}><button disabled={pick !== null} onClick={() => { setPick(k); if (k === cur.answer) setScore(score + 1); }}
            className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${state}`}>
            <span className="min-w-0">{o}</span>{pick !== null && k === cur.answer && <CheckCircle2 size={18} aria-label="To'g'ri" className="shrink-0 text-emerald-400" />}{pick === k && k !== cur.answer && <XCircle size={18} aria-label="Noto'g'ri" className="shrink-0 text-red-400" />}
          </button></li>);
        })}
      </ul>
      {pick !== null && (
        <div aria-live="polite" className="mt-6">
          <p className="text-sm text-slate-400">{cur.explain}</p>
          <button onClick={() => { setI(i + 1); setPick(null); }} className="btn-gold mt-5">{i + 1 === quiz.questions.length ? "Natijani ko'rish" : "Keyingi savol"}</button>
        </div>
      )}
    </div>
  );
}
