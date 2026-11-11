/**
 * Ma'lumotlar qatlami. UI faqat shu funksiyalarni chaqiradi.
 * Supabase'ga o'tishda faqat shu fayl ichini almashtirish kifoya:
 *   const { data } = await supabase.from("members").select("*");
 * Jadvallar: members, events, articles, gallery, quizzes, applications, messages.
 */
import { members } from "@/data/members";
import { events } from "@/data/events";
import { articles } from "@/data/articles";
import { gallery } from "@/data/gallery";
import { quizzes } from "@/data/quizzes";
import type { ApplicationInput, ContactInput } from "@/types";

export const getMembers = async () => members;
export const getFeaturedMembers = async () => members.filter((m) => m.featured);
export const getEvents = async () => events;
export const getLatestEvents = async (n = 3) => events.slice(0, n);
export const getArticles = async () => articles;
export const getGallery = async () => gallery;
export const getQuizzes = async () => quizzes;

type Result = { ok: boolean };
// TODO: Supabase'ga insert (RLS: faqat insert). Hozircha hech narsa saqlanmaydi.
export async function submitApplication(_input: ApplicationInput): Promise<Result> { return { ok: true }; }
export async function submitContact(_input: ContactInput): Promise<Result> { return { ok: true }; }
