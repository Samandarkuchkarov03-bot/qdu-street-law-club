import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import EventsExplorer from "@/components/EventsExplorer";
import { getEvents } from "@/lib/repository";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const metadata: Metadata = {
  title: "Tadbirlar",
  description: "QDU Street Law Clubning kelgusi va o'tgan tadbirlari: sana, vaqt va joy.",
  openGraph: { title: "Tadbirlar", description: "Kelgusi va o'tgan tadbirlar." },
};

export default async function Events() {
  const events = await getEvents();
  return (
    <>
      <PageHeader eyebrow="Tadbirlar" title="Faoliyat va tadbirlar" text="Seminarlar, munozaralar, ochiq darslar va amaliy mashg'ulotlar." />
      <div className="container-x py-12">
        <EventsExplorer events={events} />
      </div>
    </>
  );
}
