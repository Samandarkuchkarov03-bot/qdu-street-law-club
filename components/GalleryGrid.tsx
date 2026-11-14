"use client";

import { useEffect, useState } from "react";
import { ImageIcon, X } from "lucide-react";
import type { GalleryItem } from "@/types";
import SmartImage from "@/components/SmartImage";

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  if (items.length === 0) {
    return <p className="card p-10 text-center text-slate-400">Galereyada hali nashr qilingan rasm yo'q.</p>;
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 min-[431px]:grid-cols-2 md:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => setActive(item)} className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 text-left min-[431px]:aspect-square">
              {item.src ? (
                item.video ? <video src={item.src} className="h-full w-full object-cover" muted playsInline /> : <SmartImage src={item.src} alt={item.caption} className="object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-navy-700 to-navy-950"><ImageIcon aria-hidden className="text-white/30" size={40} /></div>
              )}
              <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950 to-transparent p-4 text-sm text-white">{item.caption}</p>
            </button>
          </li>
        ))}
      </ul>
      {active ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 p-3 sm:items-center sm:p-6" onClick={() => setActive(null)}>
          <div role="dialog" aria-modal="true" aria-label={active.title} className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-3 text-white">
              <p className="min-w-0 truncate font-medium">{active.title}</p>
              <button type="button" onClick={() => setActive(null)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10" aria-label="Yopish">
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="relative max-h-[75vh] overflow-hidden rounded-2xl bg-navy-950">
              {active.src && active.video ? (
                <video src={active.src} controls autoPlay className="max-h-[75vh] w-full" />
              ) : active.src ? (
                <div className="relative h-[70vh] w-full">
                  <SmartImage src={active.src} alt={active.caption} className="object-contain" />
                </div>
              ) : null}
            </div>
            {active.caption ? <p className="mt-3 text-sm text-slate-300">{active.caption}</p> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
