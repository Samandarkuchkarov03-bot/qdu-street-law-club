import type { Member } from "@/types";
import SmartImage from "@/components/SmartImage";

export default function MemberCard({ m }: { m: Member }) {
  const initials = m.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <article className="card group h-full p-5 text-center min-[431px]:p-6">
      <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-gold-500/60 transition group-hover:scale-105">
        {m.photo ? (
          <SmartImage src={m.photo} alt={`${m.fullName} surati`} className="object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-navy-700 to-navy-900 font-serif text-2xl text-gold-400" role="img" aria-label={`${m.fullName} (surat yo'q)`}>{initials}</div>
        )}
      </div>
      <h3 className="mt-4 text-lg">{m.fullName}</h3>
      <p className="mt-1 text-sm font-medium text-gold-400">{m.position}</p>
      {m.bio ? <p className="mt-3 text-sm leading-6 text-slate-400">{m.bio}</p> : null}
    </article>
  );
}
