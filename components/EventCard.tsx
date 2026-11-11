import { CalendarDays, MapPin } from "lucide-react";
import type { ClubEvent } from "@/types";

export default function EventCard({ e }: { e: ClubEvent }) {
  return (
    <article className="card flex h-full flex-col p-5 min-[431px]:p-6">
      <span className="w-fit max-w-full rounded-full bg-gold-500/15 px-3 py-1 text-xs font-semibold text-gold-300">{e.category}</span>
      <h3 className="mt-4 text-xl">{e.title}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-400">{e.summary}</p>
      <ul className="mt-5 space-y-1.5 text-sm">
        <li className="flex items-center gap-2"><CalendarDays size={16} aria-hidden className="shrink-0 text-gold-400" /><span className="min-w-0">{e.dateLabel}</span></li>
        <li className="flex items-center gap-2"><MapPin size={16} aria-hidden className="shrink-0 text-gold-400" /><span className="min-w-0">{e.location}</span></li>
      </ul>
    </article>
  );
}
