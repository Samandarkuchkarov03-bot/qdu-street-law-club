import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import GalleryGrid from "@/components/GalleryGrid";
import { getGallery } from "@/lib/repository";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const metadata: Metadata = {
  title: "Galereya",
  description: "QDU Street Law Club faoliyatidan foto va video lavhalar.",
  openGraph: { title: "Galereya", description: "Klub hayotidan lavhalar." },
};

export default async function Gallery() {
  const items = await getGallery();
  return (
    <>
      <PageHeader eyebrow="Galereya" title="Foto galereya" text="Klub hayotidan lavhalar." />
      <div className="container-x py-12"><GalleryGrid items={items} /></div>
    </>
  );
}
