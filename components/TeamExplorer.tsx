"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import MemberCard from "./MemberCard";
import type { Member } from "@/types";

export default function TeamExplorer({ members }: { members: Member[] }) {
  const [q, setQ] = useState("");
  const [faculty, setFaculty] = useState("");
  const [position, setPosition] = useState("");
  const faculties = useMemo(() => Array.from(new Set(members.map((m) => m.faculty))), [members]);
  const positions = useMemo(() => Array.from(new Set(members.map((m) => m.position))), [members]);
  const list = useMemo(() => members.filter((m) =>
    m.fullName.toLowerCase().includes(q.trim().toLowerCase()) && (!faculty || m.faculty === faculty) && (!position || m.position === position)),
    [members, q, faculty, position]);

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-8 grid gap-3 md:grid-cols-3">
        <div className="relative">
          <label htmlFor="search" className="sr-only">Ism bo'yicha qidirish</label>
          <Search size={18} aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input id="search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ism bo'yicha qidirish" className="input pl-11" />
        </div>
        <div><label htmlFor="faculty" className="sr-only">Fakultet</label>
          <select id="faculty" value={faculty} onChange={(e) => setFaculty(e.target.value)} className="input"><option value="">Barcha fakultetlar</option>{faculties.map((f) => <option key={f}>{f}</option>)}</select></div>
        <div><label htmlFor="position" className="sr-only">Lavozim</label>
          <select id="position" value={position} onChange={(e) => setPosition(e.target.value)} className="input"><option value="">Barcha lavozimlar</option>{positions.map((p) => <option key={p}>{p}</option>)}</select></div>
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
