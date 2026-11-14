"use server";

import { createServerSupabase } from "@/lib/supabase-server";
import type { ApplicationInput } from "@/types";

export type SubmitResult = { ok: true } | { ok: false; error: string };

function applicationError(error: { message?: string; code?: string }): string {
  const message = error.message ?? "";
  if (error.code === "23505") return "Bu email bilan ariza avval yuborilgan.";
  if (error.code === "23514") return "Ariza holati qabul qilinmadi. Qayta urinib ko'ring.";
  if (error.code === "42501" || /row-level security/i.test(message)) {
    return "Ariza hozir qabul qilinmadi. Iltimos, birozdan so'ng qayta urinib ko'ring.";
  }
  if (/fetch|network|failed to fetch/i.test(message)) {
    return "Tarmoq xatosi. Internetni tekshirib, qayta urinib ko'ring.";
  }
  return "Ariza saqlanmadi. Birozdan so'ng qayta urinib ko'ring.";
}

export async function submitApplication(input: ApplicationInput): Promise<SubmitResult> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.contact.trim();
  const faculty = input.faculty.trim();
  const motivation = input.motivation.trim();
  const course = Number(input.course);

  if (input.company?.trim()) return { ok: true };

  if (firstName.length < 2 || lastName.length < 2) {
    return { ok: false, error: "Ism va familiyani kamida 2 ta belgidan kiriting." };
  }
  if (firstName.length > 60 || lastName.length > 60) {
    return { ok: false, error: "Ism yoki familiya juda uzun." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
    return { ok: false, error: "Email manzilini to'g'ri kiriting." };
  }
  const digits = phone.replace(/[^\d]/g, "");
  if (!/^\+?[\d\s()-]{9,20}$/.test(phone) || digits.length < 9 || digits.length > 15) {
    return { ok: false, error: "Telefon raqamini to'g'ri kiriting. Masalan: +998901234567." };
  }
  if (faculty.length < 2 || faculty.length > 120) {
    return { ok: false, error: "Fakultet nomini kiriting." };
  }
  if (!Number.isInteger(course) || course < 1 || course > 5) {
    return { ok: false, error: "Kursni 1 dan 5 gacha tanlang." };
  }
  if (motivation.length < 20) {
    return { ok: false, error: "Motivatsiya kamida 20 ta belgidan iborat bo'lishi kerak." };
  }
  if (motivation.length > 2000) {
    return { ok: false, error: "Motivatsiya 2000 ta belgidan oshmasin." };
  }

  const supabase = createServerSupabase();
  const { error } = await supabase.from("membership_applications").insert({
    full_name: `${firstName} ${lastName}`,
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
