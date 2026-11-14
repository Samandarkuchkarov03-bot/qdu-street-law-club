import { CalendarDays, Clock, MapPin } from "lucide-react";
import type { ClubEvent } from "@/types";
import SmartImage from "@/components/SmartImage";

const statusLabel = { upcoming: "Kelgusi", past: "O'tgan", undated: "Sana yo'q" };

export default function EventCard({ e }: { e: ClubEvent }) {
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      {e.imageUrl ? (
        <div className="relative h-44 w-full bg-navy-900">
          {e.video ? <video src={e.imageUrl} className="h-full w-full object-cover" muted playsInline /> : <SmartImage src={e.imageUrl} alt="" className="object-cover" />}
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5 min-[431px]:p-6">
        <span className="w-fit max-w-full rounded-full bg-gold-500/15 px-3 py-1 text-xs font-semibold text-gold-300">{statusLabel[e.status]}</span>
        <h3 className="mt-4 text-xl">{e.title}</h3>
        {e.summary ? <p className="mt-2 flex-1 text-sm text-slate-400">{e.summary}</p> : <div className="flex-1" />}
        <ul className="mt-5 space-y-1.5 text-sm">
          <li className="flex items-center gap-2"><CalendarDays size={16} aria-hidden className="shrink-0 text-gold-400" /><span className="min-w-0">{e.dateLabel}</span></li>
          {e.timeLabel ? <li className="flex items-center gap-2"><Clock size={16} aria-hidden className="shrink-0 text-gold-400" /><span className="min-w-0">{e.timeLabel}</span></li> : null}
          <li className="flex items-center gap-2"><MapPin size={16} aria-hidden className="shrink-0 text-gold-400" /><span className="min-w-0">{e.location}</span></li>
        </ul>
      </div>
    </article>
  );
}
