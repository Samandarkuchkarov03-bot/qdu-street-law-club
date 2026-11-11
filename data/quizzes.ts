import type { Quiz } from "@/types";
export const quizzes: Quiz[] = [
  { id: "q1", title: "Konstitutsiya asoslari", description: "Asosiy qonun haqida qisqa bilim sinovi.",
    questions: [
      { q: "O'zbekiston Konstitutsiyasi qachon qabul qilingan?", options: ["1991-yil 31-avgust", "1992-yil 8-dekabr", "1995-yil 1-yanvar"], answer: 1, explain: "Konstitutsiya 1992-yil 8-dekabrda qabul qilingan; shu kun Konstitutsiya kuni sifatida nishonlanadi." },
      { q: "O'zbekistonning oliy vakillik organi qanday nomlanadi?", options: ["Oliy Majlis", "Vazirlar Mahkamasi", "Konstitutsiyaviy sud"], answer: 0, explain: "Parlament — Oliy Majlis; u Qonunchilik palatasi va Senatdan iborat." },
      { q: "Qoraqalpog'iston Respublikasi maqomi qanday?", options: ["Alohida davlat", "O'zbekiston tarkibidagi suveren respublika", "Oddiy viloyat"], answer: 1, explain: "Konstitutsiyaga ko'ra Qoraqalpog'iston O'zbekiston Respublikasi tarkibidagi suveren respublikadir." },
    ] },
  { id: "q2", title: "Huquqiy tushunchalar", description: "Kundalik huquqiy tushunchalar bo'yicha test.",
    questions: [
      { q: "O'zbekistonda voyaga yetish yoshi nechada?", options: ["16", "18", "21"], answer: 1, explain: "Fuqaro 18 yoshdan to'liq muomala layoqatiga ega bo'ladi." },
      { q: "Aybsizlik prezumpsiyasida isbotlash yuki kimda?", options: ["Gumon qilinuvchida", "Ayblovchi tomonda", "Guvohlarda"], answer: 1, explain: "Aybni isbotlash ayblovchi tomonning vazifasi." },
      { q: "Qonun odatda qachon kuchga kiradi?", options: ["Rasman e'lon qilingach, belgilangan tartibda", "Yozilgan zahoti", "Faqat ommaviy muhokamadan keyin"], answer: 0, explain: "Normativ hujjatlar rasmiy e'lon qilingach va o'zida belgilangan muddatda kuchga kiradi." },
    ] },
];
