import type { Article } from "@/types";
// Ta'limiy mazmun; yuridik maslahat emas.
export const articles: Article[] = [
  { id: "a1", title: "Huquqiy savodxonlik nima?", category: "Asoslar", readMinutes: 3,
    excerpt: "O'z huquq va burchlarini bilish nega har bir inson uchun muhim.",
    body: ["Huquqiy savodxonlik — qonunlar, o'z huquqlari va majburiyatlarini tushunish hamda ulardan hayotda foydalana olish qobiliyatidir.",
      "Huquqini biladigan inson o'zini himoya qila oladi, qaror qabul qilganda oqibatlarini oldindan ko'ra oladi va jamiyatda mas'uliyatli qatnashadi."] },
  { id: "a2", title: "Konstitutsiya — asosiy qonun", category: "Konstitutsiya", readMinutes: 4,
    excerpt: "Nega boshqa barcha qonunlar Konstitutsiyaga zid bo'lmasligi kerak.",
    body: ["O'zbekiston Respublikasi Konstitutsiyasi eng yuqori yuridik kuchga ega. Boshqa qonun va normativ hujjatlar unga muvofiq bo'lishi shart.",
      "Konstitutsiya davlat tuzilishi, inson huquq va erkinliklari hamda davlat organlarining vakolatlarini belgilaydi."] },
  { id: "a3", title: "Aybsizlik prezumpsiyasi", category: "Jinoyat huquqi", readMinutes: 3,
    excerpt: "Kimdir aybdor deb topilgunga qadar nimani anglatadi?",
    body: ["Aybsizlik prezumpsiyasiga ko'ra, shaxs uning jinoyat sodir etganligi qonunda belgilangan tartibda isbotlanmaguncha aybsiz hisoblanadi.",
      "Bu tamoyil insonni asossiz ayblovdan himoya qiladi va isbotlash yuki ayblovchi tomonda bo'lishini bildiradi."] },
];
