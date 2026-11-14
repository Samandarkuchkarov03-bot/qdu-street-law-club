import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import TeamExplorer from "@/components/TeamExplorer";
import { getMembers } from "@/lib/repository";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const metadata: Metadata = {
  title: "Jamoa",
  description: "QDU Street Law Club jamoasi: nashr qilingan a'zolar, lavozimlari va qisqa ma'lumotlari.",
  openGraph: { title: "Jamoa", description: "QDU Street Law Club jamoasi." },
};

export default async function Team() {
  const members = await getMembers();
  return (
    <>
      <PageHeader eyebrow="Jamoa" title="Bizning jamoa" text="Klubni olg'a olib boruvchi talabalar." />
      <div className="container-x py-12">
        <TeamExplorer members={members} />
      </div>
    </>
  );
}
