import type { Metadata } from "next";
import { PageHeader, Placeholder } from "@/components/PageHeader";
import TeamExplorer from "@/components/TeamExplorer";
import { getMembers } from "@/lib/repository";

export const metadata: Metadata = { title: "Jamoa" };

export default async function Team() {
  const members = await getMembers();
  return (
    <>
      <PageHeader eyebrow="Jamoa" title="Bizning jamoa" text="Klubni olg'a olib boruvchi talabalar." />
      <div className="container-x py-12">
        {members.some((m) => m.placeholder) && <Placeholder text="Namunaviy a'zolar: haqiqiy jamoa ma'lumotlari data/members.ts faylida almashtiriladi." />}
        <TeamExplorer members={members} />
      </div>
    </>
  );
}
