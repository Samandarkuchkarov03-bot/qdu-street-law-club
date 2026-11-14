"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import MemberCard from "./MemberCard";
import type { Member } from "@/types";

export default function TeamExplorer({ members }: { members: Member[] }) {
  const [q, setQ] = useState("");
  const [position, setPosition] = useState("");
  const positions = useMemo(() => Array.from(new Set(members.map((m) => m.position))).filter(Boolean), [members]);
  const list = useMemo(() => members.filter((m) => {
    const query = q.trim().toLowerCase();
    const haystack = `${m.fullName} ${m.position} ${m.bio}`.toLowerCase();
    return (!query || haystack.includes(query)) && (!position || m.position === position);
  }), [members, q, position]);

  if (members.length === 0) {
    return <p className="card p-10 text-center text-slate-400">Hali nashr qilingan jamoa a'zolari yo'q.</p>;
  }

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-8 grid gap-3 md:grid-cols-2">
        <div className="relative">
          <label htmlFor="search" className="sr-only">Ism bo'yicha qidirish</label>
          <Search size={18} aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input id="search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ism, lavozim yoki ma'lumot" className="input pl-11" />
        </div>
        <div>
          <label htmlFor="position" className="sr-only">Lavozim</label>
          <select id="position" value={position} onChange={(e) => setPosition(e.target.value)} className="input">
            <option value="">Barcha lavozimlar</option>
            {positions.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </form>
      <p aria-live="polite" className="mb-4 text-sm text-slate-500">{list.length} ta natija</p>
      {list.length ? (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((m) => <li key={m.id} className="min-w-0"><MemberCard m={m} /></li>)}</ul>
      ) : (
        <p className="card p-10 text-center">Hech narsa topilmadi. Filtrlarni o'zgartirib ko'ring.</p>
      )}
    </div>
  );
}
