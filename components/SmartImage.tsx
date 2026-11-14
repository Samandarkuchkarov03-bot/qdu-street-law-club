import Image from "next/image";

const STORAGE = /^https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//;

export default function SmartImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  if (!STORAGE.test(src)) {
    return <img src={src} alt={alt} className={className} />;
  }
  return <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 33vw" className={className ?? "object-cover"} />;
}
