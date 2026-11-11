import type { Metadata } from "next";
import { Eye, Heart, Target } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { site } from "@/data/site";

export const metadata: Metadata = { title: "Klub haqida" };
const values = [
  { icon: Target, title: "Missiya", text: "Huquqiy bilimni oddiy odamga yetkazish va huquqiy madaniyatni oshirish." },
  { icon: Eye, title: "Qarash", text: "Har bir inson o'z huquqlarini biladigan va ulardan oqilona foydalanadigan jamiyat." },
  { icon: Heart, title: "Qadriyatlar", text: "Halollik, ochiqlik, hurmat va mas'uliyat." },
];
const steps = ["Mavzuni tanlaymiz va tadqiq qilamiz", "Tushunarli formatda tayyorlaymiz", "Seminar, dars yoki maqola orqali ulashamiz"];

export default function About() {
  return (
    <>
      <PageHeader eyebrow="Klub haqida" title="Street Law nima?" text={`Street Law — huquqni auditoriyadan ko'chaga olib chiqish g'oyasi. ${site.name} ${site.university} talabalarini shu yo'lda birlashtiradi.`} />
      <section className="container-x grid gap-5 py-20 md:grid-cols-3">
        {values.map((v, i) => (<Reveal key={v.title} delay={i * 120}><div className="card h-full p-7"><v.icon className="text-gold-400" aria-hidden /><h2 className="mt-4 text-xl">{v.title}</h2><p className="mt-2 text-sm text-slate-400">{v.text}</p></div></Reveal>))}
      </section>
      <section className="container-x">
        <h2 className="mb-8 text-3xl">Qanday ishlaymiz</h2>
        <ol className="space-y-4">{steps.map((s, i) => (<li key={s} className="card flex items-center gap-4 p-5 min-[431px]:gap-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-500 font-serif font-bold text-navy-950">{i + 1}</span><span className="min-w-0">{s}</span></li>))}</ol>
      </section>
    </>
  );
}
