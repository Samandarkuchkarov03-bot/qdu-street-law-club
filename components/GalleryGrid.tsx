import { ImageIcon } from "lucide-react";
import type { GalleryItem } from "@/types";

const tones = ["from-navy-700 to-navy-900", "from-gold-600/40 to-navy-800", "from-navy-800 to-gold-500/20", "from-navy-700 to-navy-950", "from-gold-500/30 to-navy-900", "from-navy-900 to-navy-700"];

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 min-[431px]:grid-cols-2 md:grid-cols-3">
      {items.map((g, i) => (
        <li key={g.id} className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 ${i % 5 === 0 ? "min-[431px]:aspect-[4/5]" : "min-[431px]:aspect-square"}`}>
          {g.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={g.src} alt={g.caption} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
          ) : (
            <div className={`grid h-full w-full place-items-center bg-gradient-to-br ${tones[i % tones.length]} transition duration-500 group-hover:scale-110`}><ImageIcon aria-hidden className="text-white/30" size={40} /></div>
          )}
          <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950 to-transparent p-4 text-sm text-white">{g.caption}</p>
        </li>
      ))}
    </ul>
  );
}
