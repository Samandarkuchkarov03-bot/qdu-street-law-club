import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import ApplicationForm from "@/components/ApplicationForm";

export const metadata: Metadata = {
  title: "A'zo bo'lish",
  description: "QDU Street Law Clubga a'zolik arizasini yuboring.",
  openGraph: { title: "A'zo bo'lish", description: "Klubga a'zolik arizasi." },
};

export default function Join() {
  return (
    <>
      <PageHeader eyebrow="Ariza" title="Klubga a'zo bo'ling" text="Formani to'ldiring — biz siz bilan bog'lanamiz." />
      <div className="container-x max-w-2xl py-12"><ApplicationForm /></div>
    </>
  );
}
