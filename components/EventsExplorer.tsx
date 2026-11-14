"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import EventCard from "@/components/EventCard";
import type { ClubEvent } from "@/types";

const groups = [
  { id: "upcoming", title: "Kelgusi tadbirlar" },
  { id: "past", title: "O'tgan tadbirlar" },
  { id: "undated", title: "Sana belgilanmagan" },
] as const;

export default function EventsExplorer({ events }: { events: ClubEvent[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | ClubEvent["status"]>("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return events.filter((event) => {
      const haystack = `${event.title} ${event.summary} ${event.location}`.toLowerCase();
      return (!needle || haystack.includes(needle)) && (!status || event.status === status);
    });
  }, [events, query, status]);

  if (events.length === 0) {
    return <p className="card p-10 text-center text-slate-400">Hali e'lon qilingan tadbir yo'q.</p>;
  }

  return (
    <div>
      <form role="search" onSubmit={(event) => event.preventDefault()} className="mb-8 grid gap-3 md:grid-cols-2">
        <div className="relative">
          <label htmlFor="event-search" className="sr-only">Tadbir qidirish</label>
          <Search size={18} aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input id="event-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom, joy yoki tavsif" className="input pl-11" />
        </div>
        <div>
          <label htmlFor="event-status" className="sr-only">Tadbir holati</label>
          <select id="event-status" value={status} onChange={(event) => setStatus(event.target.value as "" | ClubEvent["status"])} className="input">
            <option value="">Barcha tadbirlar</option>
            <option value="upcoming">Kelgusi</option>
            <option value="past">O'tgan</option>
            <option value="undated">Sana belgilanmagan</option>
          </select>
        </div>
      </form>
      <p aria-live="polite" className="mb-4 text-sm text-slate-500">{filtered.length} ta tadbir</p>
      {filtered.length === 0 ? <p className="card p-10 text-center">Hech narsa topilmadi.</p> : null}
      {groups.map((group) => {
        const list = filtered.filter((event) => event.status === group.id);
        const ordered = group.id === "past" ? [...list].reverse() : list;
        if (ordered.length === 0) return null;
        return (
          <section key={group.id} className="mt-10 first:mt-0">
            <h2 className="mb-5 text-2xl">{group.title}</h2>
            <ul className="grid gap-5 md:grid-cols-2">{ordered.map((event) => <li key={event.id}><EventCard e={event} /></li>)}</ul>
          </section>
        );
      })}
    </div>
  );
}
