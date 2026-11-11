"use client";
import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitApplication } from "@/lib/repository";

const Field = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
  <div><label htmlFor={id} className="mb-1.5 block text-sm font-medium text-white">{label}</label>{children}</div>
);

export default function ApplicationForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStatus("sending");
    await submitApplication({ fullName: String(f.get("fullName")), faculty: String(f.get("faculty")), course: Number(f.get("course")), contact: String(f.get("contact")), email: String(f.get("email")), motivation: String(f.get("motivation")) });
    setStatus("done");
  }
  if (status === "done") return (
    <div role="status" className="card p-10 text-center">
      <CheckCircle2 className="mx-auto text-gold-400" size={40} aria-hidden />
      <h2 className="mt-4 text-2xl">Arizangiz qabul qilindi</h2>
      <p className="mt-2 text-sm text-slate-400">Demo rejim: ma'lumotlar hozircha saqlanmaydi (Supabase ulanishi kutilmoqda).</p>
    </div>
  );
  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8">
      <Field id="fullName" label="To'liq ism"><input id="fullName" name="fullName" required autoComplete="name" className="input" /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="faculty" label="Fakultet"><input id="faculty" name="faculty" required className="input" /></Field>
        <Field id="course" label="Kurs"><select id="course" name="course" required className="input">{[1, 2, 3, 4, 5].map((c) => <option key={c} value={c}>{c}-kurs</option>)}</select></Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="email" label="Email"><input id="email" name="email" type="email" required autoComplete="email" className="input" /></Field>
        <Field id="contact" label="Telefon yoki Telegram"><input id="contact" name="contact" required className="input" /></Field>
      </div>
      <Field id="motivation" label="Nega klubga qo'shilmoqchisiz?"><textarea id="motivation" name="motivation" required minLength={20} rows={5} className="input" /></Field>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" required className="mt-1 accent-[#d4af37]" />Ma'lumotlarim ariza ko'rib chiqilishi uchun ishlatilishiga roziman.</label>
      <button disabled={status === "sending"} className="btn-gold w-full disabled:opacity-60">{status === "sending" ? "Yuborilmoqda..." : "Ariza yuborish"}</button>
    </form>
  );
}
