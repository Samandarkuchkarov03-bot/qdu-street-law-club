import type { Metadata } from "next";
import { PageHeader, Placeholder } from "@/components/PageHeader";
import EventCard from "@/components/EventCard";
import { getEvents } from "@/lib/repository";

export const metadata: Metadata = { title: "Tadbirlar" };

export default async function Events() {
  const events = await getEvents();
  return (
    <>
      <PageHeader eyebrow="Tadbirlar" title="Faoliyat va tadbirlar" text="Seminarlar, munozaralar, ochiq darslar va amaliy mashg'ulotlar." />
      <div className="container-x py-12">
        <Placeholder />
        <ul className="grid gap-5 md:grid-cols-2">{events.map((e) => <li key={e.id}><EventCard e={e} /></li>)}</ul>
      </div>
    </>
  );
}
