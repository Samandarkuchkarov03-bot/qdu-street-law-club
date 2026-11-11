import type { ClubEvent } from "@/types";
// NAMUNAVIY ma'lumotlar. Real tadbirlar bilan almashtiring.
export const events: ClubEvent[] = [
  { id: "e1", title: "Huquqiy savodxonlik seminari", summary: "Kundalik hayotda uchraydigan huquqiy vaziyatlar haqida ochiq suhbat.", category: "Seminar", dateLabel: "Sana e'lon qilinadi", location: "Universitet, Nukus", status: "upcoming", placeholder: true },
  { id: "e2", title: "Munozara kechasi", summary: "Talabalar o'rtasida dolzarb huquqiy mavzularda do'stona bahs.", category: "Munozara", dateLabel: "Sana e'lon qilinadi", location: "Universitet, Nukus", status: "tbd", placeholder: true },
  { id: "e3", title: "Ochiq huquq darsi", summary: "Maktab o'quvchilari uchun huquq asoslari bo'yicha interaktiv dars.", category: "Ochiq dars", dateLabel: "Sana e'lon qilinadi", location: "Nukus", status: "tbd", placeholder: true },
  { id: "e4", title: "Sud majlisi simulyatsiyasi", summary: "Soxta sud jarayoni orqali amaliy ko'nikmalarni rivojlantirish.", category: "Moot court", dateLabel: "Sana e'lon qilinadi", location: "Universitet, Nukus", status: "tbd", placeholder: true },
];
