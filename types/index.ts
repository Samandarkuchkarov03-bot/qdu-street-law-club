export type Member = { id: string; fullName: string; faculty: string; course: number; position: string; photo?: string; featured?: boolean; placeholder?: boolean };
export type ClubEvent = { id: string; title: string; summary: string; category: string; dateLabel: string; location: string; status: "upcoming" | "past" | "tbd"; placeholder?: boolean };
export type Article = { id: string; title: string; excerpt: string; category: string; readMinutes: number; body: string[] };
export type GalleryItem = { id: string; caption: string; src?: string };
export type QuizQuestion = { q: string; options: string[]; answer: number; explain: string };
export type Quiz = { id: string; title: string; description: string; questions: QuizQuestion[] };
export type ApplicationInput = { fullName: string; faculty: string; course: number; contact: string; email: string; motivation: string };
export type ContactInput = { name: string; email: string; message: string };
