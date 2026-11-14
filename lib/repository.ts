import { createServerSupabase } from "@/lib/supabase-server";
import type { Article, ClubEvent, GalleryItem, Member, Quiz } from "@/types";

const TIME_ZONE = "Asia/Tashkent";

type Row = Record<string, unknown>;

function fail(error: { message?: string } | null, fallback: string): asserts error is null {
  if (error) {
    console.error(fallback, error.message);
    throw new Error(fallback);
  }
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("uz-UZ", { timeZone: TIME_ZONE, year: "numeric", month: "long", day: "numeric" }).format(date);
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("uz-UZ", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit" }).format(date);
}

function readMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

function mapMember(row: Row): Member {
  const photo = text(row.image_url);
  return {
    id: text(row.id),
    fullName: text(row.full_name),
    position: text(row.position) || "Lavozim kiritilmagan",
    bio: text(row.bio),
    photo: photo || undefined,
  };
}

function mapEvent(row: Row, now: number): ClubEvent {
  const rawDate = text(row.event_date);
  const image = text(row.image_url);
  const time = rawDate ? new Date(rawDate).getTime() : NaN;
  const status = !rawDate || Number.isNaN(time) ? "undated" : time >= now ? "upcoming" : "past";
  return {
    id: text(row.id),
    title: text(row.title),
    summary: text(row.description),
    dateLabel: rawDate ? formatDate(rawDate) : "Sana belgilanmagan",
    timeLabel: rawDate ? formatTime(rawDate) : "",
    location: text(row.location) || "Joy belgilanmagan",
    imageUrl: image || undefined,
    video: image ? isVideoUrl(image) : false,
    status,
  };
}

function mapArticle(row: Row): Article {
  const content = text(row.content);
  const excerpt = text(row.excerpt);
  const image = text(row.image_url);
  const created = text(row.created_at);
  return {
    id: text(row.id),
    title: text(row.title),
    excerpt: excerpt || content.slice(0, 180),
    content,
    imageUrl: image || undefined,
    video: image ? isVideoUrl(image) : false,
    createdLabel: created ? formatDate(created) : "",
    readMinutes: readMinutes(content || excerpt),
  };
}

function mapGallery(row: Row): GalleryItem {
  const image = text(row.image_url);
  const title = text(row.title) || "Lavha";
  const description = text(row.description);
  return {
    id: text(row.id),
    title,
    caption: description || title,
    src: image || undefined,
    video: image ? isVideoUrl(image) : false,
  };
}

export async function getMembers(): Promise<Member[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from("team").select("id,full_name,position,bio,image_url,is_published,created_at").eq("is_published", true).order("full_name", { ascending: true });
  fail(error, "Jamoa a'zolarini yuklab bo'lmadi.");
  return (data ?? []).map((row) => mapMember(row as Row));
}

export async function getFeaturedMembers(): Promise<Member[]> {
  const members = await getMembers();
  return members.slice(0, 3);
}

export async function getEvents(): Promise<ClubEvent[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from("events").select("id,title,description,event_date,location,image_url,is_published").eq("is_published", true).order("event_date", { ascending: true });
  fail(error, "Tadbirlarni yuklab bo'lmadi.");
  const now = Date.now();
  return (data ?? []).map((row) => mapEvent(row as Row, now));
}

export async function getLatestEvents(limit = 3): Promise<ClubEvent[]> {
  const events = await getEvents();
  const upcoming = events.filter((event) => event.status === "upcoming");
  const rest = events.filter((event) => event.status !== "upcoming").reverse();
  return [...upcoming, ...rest].slice(0, limit);
}

export async function getArticles(): Promise<Article[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from("articles").select("id,title,excerpt,content,image_url,is_published,created_at").eq("is_published", true).order("created_at", { ascending: false });
  fail(error, "Maqolalarni yuklab bo'lmadi.");
  return (data ?? []).map((row) => mapArticle(row as Row));
}

export async function getArticle(id: string): Promise<Article | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from("articles").select("id,title,excerpt,content,image_url,is_published,created_at").eq("id", id).eq("is_published", true).maybeSingle();
  fail(error, "Maqolani yuklab bo'lmadi.");
  return data ? mapArticle(data as Row) : null;
}

export async function getGallery(): Promise<GalleryItem[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from("gallery").select("id,title,image_url,description,is_published,created_at").eq("is_published", true).order("created_at", { ascending: false });
  fail(error, "Galereyani yuklab bo'lmadi.");
  return (data ?? []).map((row) => mapGallery(row as Row));
}

export async function getQuizzes(): Promise<Quiz[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("tests")
    .select("id,title,description,category,is_published,created_at,test_questions(id,question,created_at,test_options(id,option_text))")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  fail(error, "Testlarni yuklab bo'lmadi.");

  return (data ?? []).map((row) => {
    const record = row as Row & { test_questions?: Row[] };
    const questions = [...(record.test_questions ?? [])].sort((a, b) => text(a.created_at).localeCompare(text(b.created_at)));
    return {
      id: text(record.id),
      title: text(record.title),
      description: text(record.description),
      category: text(record.category),
      questions: questions.map((question) => {
        const options = [...((question.test_options as Row[] | undefined) ?? [])].sort((a, b) => text(a.id).localeCompare(text(b.id)));
        return {
          id: text(question.id),
          q: text(question.question),
          options: options.map((option) => ({ id: text(option.id), text: text(option.option_text) })),
        };
      }),
    };
  });
}
