/**
 * Ma'lumotlar qatlami. UI faqat shu funksiyalarni chaqiradi.
 * Supabase'ga o'tishda faqat shu fayl ichini almashtirish kifoya:
 *   const { data } = await supabase.from("members").select("*");
 * A'zolik arizasi `membership_applications` jadvaliga yoziladi.
 * Qolgan jadvallar: members, events, articles, gallery, quizzes.
 */
import { members } from "@/data/members";
import { events } from "@/data/events";
import { articles } from "@/data/articles";
import { gallery } from "@/data/gallery";
import { quizzes } from "@/data/quizzes";
import { supabase } from "@/lib/supabase";
import type { ApplicationInput, ContactInput } from "@/types";

export const getMembers = async () => members;
export const getFeaturedMembers = async () => members.filter((m) => m.featured);
export const getEvents = async () => events;
export const getLatestEvents = async (n = 3) => events.slice(0, n);
export const getArticles = async () => articles;
export const getGallery = async () => gallery;
export const getQuizzes = async () => quizzes;

type Result = { ok: boolean };
export type SubmitResult = { ok: true } | { ok: false; error: string };

function applicationError(error: { message?: string; code?: string }): string {
  const message = error.message ?? "";
  if (error.code === "23505") return "Bu email bilan ariza avval yuborilgan.";
  if (error.code === "42501" || /row-level security/i.test(message)) {
    return "Ariza qabul qilinmadi. Server yangi arizani saqlashga ruxsat bermadi.";
  }
  if (/fetch|network|failed to fetch/i.test(message)) {
    return "Tarmoq xatosi. Internetni tekshirib, qayta urinib ko'ring.";
  }
  return "Ariza saqlanmadi. Birozdan so'ng qayta urinib ko'ring.";
}

export async function submitApplication(input: ApplicationInput): Promise<SubmitResult> {
  const full_name = input.fullName.trim();
  const email = input.email.trim();
  const phone = input.contact.trim();
  const faculty = input.faculty.trim();
  const motivation = input.motivation.trim();
  const course = Number(input.course);

  if (!full_name || !email || !phone || !faculty || !motivation) {
    return { ok: false, error: "Barcha maydonlarni to'ldiring." };
  }
  if (!Number.isInteger(course) || course < 1 || course > 5) {
    return { ok: false, error: "Kursni 1 dan 5 gacha tanlang." };
  }
  if (motivation.length < 20) {
    return { ok: false, error: "Motivatsiya kamida 20 ta belgidan iborat bo'lishi kerak." };
  }

  const { error } = await supabase.from("membership_applications").insert({
    full_name,
    email,
    phone,
    faculty,
    course,
    motivation,
    status: "pending",
  });

  if (error) return { ok: false, error: applicationError(error) };
  return { ok: true };
}

export async function submitContact(_input: ContactInput): Promise<Result> { return { ok: true }; }
