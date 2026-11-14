import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import EventCard from "@/components/EventCard";
import { getEvents } from "@/lib/repository";
import type { ClubEvent } from "@/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const metadata: Metadata = {
  title: "Tadbirlar",
  description: "QDU Street Law Clubning kelgusi va o'tgan tadbirlari: sana, vaqt va joy.",
  openGraph: { title: "Tadbirlar", description: "Kelgusi va o'tgan tadbirlar." },
};

function EventGroup({ title, events }: { title: string; events: ClubEvent[] }) {
  if (events.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-5 text-2xl">{title}</h2>
      <ul className="grid gap-5 md:grid-cols-2">{events.map((event) => <li key={event.id}><EventCard e={event} /></li>)}</ul>
    </section>
  );
}

export default async function Events() {
  const events = await getEvents();
  const upcoming = events.filter((event) => event.status === "upcoming");
  const past = events.filter((event) => event.status === "past").reverse();
  const undated = events.filter((event) => event.status === "undated");

  return (
    <>
      <PageHeader eyebrow="Tadbirlar" title="Faoliyat va tadbirlar" text="Seminarlar, munozaralar, ochiq darslar va amaliy mashg'ulotlar." />
      <div className="container-x py-12">
        {events.length === 0 ? <p className="card p-10 text-center text-slate-400">Hali e'lon qilingan tadbir yo'q.</p> : null}
        <EventGroup title="Kelgusi tadbirlar" events={upcoming} />
        <EventGroup title="O'tgan tadbirlar" events={past} />
        <EventGroup title="Sana belgilanmagan" events={undated} />
      </div>
    </>
  );
}
