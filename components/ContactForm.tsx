"use client";
import { useState, type FormEvent } from "react";

export default function ContactForm({ email }: { email: string }) {
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const sender = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender) || message.length < 10) {
      setError("Ism, to'g'ri email va kamida 10 belgili xabar kiriting.");
      return;
    }
    if (!email) {
      setError("Klub email manzili hali sozlanmagan.");
      return;
    }
    const subject = encodeURIComponent(`QDU Street Law Club: ${name}`);
    const body = encodeURIComponent(`${message}\n\nYuboruvchi: ${name}\nEmail: ${sender}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8">
      <p className="text-sm leading-6 text-slate-400">
        {email
          ? "Xabar elektron pochta dasturingizda ochiladi."
          : "Email manzili hali kiritilmagan. Administrator boshqaruv panelidagi profildan saqlashi kerak."}
      </p>
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white">Ismingiz</label>
        <input id="name" name="name" required minLength={2} autoComplete="name" className="input" disabled={!email} />
      </div>
      <div>
        <label htmlFor="cemail" className="mb-1.5 block text-sm font-medium text-white">Email</label>
        <input id="cemail" name="email" type="email" required autoComplete="email" className="input" disabled={!email} />
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-white">Xabar</label>
        <textarea id="message" name="message" required minLength={10} rows={5} className="input" disabled={!email} />
      </div>
      {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
      <button className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={!email}>Xat yozish</button>
    </form>
  );
}
