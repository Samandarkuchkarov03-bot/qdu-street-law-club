"use client";

import { useState } from "react";
import Image from "next/image";

const STORAGE = /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//;

export default function SmartImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div className="grid h-full w-full place-items-center bg-navy-800 px-3 text-center text-xs text-slate-500">Rasm ochilmadi</div>;
  }
  if (!STORAGE.test(src)) {
    return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
  }
  return <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 33vw" className={className ?? "object-cover"} onError={() => setFailed(true)} />;
}
