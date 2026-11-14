"use client";
import { useState, type FormEvent } from "react";
import { site } from "@/data/site";

export default function ContactForm() {
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    const message = String(f.get("message") ?? "").trim();
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
      setError("Ism, to'g'ri email va kamida 10 belgili xabar kiriting.");
      return;
    }
    const subject = encodeURIComponent(`QDU Street Law Club: ${name}`);
    const body = encodeURIComponent(`${message}\n\nYuboruvchi: ${name}\nEmail: ${email}`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8">
      <p className="text-sm leading-6 text-slate-400">Xabar elektron pochta dasturingizda ochiladi. Aloqa uchun alohida xabarlar jadvali yo'q.</p>
      <div><label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white">Ismingiz</label><input id="name" name="name" required minLength={2} className="input" /></div>
      <div><label htmlFor="cemail" className="mb-1.5 block text-sm font-medium text-white">Email</label><input id="cemail" name="email" type="email" required className="input" /></div>
      <div><label htmlFor="message" className="mb-1.5 block text-sm font-medium text-white">Xabar</label><textarea id="message" name="message" required minLength={10} rows={5} className="input" /></div>
      {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
      <button className="btn-gold w-full">Xat yozish</button>
    </form>
  );
}
