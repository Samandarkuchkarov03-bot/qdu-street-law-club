import Link from "next/link";
import { ArrowRight, BookOpen, Gavel, Users } from "lucide-react";
import Reveal from "@/components/Reveal";
import Counter from "@/components/Counter";
import MemberCard from "@/components/MemberCard";
import EventCard from "@/components/EventCard";
import GalleryGrid from "@/components/GalleryGrid";
import { SectionHead } from "@/components/PageHeader";
import { getArticles, getEvents, getFeaturedMembers, getGallery, getLatestEvents, getMembers, getQuizzes } from "@/lib/repository";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const pillars = [
  { icon: BookOpen, title: "Huquqiy ta'lim", text: "Murakkab huquqiy mavzularni oddiy va tushunarli tilda tushuntiramiz." },
  { icon: Users, title: "Hamjamiyat", text: "Talabalar, o'qituvchilar va mahalla aholisini bir joyga jamlaymiz." },
  { icon: Gavel, title: "Amaliyot", text: "Munozara, sud simulyatsiyasi va ochiq darslar orqali o'rganamiz." },
];

export default async function Home() {
  const [featured, latest, gallery, all, events, articles, quizzes] = await Promise.all([
    getFeaturedMembers(),
    getLatestEvents(3),
    getGallery(),
    getMembers(),
    getEvents(),
    getArticles(),
    getQuizzes(),
  ]);
  const stats = [
    { label: "Jamoa a'zolari", value: all.length },
    { label: "Tadbirlar", value: events.length },
    { label: "Maqolalar", value: articles.length },
    { label: "Interaktiv testlar", value: quizzes.length },
  ];
  return (
    <>
      <section className="relative overflow-hidden py-16 min-[431px]:py-24 sm:py-36">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(22,42,92,0.9),transparent_60%)]" />
        <div className="container-x relative">
          <p className="eyebrow animate-pulse">{site.university}</p>
          <h1 className="mt-5 max-w-3xl text-4xl leading-tight min-[431px]:text-5xl min-[431px]:leading-[1.1] sm:text-7xl">Huquqni bilish — <span className="text-gold-400">kuch.</span> Uni hamma uchun ochiq qilamiz.</h1>
          <p className="mt-6 max-w-xl text-base text-slate-400 min-[431px]:text-lg">{site.name} — talabalar tomonidan yuritiladigan huquqiy ta'lim klubi: seminarlar, munozaralar va bepul huquqiy savodxonlik darslari.</p>
          <div className="mt-8 flex flex-col gap-3 min-[431px]:mt-10 min-[431px]:flex-row min-[431px]:flex-wrap min-[431px]:gap-4">
            <Link href="/join" className="btn-gold w-full min-[431px]:w-auto">A'zo bo'lish <ArrowRight size={16} aria-hidden /></Link>
            <Link href="/about" className="btn-ghost w-full min-[431px]:w-auto">Klub haqida</Link>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 120}><div className="card h-full p-7">
              <p.icon className="text-gold-400" size={28} aria-hidden /><h3 className="mt-4 text-xl">{p.title}</h3><p className="mt-2 text-sm text-slate-400">{p.text}</p>
            </div></Reveal>
          ))}
        </div>
      </section>

      <section aria-label="Statistika" className="border-y border-white/10 bg-navy-900 py-14">
        <dl className="container-x grid grid-cols-2 gap-x-4 gap-y-8 text-center min-[431px]:gap-8 md:grid-cols-4">
          {stats.map((s) => (<div key={s.label} className="min-w-0"><dd className="font-serif text-4xl text-gold-400 min-[431px]:text-5xl"><Counter to={s.value} /></dd><dt className="mt-2 text-sm text-slate-400">{s.label}</dt></div>))}
        </dl>
        <p className="mt-6 text-center text-xs text-slate-600">Raqamlar nashr qilingan ma'lumotlardan hisoblanadi.</p>
      </section>

      <section className="container-x pt-16 min-[431px]:pt-24">
        <SectionHead eyebrow="Jamoa" title="Jamoa a'zolari" href="/team" />
        {featured.length ? <ul className="grid gap-5 md:grid-cols-3">{featured.map((m, i) => <li key={m.id}><Reveal delay={i * 100}><MemberCard m={m} /></Reveal></li>)}</ul> : <p className="card p-10 text-center text-slate-400">Hali nashr qilingan a'zo yo'q.</p>}
      </section>

      <section className="container-x pt-16 min-[431px]:pt-24">
        <SectionHead eyebrow="Tadbirlar" title="So'nggi tadbirlar" href="/events" />
        {latest.length ? <ul className="grid gap-5 md:grid-cols-3">{latest.map((e, i) => <li key={e.id}><Reveal delay={i * 100} className="h-full"><EventCard e={e} /></Reveal></li>)}</ul> : <p className="card p-10 text-center text-slate-400">Hali e'lon qilingan tadbir yo'q.</p>}
      </section>

      <section className="container-x pt-16 min-[431px]:pt-24">
        <SectionHead eyebrow="Galereya" title="Lavhalar" href="/gallery" />
        <GalleryGrid items={gallery.slice(0, 3)} />
      </section>

      <section className="container-x pt-16 min-[431px]:pt-24">
        <div className="relative overflow-hidden rounded-3xl border border-gold-500/30 bg-gradient-to-br from-navy-700 to-navy-900 p-6 text-center min-[431px]:p-10 sm:p-16">
          <div aria-hidden className="absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-gold-500/20 blur-3xl" />
          <h2 className="relative text-2xl min-[431px]:text-3xl sm:text-4xl">Huquqiy ta'lim harakatiga qo'shiling</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-slate-400">Ariza topshiring va jamoamizning bir qismiga aylaning.</p>
          <Link href="/join" className="btn-gold relative mt-8 w-full min-[431px]:w-auto">Ariza topshirish <ArrowRight size={16} aria-hidden /></Link>
        </div>
      </section>
    </>
  );
}
