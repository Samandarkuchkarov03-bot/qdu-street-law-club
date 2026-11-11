import type { Metadata } from "next";
import { PageHeader, Placeholder } from "@/components/PageHeader";
import GalleryGrid from "@/components/GalleryGrid";
import { getGallery } from "@/lib/repository";

export const metadata: Metadata = { title: "Galereya" };

export default async function Gallery() {
  const items = await getGallery();
  return (
    <>
      <PageHeader eyebrow="Galereya" title="Foto galereya" text="Klub hayotidan lavhalar." />
      <div className="container-x py-12"><Placeholder text="Namunaviy bloklar. Rasmlarni public/gallery papkasiga qo'ying va data/gallery.ts da src ni belgilang." /><GalleryGrid items={items} /></div>
    </>
  );
}
