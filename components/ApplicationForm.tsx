"use client";
import { useRef, useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitApplication } from "@/lib/repository";

const Field = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
  <div><label htmlFor={id} className="mb-1.5 block text-sm font-medium text-white">{label}</label>{children}</div>
);

export default function ApplicationForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const pending = useRef(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending.current) return;
    const f = new FormData(e.currentTarget);
    pending.current = true;
    setError("");
    setStatus("sending");
    try {
      const result = await submitApplication({
        fullName: String(f.get("fullName") ?? ""),
        faculty: String(f.get("faculty") ?? ""),
        course: Number(f.get("course")),
        contact: String(f.get("contact") ?? ""),
        email: String(f.get("email") ?? ""),
        motivation: String(f.get("motivation") ?? ""),
      });
      if (!result.ok) {
        setError(result.error);
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setError("Ariza yuborilmadi. Internet aloqasini tekshirib, qayta urinib ko'ring.");
      setStatus("idle");
    } finally {
      pending.current = false;
    }
  }

  if (status === "done") return (
    <div role="status" className="card p-10 text-center">
      <CheckCircle2 className="mx-auto text-gold-400" size={40} aria-hidden />
      <h2 className="mt-4 text-2xl">Arizangiz qabul qilindi</h2>
      <p className="mt-2 text-sm text-slate-400">Ariza saqlandi. Ko'rib chiqilgach siz bilan bog'lanamiz.</p>
    </div>
  );
  const sending = status === "sending";
  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8">
      <Field id="fullName" label="To'liq ism"><input id="fullName" name="fullName" required autoComplete="name" disabled={sending} className="input disabled:opacity-60" /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="faculty" label="Fakultet"><input id="faculty" name="faculty" required disabled={sending} className="input disabled:opacity-60" /></Field>
        <Field id="course" label="Kurs"><select id="course" name="course" required disabled={sending} className="input disabled:opacity-60">{[1, 2, 3, 4, 5].map((c) => <option key={c} value={c}>{c}-kurs</option>)}</select></Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="email" label="Email"><input id="email" name="email" type="email" required autoComplete="email" disabled={sending} className="input disabled:opacity-60" /></Field>
        <Field id="contact" label="Telefon yoki Telegram"><input id="contact" name="contact" required disabled={sending} className="input disabled:opacity-60" /></Field>
      </div>
      <Field id="motivation" label="Nega klubga qo'shilmoqchisiz?"><textarea id="motivation" name="motivation" required minLength={20} rows={5} disabled={sending} className="input disabled:opacity-60" /></Field>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" required disabled={sending} className="mt-1 accent-[#d4af37]" />Ma'lumotlarim ariza ko'rib chiqilishi uchun ishlatilishiga roziman.</label>
      {error ? <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
      <button type="submit" disabled={sending} aria-busy={sending} className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60">{sending ? "Yuborilmoqda..." : "Ariza yuborish"}</button>
    </form>
  );
}
