"use client";
import { useState, type FormEvent } from "react";
import { submitContact } from "@/lib/repository";

export default function ContactForm() {
  const [done, setDone] = useState(false);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await submitContact({ name: String(f.get("name")), email: String(f.get("email")), message: String(f.get("message")) });
    setDone(true);
  }
  if (done) return <p role="status" className="card p-8 text-center">Xabaringiz uchun rahmat! (Demo: hozircha yuborilmaydi.)</p>;
  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8">
      <div><label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white">Ismingiz</label><input id="name" name="name" required className="input" /></div>
      <div><label htmlFor="cemail" className="mb-1.5 block text-sm font-medium text-white">Email</label><input id="cemail" name="email" type="email" required className="input" /></div>
      <div><label htmlFor="message" className="mb-1.5 block text-sm font-medium text-white">Xabar</label><textarea id="message" name="message" required rows={5} className="input" /></div>
      <button className="btn-gold w-full">Yuborish</button>
    </form>
  );
}
