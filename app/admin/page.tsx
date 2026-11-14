"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  ImagePlus,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Trash2,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { clearServerSession, syncServerSession } from "@/lib/auth-session";

type SectionId = "dashboard" | "team" | "applications" | "events" | "articles" | "gallery" | "tests" | "profile";

type TeamRow = {
  id: string;
  full_name: string;
  position: string | null;
  bio: string | null;
  image_url: string | null;
  is_published: boolean | null;
  created_at: string;
};

type ApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  faculty: string | null;
  course: string | number | null;
  motivation: string | null;
  status: string | null;
  created_at: string;
};

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  image_url: string | null;
  is_published: boolean | null;
  created_at: string;
};

type ArticleRow = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  is_published: boolean | null;
  created_at: string;
};

type GalleryRow = {
  id: string;
  title: string | null;
  image_url: string | null;
  description: string | null;
  is_published: boolean | null;
  created_at: string;
};

type TestRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  is_published: boolean | null;
  created_at: string;
};

type QuestionRow = {
  id: string;
  test_id: string;
  question: string;
  created_at: string;
};

type OptionRow = {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean | null;
};

type ApplicationFilter = "all" | "pending" | "approved" | "rejected";

const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

const fieldClass =
  "w-full rounded-xl border border-white/15 bg-navy-950 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-gold-400";
const labelClass = "mb-1.5 block text-sm font-medium text-white";
const goldBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50";
const ghostBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-gold-400 hover:text-gold-300 disabled:cursor-not-allowed disabled:opacity-50";
const dangerBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-400/40 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50";
const cardClass = "rounded-2xl border border-white/10 bg-navy-900/70 p-4";

const NAV: { id: SectionId; label: string; icon: typeof Users }[] = [
  { id: "dashboard", label: "Boshqaruv", icon: LayoutDashboard },
  { id: "team", label: "Jamoa a'zolari", icon: Users },
  { id: "applications", label: "A'zolik arizalari", icon: Inbox },
  { id: "events", label: "Tadbirlar", icon: CalendarDays },
  { id: "articles", label: "Maqolalar", icon: FileText },
  { id: "gallery", label: "Galereya", icon: ImagePlus },
  { id: "tests", label: "Testlar", icon: ClipboardList },
  { id: "profile", label: "Profil", icon: UserRound },
];

function rowsOf<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function errorText(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

function formatWhen(value: string | null): string {
  if (!value) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function dateTimeInputValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function statusKind(status: string | null): "pending" | "approved" | "rejected" {
  const value = (status ?? "").trim().toLowerCase();
  if (value === "approved" || value === "tasdiqlangan") return "approved";
  if (value === "rejected" || value === "rad etilgan" || value === "rad") return "rejected";
  return "pending";
}

function statusLabel(status: string | null): string {
  const kind = statusKind(status);
  if (kind === "approved") return "Tasdiqlangan";
  if (kind === "rejected") return "Rad etilgan";
  return "Kutilmoqda";
}

const MEDIA_BUCKET = "street-law-media";

async function resolveBucket(): Promise<string> {
  const { data, error } = await supabase.storage.listBuckets();
  // listBuckets() often returns [] for a signed-in admin: reading storage.buckets
  // is a separate permission from uploading. An empty list does not mean the bucket is missing.
  if (error || !data?.length) return MEDIA_BUCKET;
  const named = data.find((bucket) => bucket.id === MEDIA_BUCKET || bucket.name === MEDIA_BUCKET);
  if (!named) return MEDIA_BUCKET;
  if (named.public === false) {
    throw new Error("street-law-media bucket topildi, lekin public emas. Dashboardda Public ni yoqing.");
  }
  return named.name || MEDIA_BUCKET;
}

async function uploadToBucket(file: File, folder: string): Promise<string> {
  if (file.size > MAX_MEDIA_BYTES) {
    throw new Error("Fayl 50 MB dan katta bo'lmasligi kerak.");
  }
  const bucket = await resolveBucket();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data.publicUrl) throw new Error("Yuklangan fayl manzili olinmadi.");
  return data.publicUrl;
}

function useMediaPicker() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState("");
  const previewRef = useRef<string | null>(null);

  const pick = useCallback((next: File | null) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = next ? URL.createObjectURL(next) : null;
    previewRef.current = url;
    setPreview(url);
    setFile(next);
    setClearImage(false);
  }, []);

  const reset = useCallback(() => {
    pick(null);
    setClearImage(false);
    setRemoteUrl("");
  }, [pick]);

  const markClear = useCallback(() => {
    pick(null);
    setClearImage(true);
  }, [pick]);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  return { file, preview, clearImage, remoteUrl, setRemoteUrl, pick, reset, markClear };
}

async function chosenImage(media: { file: File | null; clearImage: boolean; remoteUrl: string }, folder: string, current: string | null): Promise<string | null> {
  if (media.file) return uploadToBucket(media.file, folder);
  if (media.clearImage) return null;
  const remote = media.remoteUrl.trim();
  if (remote) {
    if (!/^https:\/\/\S+$/i.test(remote)) throw new Error("Rasm manzili https:// bilan boshlanishi kerak.");
    return remote;
  }
  return current;
}

function Alerts({ error, success }: { error: string; success: string }) {
  if (!error && !success) return null;
  return (
    <div className="mb-4 space-y-2">
      {error ? (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </p>
      ) : null}
    </div>
  );
}

function LoadingBlock({ label = "Yuklanmoqda..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-navy-900/60 px-4 py-6 text-sm text-slate-300">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gold-400/30 border-t-gold-400" aria-hidden />
      {label}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-slate-400">{text}</p>;
}

function PublishBadge({ published }: { published: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${published ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-slate-300"}`}>
      {published ? "Nashrda" : "Qoralama"}
    </span>
  );
}

function MediaPreview({ url, alt, className, video }: { url: string; alt: string; className?: string; video?: boolean }) {
  if (video || isVideoUrl(url)) {
    return <video src={url} controls className={className} />;
  }
  return <img src={url} alt={alt} className={className} />;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-gold-500/20 bg-navy-900 p-5 shadow-2xl sm:rounded-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <h3 className="font-serif text-2xl text-white">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Yopish" className="grid h-10 w-10 place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white">
            <X size={18} aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SectionHeading({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-serif text-2xl text-white sm:text-3xl">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">{text}</p>
      </div>
      {action}
    </div>
  );
}

function MediaFields({
  label,
  accept,
  file,
  preview,
  currentUrl,
  clearImage,
  remoteUrl,
  video,
  onPick,
  onClear,
  onRemote,
}: {
  label: string;
  accept: string;
  file: File | null;
  preview: string | null;
  currentUrl: string | null;
  clearImage: boolean;
  remoteUrl: string;
  video: boolean;
  onPick: (file: File | null) => void;
  onClear: () => void;
  onRemote: (value: string) => void;
}) {
  const remoteOk = /^https:\/\/\S+$/i.test(remoteUrl.trim()) ? remoteUrl.trim() : null;
  const shown = preview || remoteOk || (!clearImage ? currentUrl : null);
  return (
    <div>
      <span className={labelClass}>{label}</span>
      {shown ? <MediaPreview url={shown} alt="" video={video || Boolean(preview && file?.type.startsWith("video/"))} className="mb-3 max-h-52 w-full rounded-xl bg-navy-950 object-cover" /> : null}
      <div className="flex flex-wrap gap-2">
        <label className={`${ghostBtn} cursor-pointer`}>
          <Upload size={16} aria-hidden />
          <span className="max-w-[14rem] truncate">{file ? file.name : "Fayl tanlash"}</span>
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(event) => onPick(event.target.files?.[0] ?? null)}
          />
        </label>
        {shown ? (
          <button type="button" onClick={onClear} className={ghostBtn}>
            Faylni olib tashlash
          </button>
        ) : null}
      </div>
      <label className="mt-3 block">
        <span className="mb-1.5 block text-xs text-slate-400">Yoki tayyor https manzil</span>
        <input value={remoteUrl} onChange={(event) => onRemote(event.target.value)} placeholder="https://" className={fieldClass} />
      </label>
      <p className="mt-2 text-xs text-slate-500">Fayl street-law-media public bucketiga yuklanadi va olingan public URL jadvalga saqlanadi.</p>
    </div>
  );
}

function PublishField({ checked, onChange, label = "Nashrga chiqarish" }: { checked: boolean; onChange: (checked: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-3 text-sm text-slate-200">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[#d4af37]" />
      {label}
    </label>
  );
}

function DashboardSection({ onOpen }: { onOpen: (id: SectionId) => void }) {
  const [counts, setCounts] = useState<{ label: string; value: number; id: SectionId }[]>([]);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const specs: { table: string; label: string; id: SectionId }[] = [
      { table: "team", label: "Jamoa", id: "team" },
      { table: "membership_applications", label: "Arizalar", id: "applications" },
      { table: "events", label: "Tadbirlar", id: "events" },
      { table: "articles", label: "Maqolalar", id: "articles" },
      { table: "gallery", label: "Galereya", id: "gallery" },
      { table: "tests", label: "Testlar", id: "tests" },
    ];
    async function load() {
      setLoading(true);
      const next: { label: string; value: number; id: SectionId }[] = [];
      for (const spec of specs) {
        const { count, error: countError } = await supabase.from(spec.table).select("id", { count: "exact", head: true });
        if (countError) {
          setError(countError.message);
          setLoading(false);
          return;
        }
        next.push({ label: spec.label, value: count ?? 0, id: spec.id });
      }
      const pendingResult = await supabase.from("membership_applications").select("id", { count: "exact", head: true }).eq("status", "pending");
      if (!pendingResult.error) setPending(pendingResult.count ?? 0);
      setCounts(next);
      setError("");
      setLoading(false);
    }
    void load();
  }, []);

  return (
    <section>
      <SectionHeading title="Boshqaruv" text="Nashrlar, arizalar va testlar bo'yicha joriy raqamlar." />
      <Alerts error={error} success="" />
      {loading ? <LoadingBlock /> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {counts.map((item) => (
          <button key={item.id} type="button" onClick={() => onOpen(item.id)} className={`${cardClass} text-left transition hover:border-gold-500/40`}>
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-2 font-serif text-4xl text-gold-400">{item.value}</p>
          </button>
        ))}
      </div>
      {!loading && !error ? <p className="mt-4 text-sm text-slate-400">Kutilayotgan arizalar: {pending}</p> : null}
    </section>
  );
}

function TeamSection() {
  const [items, setItems] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamRow | null>(null);
  const [form, setForm] = useState({ full_name: "", position: "", bio: "", is_published: true });
  const media = useMediaPicker();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from("team").select("*").order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setItems(rowsOf<TeamRow>(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function closeForm() {
    setOpen(false);
    setEditing(null);
    media.reset();
  }

  function openCreate() {
    setEditing(null);
    setForm({ full_name: "", position: "", bio: "", is_published: true });
    media.reset();
    setError("");
    setSuccess("");
    setOpen(true);
  }

  function openEdit(row: TeamRow) {
    setEditing(row);
    setForm({
      full_name: row.full_name ?? "",
      position: row.position ?? "",
      bio: row.bio ?? "",
      is_published: Boolean(row.is_published),
    });
    media.reset();
    setError("");
    setSuccess("");
    setOpen(true);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.full_name.trim() || !form.position.trim()) {
      setError("Ism va lavozimni kiriting.");
      setSuccess("");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const image_url = await chosenImage(media, "team", editing?.image_url ?? null);
      const payload = {
        full_name: form.full_name.trim(),
        position: form.position.trim(),
        bio: emptyToNull(form.bio),
        image_url,
        is_published: form.is_published,
      };
      const result = editing
        ? await supabase.from("team").update(payload).eq("id", editing.id)
        : await supabase.from("team").insert(payload);
      if (result.error) throw new Error(result.error.message);
      setSuccess(editing ? "A'zo yangilandi." : "A'zo qo'shildi.");
      closeForm();
      await load();
    } catch (err) {
      setError(errorText(err, "A'zoni saqlab bo'lmadi."));
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: TeamRow) {
    if (!window.confirm(`${row.full_name} jamoadan o'chirilsinmi?`)) return;
    setError("");
    setSuccess("");
    const { error: deleteError } = await supabase.from("team").delete().eq("id", row.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setSuccess("A'zo o'chirildi.");
    await load();
  }

  return (
    <section>
      <SectionHeading
        title="Jamoa a'zolari"
        text="A'zolarni qo'shing, tahrirlang, o'chiring va surat yuklang."
        action={
          <button type="button" onClick={openCreate} className={goldBtn}>
            <Plus size={16} aria-hidden /> A'zo qo'shish
          </button>
        }
      />
      <Alerts error={error} success={success} />
      {loading ? <LoadingBlock /> : null}
      {!loading && items.length === 0 ? <EmptyState text="Hali jamoa a'zolari yo'q." /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((row) => (
          <article key={row.id} className={cardClass}>
            <div className="flex gap-4">
              {row.image_url ? (
                <img src={row.image_url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-navy-700 text-sm font-semibold text-gold-300">
                  {row.full_name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-lg text-white">{row.full_name}</h3>
                  <PublishBadge published={Boolean(row.is_published)} />
                </div>
                <p className="text-sm text-gold-300">{row.position || "Lavozim kiritilmagan"}</p>
                {row.bio ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{row.bio}</p> : null}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => openEdit(row)} className={ghostBtn}>
                <Pencil size={15} aria-hidden /> Tahrirlash
              </button>
              <button type="button" onClick={() => void remove(row)} className={dangerBtn}>
                <Trash2 size={15} aria-hidden /> O'chirish
              </button>
            </div>
          </article>
        ))}
      </div>
      {open ? (
        <Modal title={editing ? "A'zoni tahrirlash" : "Yangi a'zo"} onClose={closeForm}>
          <form onSubmit={(event) => void save(event)} className="space-y-4">
            <label className="block">
              <span className={labelClass}>To'liq ism</span>
              <input required value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Lavozim</span>
              <input required value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Qisqa ma'lumot</span>
              <textarea rows={4} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} className={fieldClass} />
            </label>
            <MediaFields
              label="Surat"
              accept="image/*"
              file={media.file}
              preview={media.preview}
              currentUrl={editing?.image_url ?? null}
              clearImage={media.clearImage}
              remoteUrl={media.remoteUrl}
              video={false}
              onPick={media.pick}
              onClear={media.markClear}
              onRemote={media.setRemoteUrl}
            />
            <PublishField checked={form.is_published} onChange={(is_published) => setForm({ ...form, is_published })} />
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="submit" disabled={saving} className={goldBtn}>{saving ? "Saqlanmoqda..." : "Saqlash"}</button>
              <button type="button" onClick={closeForm} className={ghostBtn}>Bekor qilish</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}

function ApplicationsSection() {
  const [items, setItems] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState<ApplicationFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from("membership_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setItems(rowsOf<ApplicationRow>(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(row: ApplicationRow, status: "approved" | "rejected") {
    setBusyId(row.id);
    setError("");
    setSuccess("");
    const { error: updateError } = await supabase.from("membership_applications").update({ status }).eq("id", row.id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccess(status === "approved" ? "Ariza tasdiqlandi." : "Ariza rad etildi.");
    await load();
  }

  const visible = items.filter((row) => filter === "all" || statusKind(row.status) === filter);
  const filters: { id: ApplicationFilter; label: string }[] = [
    { id: "all", label: "Barchasi" },
    { id: "pending", label: "Kutilmoqda" },
    { id: "approved", label: "Tasdiqlangan" },
    { id: "rejected", label: "Rad etilgan" },
  ];

  return (
    <section>
      <SectionHeading title="A'zolik arizalari" text="Arizalarni ko'rib chiqing, tasdiqlang yoki rad eting." />
      <Alerts error={error} success={success} />
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={filter === item.id ? goldBtn : ghostBtn}
          >
            {item.label}
          </button>
        ))}
      </div>
      {loading ? <LoadingBlock /> : null}
      {!loading && visible.length === 0 ? <EmptyState text="Bu holatda ariza yo'q." /> : null}
      <div className="space-y-4">
        {visible.map((row) => {
          const kind = statusKind(row.status);
          return (
            <article key={row.id} className={cardClass}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl text-white">{row.full_name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{formatWhen(row.created_at)}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    kind === "approved" ? "bg-emerald-500/15 text-emerald-300" : kind === "rejected" ? "bg-red-500/15 text-red-300" : "bg-gold-500/15 text-gold-300"
                  }`}
                >
                  {statusLabel(row.status)}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="text-white">{row.email}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Telefon</dt>
                  <dd className="text-white">{row.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Fakultet</dt>
                  <dd className="text-white">{row.faculty || "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Kurs</dt>
                  <dd className="text-white">{row.course ?? "—"}</dd>
                </div>
              </dl>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">{row.motivation || "Motivatsiya yozilmagan."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" disabled={busyId === row.id || kind === "approved"} onClick={() => void setStatus(row, "approved")} className={goldBtn}>
                  {busyId === row.id ? "Saqlanmoqda..." : "Tasdiqlash"}
                </button>
                <button type="button" disabled={busyId === row.id || kind === "rejected"} onClick={() => void setStatus(row, "rejected")} className={dangerBtn}>
                  Rad etish
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function EventsSection() {
  const [items, setItems] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [form, setForm] = useState({ title: "", description: "", event_date: "", location: "", is_published: true });
  const media = useMediaPicker();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    if (loadError) setError(loadError.message);
    else setItems(rowsOf<EventRow>(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function closeForm() {
    setOpen(false);
    setEditing(null);
    media.reset();
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: "", description: "", event_date: "", location: "", is_published: true });
    media.reset();
    setError("");
    setSuccess("");
    setOpen(true);
  }

  function openEdit(row: EventRow) {
    setEditing(row);
    setForm({
      title: row.title ?? "",
      description: row.description ?? "",
      event_date: dateTimeInputValue(row.event_date),
      location: row.location ?? "",
      is_published: Boolean(row.is_published),
    });
    media.reset();
    setError("");
    setSuccess("");
    setOpen(true);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Tadbir nomini kiriting.");
      setSuccess("");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const image_url = await chosenImage(media, "events", editing?.image_url ?? null);
      const payload = {
        title: form.title.trim(),
        description: emptyToNull(form.description),
        event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
        location: emptyToNull(form.location),
        image_url,
        is_published: form.is_published,
      };
      const result = editing
        ? await supabase.from("events").update(payload).eq("id", editing.id)
        : await supabase.from("events").insert(payload);
      if (result.error) throw new Error(result.error.message);
      setSuccess(editing ? "Tadbir yangilandi." : "Tadbir qo'shildi.");
      closeForm();
      await load();
    } catch (err) {
      setError(errorText(err, "Tadbirni saqlab bo'lmadi."));
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: EventRow) {
    if (!window.confirm(`"${row.title}" tadbiri o'chirilsinmi?`)) return;
    setError("");
    setSuccess("");
    const { error: deleteError } = await supabase.from("events").delete().eq("id", row.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setSuccess("Tadbir o'chirildi.");
    await load();
  }

  return (
    <section>
      <SectionHeading
        title="Tadbirlar"
        text="Tadbir qo'shing, sanasi va joyini yangilang, rasm yoki video yuklang."
        action={
          <button type="button" onClick={openCreate} className={goldBtn}>
            <Plus size={16} aria-hidden /> Tadbir qo'shish
          </button>
        }
      />
      <Alerts error={error} success={success} />
      {loading ? <LoadingBlock /> : null}
      {!loading && items.length === 0 ? <EmptyState text="Hali tadbirlar yo'q." /> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((row) => (
          <article key={row.id} className={cardClass}>
            {row.image_url ? <MediaPreview url={row.image_url} alt="" className="mb-4 h-40 w-full rounded-xl object-cover" /> : null}
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif text-xl text-white">{row.title}</h3>
              <PublishBadge published={Boolean(row.is_published)} />
            </div>
            <p className="mt-2 text-sm text-gold-300">{formatWhen(row.event_date)}{row.location ? ` · ${row.location}` : ""}</p>
            {row.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{row.description}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => openEdit(row)} className={ghostBtn}>
                <Pencil size={15} aria-hidden /> Tahrirlash
              </button>
              <button type="button" onClick={() => void remove(row)} className={dangerBtn}>
                <Trash2 size={15} aria-hidden /> O'chirish
              </button>
            </div>
          </article>
        ))}
      </div>
      {open ? (
        <Modal title={editing ? "Tadbirni tahrirlash" : "Yangi tadbir"} onClose={closeForm}>
          <form onSubmit={(event) => void save(event)} className="space-y-4">
            <label className="block">
              <span className={labelClass}>Nomi</span>
              <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={fieldClass} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Sana va vaqt</span>
                <input type="datetime-local" value={form.event_date} onChange={(event) => setForm({ ...form, event_date: event.target.value })} className={fieldClass} />
              </label>
              <label className="block">
                <span className={labelClass}>Joy</span>
                <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className={fieldClass} />
              </label>
            </div>
            <label className="block">
              <span className={labelClass}>Tavsif</span>
              <textarea rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={fieldClass} />
            </label>
            <MediaFields
              label="Rasm yoki video"
              accept="image/*,video/*"
              file={media.file}
              preview={media.preview}
              currentUrl={editing?.image_url ?? null}
              clearImage={media.clearImage}
              remoteUrl={media.remoteUrl}
              video={Boolean(media.file?.type.startsWith("video/"))}
              onPick={media.pick}
              onClear={media.markClear}
              onRemote={media.setRemoteUrl}
            />
            <PublishField checked={form.is_published} onChange={(is_published) => setForm({ ...form, is_published })} />
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="submit" disabled={saving} className={goldBtn}>{saving ? "Saqlanmoqda..." : "Saqlash"}</button>
              <button type="button" onClick={closeForm} className={ghostBtn}>Bekor qilish</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}

function ArticlesSection() {
  const [items, setItems] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ArticleRow | null>(null);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", is_published: false });
  const media = useMediaPicker();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setItems(rowsOf<ArticleRow>(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function closeForm() {
    setOpen(false);
    setEditing(null);
    media.reset();
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: "", excerpt: "", content: "", is_published: false });
    media.reset();
    setError("");
    setSuccess("");
    setOpen(true);
  }

  function openEdit(row: ArticleRow) {
    setEditing(row);
    setForm({
      title: row.title ?? "",
      excerpt: row.excerpt ?? "",
      content: row.content ?? "",
      is_published: Boolean(row.is_published),
    });
    media.reset();
    setError("");
    setSuccess("");
    setOpen(true);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Maqola sarlavhasini kiriting.");
      setSuccess("");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const image_url = await chosenImage(media, "articles", editing?.image_url ?? null);
      const payload = {
        title: form.title.trim(),
        excerpt: emptyToNull(form.excerpt),
        content: emptyToNull(form.content),
        image_url,
        is_published: form.is_published,
      };
      const result = editing
        ? await supabase.from("articles").update(payload).eq("id", editing.id)
        : await supabase.from("articles").insert(payload);
      if (result.error) throw new Error(result.error.message);
      setSuccess(editing ? "Maqola yangilandi." : "Maqola saqlandi.");
      closeForm();
      await load();
    } catch (err) {
      setError(errorText(err, "Maqolani saqlab bo'lmadi."));
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(row: ArticleRow) {
    setBusyId(row.id);
    setError("");
    setSuccess("");
    const next = !row.is_published;
    const { error: updateError } = await supabase.from("articles").update({ is_published: next }).eq("id", row.id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccess(next ? "Maqola nashrga chiqarildi." : "Maqola nashrdan olindi.");
    await load();
  }

  async function remove(row: ArticleRow) {
    if (!window.confirm(`"${row.title}" maqolasi o'chirilsinmi?`)) return;
    setError("");
    setSuccess("");
    const { error: deleteError } = await supabase.from("articles").delete().eq("id", row.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setSuccess("Maqola o'chirildi.");
    await load();
  }

  return (
    <section>
      <SectionHeading
        title="Maqolalar"
        text="Maqola yozing, tahrirlang, o'chiring va nashr holatini boshqaring."
        action={
          <button type="button" onClick={openCreate} className={goldBtn}>
            <Plus size={16} aria-hidden /> Maqola qo'shish
          </button>
        }
      />
      <Alerts error={error} success={success} />
      {loading ? <LoadingBlock /> : null}
      {!loading && items.length === 0 ? <EmptyState text="Hali maqolalar yo'q." /> : null}
      <div className="space-y-4">
        {items.map((row) => (
          <article key={row.id} className={cardClass}>
            <div className="flex flex-col gap-4 sm:flex-row">
              {row.image_url ? <img src={row.image_url} alt="" className="h-28 w-full rounded-xl object-cover sm:w-40" /> : null}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-xl text-white">{row.title}</h3>
                  <PublishBadge published={Boolean(row.is_published)} />
                </div>
                {row.excerpt ? <p className="mt-2 text-sm leading-6 text-slate-400">{row.excerpt}</p> : null}
                <p className="mt-2 text-xs text-slate-500">{formatWhen(row.created_at)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={busyId === row.id} onClick={() => void togglePublish(row)} className={goldBtn}>
                {busyId === row.id ? "Saqlanmoqda..." : row.is_published ? "Nashrdan olish" : "Nashrga chiqarish"}
              </button>
              <button type="button" onClick={() => openEdit(row)} className={ghostBtn}>
                <Pencil size={15} aria-hidden /> Tahrirlash
              </button>
              <button type="button" onClick={() => void remove(row)} className={dangerBtn}>
                <Trash2 size={15} aria-hidden /> O'chirish
              </button>
            </div>
          </article>
        ))}
      </div>
      {open ? (
        <Modal title={editing ? "Maqolani tahrirlash" : "Yangi maqola"} onClose={closeForm}>
          <form onSubmit={(event) => void save(event)} className="space-y-4">
            <label className="block">
              <span className={labelClass}>Sarlavha</span>
              <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Qisqa mazmun</span>
              <textarea rows={3} value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Matn</span>
              <textarea rows={8} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} className={fieldClass} />
            </label>
            <MediaFields
              label="Muqova"
              accept="image/*,video/*"
              file={media.file}
              preview={media.preview}
              currentUrl={editing?.image_url ?? null}
              clearImage={media.clearImage}
              remoteUrl={media.remoteUrl}
              video={Boolean(media.file?.type.startsWith("video/"))}
              onPick={media.pick}
              onClear={media.markClear}
              onRemote={media.setRemoteUrl}
            />
            <PublishField checked={form.is_published} onChange={(is_published) => setForm({ ...form, is_published })} />
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="submit" disabled={saving} className={goldBtn}>{saving ? "Saqlanmoqda..." : "Saqlash"}</button>
              <button type="button" onClick={closeForm} className={ghostBtn}>Bekor qilish</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}

function GallerySection() {
  const [items, setItems] = useState<GalleryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryRow | null>(null);
  const [form, setForm] = useState({ title: "", description: "", is_published: true });
  const media = useMediaPicker();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setItems(rowsOf<GalleryRow>(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function closeForm() {
    setOpen(false);
    setEditing(null);
    media.reset();
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: "", description: "", is_published: true });
    media.reset();
    setError("");
    setSuccess("");
    setOpen(true);
  }

  function openEdit(row: GalleryRow) {
    setEditing(row);
    setForm({ title: row.title ?? "", description: row.description ?? "", is_published: Boolean(row.is_published) });
    media.reset();
    setError("");
    setSuccess("");
    setOpen(true);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!media.file && !media.remoteUrl.trim() && !editing?.image_url) {
      setError("Rasm tanlang yoki https manzil kiriting.");
      setSuccess("");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const image_url = await chosenImage(media, "gallery", editing?.image_url ?? null);
      if (!image_url) throw new Error("Rasm tanlang yoki https manzil kiriting.");
      const payload = {
        title: emptyToNull(form.title) ?? "Lavha",
        description: emptyToNull(form.description),
        image_url,
        is_published: form.is_published,
      };
      const result = editing
        ? await supabase.from("gallery").update(payload).eq("id", editing.id)
        : await supabase.from("gallery").insert(payload);
      if (result.error) throw new Error(result.error.message);
      setSuccess(editing ? "Galereya yangilandi." : "Galereyaga yuklandi.");
      closeForm();
      await load();
    } catch (err) {
      setError(errorText(err, "Faylni yuklab bo'lmadi."));
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: GalleryRow) {
    if (!window.confirm("Bu media fayl galereyadan o'chirilsinmi?")) return;
    setError("");
    setSuccess("");
    const { error: deleteError } = await supabase.from("gallery").delete().eq("id", row.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setSuccess("Media o'chirildi.");
    await load();
  }

  return (
    <section>
      <SectionHeading
        title="Galereya"
        text="Rasm va videolarni yuklang, tavsifini tahrirlang yoki o'chiring."
        action={
          <button type="button" onClick={openCreate} className={goldBtn}>
            <Upload size={16} aria-hidden /> Media yuklash
          </button>
        }
      />
      <Alerts error={error} success={success} />
      {loading ? <LoadingBlock /> : null}
      {!loading && items.length === 0 ? <EmptyState text="Galereya hozircha bo'sh." /> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((row) => (
          <article key={row.id} className={cardClass}>
            {row.image_url ? (
              <MediaPreview url={row.image_url} alt={row.title ?? ""} className="mb-3 h-44 w-full rounded-xl bg-navy-950 object-cover" />
            ) : (
              <div className="mb-3 grid h-44 place-items-center rounded-xl bg-navy-950 text-sm text-slate-500">Media yo'q</div>
            )}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-lg text-white">{row.title || "Sarlavhasiz"}</h3>
              <PublishBadge published={Boolean(row.is_published)} />
            </div>
            {row.description ? <p className="mt-2 line-clamp-2 text-sm text-slate-400">{row.description}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => openEdit(row)} className={ghostBtn}>
                <Pencil size={15} aria-hidden /> Tahrirlash
              </button>
              <button type="button" onClick={() => void remove(row)} className={dangerBtn}>
                <Trash2 size={15} aria-hidden /> O'chirish
              </button>
            </div>
          </article>
        ))}
      </div>
      {open ? (
        <Modal title={editing ? "Lavhani tahrirlash" : "Galereyaga yuklash"} onClose={closeForm}>
          <form onSubmit={(event) => void save(event)} className="space-y-4">
            <label className="block">
              <span className={labelClass}>Sarlavha</span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Izoh</span>
              <textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={fieldClass} />
            </label>
            <MediaFields
              label="Rasm yoki video"
              accept="image/*,video/*"
              file={media.file}
              preview={media.preview}
              currentUrl={editing?.image_url ?? null}
              clearImage={media.clearImage}
              remoteUrl={media.remoteUrl}
              video={Boolean(media.file?.type.startsWith("video/"))}
              onPick={media.pick}
              onClear={media.markClear}
              onRemote={media.setRemoteUrl}
            />
            <PublishField checked={form.is_published} onChange={(is_published) => setForm({ ...form, is_published })} />
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="submit" disabled={saving} className={goldBtn}>{saving ? "Saqlanmoqda..." : editing ? "Saqlash" : "Yuklash"}</button>
              <button type="button" onClick={closeForm} className={ghostBtn}>Bekor qilish</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}

function OptionEditor({
  option,
  onChanged,
}: {
  option: OptionRow;
  onChanged: () => Promise<void>;
}) {
  const [text, setText] = useState(option.option_text);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setText(option.option_text);
  }, [option.id, option.option_text]);

  async function saveText() {
    if (!text.trim()) {
      setError("Variant matnini kiriting.");
      return;
    }
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase.from("test_options").update({ option_text: text.trim() }).eq("id", option.id);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await onChanged();
  }

  async function remove() {
    if (!window.confirm("Bu javob varianti o'chirilsinmi?")) return;
    setSaving(true);
    setError("");
    const { error: deleteError } = await supabase.from("test_options").delete().eq("id", option.id);
    setSaving(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await onChanged();
  }

  return (
    <div className={`rounded-xl border p-3 ${option.is_correct ? "border-gold-500/50 bg-gold-500/10" : "border-white/10 bg-navy-950/50"}`}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={text} onChange={(event) => setText(event.target.value)} className={fieldClass} aria-label="Javob varianti" />
        <div className="flex gap-2">
          <button type="button" disabled={saving} onClick={() => void saveText()} className={ghostBtn}>Saqlash</button>
          <button type="button" disabled={saving} onClick={() => void remove()} className={dangerBtn} aria-label="Variantni o'chirish">
            <Trash2 size={15} aria-hidden />
          </button>
        </div>
      </div>
      {option.is_correct ? <p className="mt-2 text-xs font-semibold text-gold-300">To'g'ri javob</p> : null}
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

function QuestionCard({
  question,
  options,
  onChanged,
}: {
  question: QuestionRow;
  options: OptionRow[];
  onChanged: () => Promise<void>;
}) {
  const [text, setText] = useState(question.question);
  const [optionText, setOptionText] = useState("");
  const [correct, setCorrect] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setText(question.question);
  }, [question.id, question.question]);

  async function saveQuestion() {
    if (!text.trim()) {
      setError("Savol matnini kiriting.");
      return;
    }
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase.from("test_questions").update({ question: text.trim() }).eq("id", question.id);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await onChanged();
  }

  async function removeQuestion() {
    if (!window.confirm("Savol va uning variantlari o'chirilsinmi?")) return;
    setSaving(true);
    setError("");
    const optionsResult = await supabase.from("test_options").delete().eq("question_id", question.id);
    if (optionsResult.error) {
      setSaving(false);
      setError(optionsResult.error.message);
      return;
    }
    const { error: deleteError } = await supabase.from("test_questions").delete().eq("id", question.id);
    setSaving(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    await onChanged();
  }

  async function markCorrect(optionId: string) {
    setSaving(true);
    setError("");
    const clearResult = await supabase.from("test_options").update({ is_correct: false }).eq("question_id", question.id);
    if (clearResult.error) {
      setSaving(false);
      setError(clearResult.error.message);
      return;
    }
    const { error: updateError } = await supabase.from("test_options").update({ is_correct: true }).eq("id", optionId);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await onChanged();
  }

  async function addOption(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!optionText.trim()) {
      setError("Variant matnini kiriting.");
      return;
    }
    setSaving(true);
    setError("");
    if (correct) {
      const clearResult = await supabase.from("test_options").update({ is_correct: false }).eq("question_id", question.id);
      if (clearResult.error) {
        setSaving(false);
        setError(clearResult.error.message);
        return;
      }
    }
    const { error: insertError } = await supabase.from("test_options").insert({
      question_id: question.id,
      option_text: optionText.trim(),
      is_correct: correct,
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setOptionText("");
    setCorrect(false);
    await onChanged();
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-navy-950/40 p-4">
      <label className="block">
        <span className={labelClass}>Savol</span>
        <textarea rows={3} value={text} onChange={(event) => setText(event.target.value)} className={fieldClass} />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={saving} onClick={() => void saveQuestion()} className={ghostBtn}>Savolni saqlash</button>
        <button type="button" disabled={saving} onClick={() => void removeQuestion()} className={dangerBtn}>
          <Trash2 size={15} aria-hidden /> Savolni o'chirish
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {options.length === 0 ? <p className="text-sm text-slate-500">Variantlar hali yo'q.</p> : null}
        {options.map((option) => (
          <div key={option.id} className="space-y-2">
            <OptionEditor option={option} onChanged={onChanged} />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={Boolean(option.is_correct)}
                onChange={() => void markCorrect(option.id)}
                className="accent-[#d4af37]"
              />
              To'g'ri javob qilib belgilash
            </label>
          </div>
        ))}
      </div>
      <form onSubmit={(event) => void addOption(event)} className="mt-4 space-y-3 border-t border-white/10 pt-4">
        <label className="block">
          <span className={labelClass}>Yangi variant</span>
          <input value={optionText} onChange={(event) => setOptionText(event.target.value)} className={fieldClass} />
        </label>
        <PublishField checked={correct} onChange={setCorrect} label="Bu variant to'g'ri javob" />
        <button type="submit" disabled={saving} className={goldBtn}>
          <Plus size={15} aria-hidden /> Variant qo'shish
        </button>
      </form>
      {error ? <p role="alert" className="mt-3 text-sm text-red-300">{error}</p> : null}
    </article>
  );
}

function TestsSection() {
  const [tests, setTests] = useState<TestRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [options, setOptions] = useState<OptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "", category: "", is_published: false });
  const [questionText, setQuestionText] = useState("");
  const testsRef = useRef(tests);
  testsRef.current = tests;

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from("tests").select("*").order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setTests(rowsOf<TestRow>(data));
    setLoading(false);
  }, []);

  const loadQuestions = useCallback(async (testId: string) => {
    setQuestionsLoading(true);
    const { data, error: loadError } = await supabase
      .from("test_questions")
      .select("*")
      .eq("test_id", testId)
      .order("created_at", { ascending: true });
    if (loadError) {
      setError(loadError.message);
      setQuestionsLoading(false);
      return;
    }
    const nextQuestions = rowsOf<QuestionRow>(data);
    setQuestions(nextQuestions);
    const ids = nextQuestions.map((question) => question.id);
    if (ids.length === 0) {
      setOptions([]);
      setQuestionsLoading(false);
      return;
    }
    const optionsResult = await supabase.from("test_options").select("id,question_id,option_text,is_correct").in("question_id", ids).order("id", { ascending: true });
    if (optionsResult.error) setError(optionsResult.error.message);
    else setOptions(rowsOf<OptionRow>(optionsResult.data));
    setQuestionsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) return;
    const current = testsRef.current.find((test) => test.id === selectedId);
    if (current) {
      setDraft({
        title: current.title ?? "",
        description: current.description ?? "",
        category: current.category ?? "",
        is_published: Boolean(current.is_published),
      });
    }
    void loadQuestions(selectedId);
  }, [selectedId, loadQuestions]);

  function startCreate() {
    setCreating(true);
    setSelectedId(null);
    setQuestions([]);
    setOptions([]);
    setQuestionText("");
    setDraft({ title: "", description: "", category: "", is_published: false });
    setError("");
    setSuccess("");
  }

  function choose(id: string) {
    setCreating(false);
    setSelectedId(id);
    setQuestionText("");
    setError("");
    setSuccess("");
  }

  async function saveTest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError("Test nomini kiriting.");
      setSuccess("");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    const payload = {
      title: draft.title.trim(),
      description: emptyToNull(draft.description),
      category: emptyToNull(draft.category),
      is_published: draft.is_published,
    };
    if (creating || !selectedId) {
      const { data, error: insertError } = await supabase.from("tests").insert(payload).select("*").single();
      setSaving(false);
      if (insertError || !data) {
        setError(insertError?.message || "Test saqlanmadi.");
        return;
      }
      const created = data as TestRow;
      setSuccess("Test qo'shildi. Endi savollarni kiriting.");
      setCreating(false);
      setSelectedId(created.id);
      await load();
      return;
    }
    const { error: updateError } = await supabase.from("tests").update(payload).eq("id", selectedId);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccess("Test yangilandi.");
    await load();
  }

  async function removeTest() {
    if (!selectedId) return;
    if (!window.confirm("Test, savollari va javob variantlari o'chirilsinmi?")) return;
    setSaving(true);
    setError("");
    setSuccess("");
    const { data, error: questionsError } = await supabase.from("test_questions").select("id").eq("test_id", selectedId);
    if (questionsError) {
      setSaving(false);
      setError(questionsError.message);
      return;
    }
    const ids = rowsOf<{ id: string }>(data).map((question) => question.id);
    if (ids.length > 0) {
      const optionsResult = await supabase.from("test_options").delete().in("question_id", ids);
      if (optionsResult.error) {
        setSaving(false);
        setError(optionsResult.error.message);
        return;
      }
      const questionsResult = await supabase.from("test_questions").delete().eq("test_id", selectedId);
      if (questionsResult.error) {
        setSaving(false);
        setError(questionsResult.error.message);
        return;
      }
    }
    const { error: deleteError } = await supabase.from("tests").delete().eq("id", selectedId);
    setSaving(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setSelectedId(null);
    setQuestions([]);
    setOptions([]);
    setSuccess("Test o'chirildi.");
    await load();
  }

  async function addQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) return;
    if (!questionText.trim()) {
      setError("Savol matnini kiriting.");
      setSuccess("");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    const { error: insertError } = await supabase.from("test_questions").insert({
      test_id: selectedId,
      question: questionText.trim(),
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setQuestionText("");
    setSuccess("Savol qo'shildi.");
    await loadQuestions(selectedId);
  }

  const selected = tests.find((test) => test.id === selectedId) ?? null;
  const showEditor = creating || Boolean(selected);

  return (
    <section>
      <SectionHeading
        title="Testlar"
        text="Test, savol va javob variantlarini qo'shing, tahrirlang va o'chiring."
        action={
          <button type="button" onClick={startCreate} className={goldBtn}>
            <Plus size={16} aria-hidden /> Yangi test
          </button>
        }
      />
      <Alerts error={error} success={success} />
      {loading ? <LoadingBlock /> : null}
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-2">
          {!loading && tests.length === 0 ? <EmptyState text="Hali testlar yo'q." /> : null}
          {tests.map((test) => (
            <button
              key={test.id}
              type="button"
              onClick={() => choose(test.id)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                selectedId === test.id ? "border-gold-500 bg-gold-500/10" : "border-white/10 bg-navy-900/70 hover:border-gold-500/40"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-white">{test.title}</span>
                <PublishBadge published={Boolean(test.is_published)} />
              </span>
              <span className="mt-1 block truncate text-xs text-slate-400">{test.category || "Kategoriyasiz"}</span>
            </button>
          ))}
        </div>
        <div>
          {!showEditor ? <EmptyState text="Chapdan testni tanlang yoki yangi test yarating." /> : null}
          {showEditor ? (
            <form onSubmit={(event) => void saveTest(event)} className={`${cardClass} space-y-4`}>
              <label className="block">
                <span className={labelClass}>Test nomi</span>
                <input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className={fieldClass} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Kategoriya</span>
                  <input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className={fieldClass} />
                </label>
                <div className="flex items-end">
                  <PublishField checked={draft.is_published} onChange={(is_published) => setDraft({ ...draft, is_published })} />
                </div>
              </div>
              <label className="block">
                <span className={labelClass}>Tavsif</span>
                <textarea rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className={fieldClass} />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={saving} className={goldBtn}>{saving ? "Saqlanmoqda..." : creating ? "Testni yaratish" : "Testni saqlash"}</button>
                {selected ? (
                  <button type="button" disabled={saving} onClick={() => void removeTest()} className={dangerBtn}>
                    <Trash2 size={15} aria-hidden /> Testni o'chirish
                  </button>
                ) : null}
              </div>
            </form>
          ) : null}
          {selected ? (
            <div className="mt-5 space-y-4">
              <form onSubmit={(event) => void addQuestion(event)} className={`${cardClass} space-y-3`}>
                <label className="block">
                  <span className={labelClass}>Yangi savol</span>
                  <textarea rows={3} value={questionText} onChange={(event) => setQuestionText(event.target.value)} className={fieldClass} />
                </label>
                <button type="submit" disabled={saving} className={goldBtn}>
                  <Plus size={15} aria-hidden /> Savol qo'shish
                </button>
              </form>
              {questionsLoading ? <LoadingBlock label="Savollar yuklanmoqda..." /> : null}
              {!questionsLoading && questions.length === 0 ? <EmptyState text="Bu testda hali savol yo'q." /> : null}
              {questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  options={options.filter((option) => option.question_id === question.id)}
                  onChanged={async () => {
                    await loadQuestions(selected.id);
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ProfileSection({ email, busy, error, onLogout }: { email: string; busy: boolean; error: string; onLogout: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function savePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (password.length < 6) {
      setMessage("Parol kamida 6 ta belgidan iborat bo'lsin.");
      return;
    }
    if (password !== confirm) {
      setMessage("Parollar bir xil emas.");
      return;
    }
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setMessage(updateError.message);
      return;
    }
    setPassword("");
    setConfirm("");
    setMessage("Parol yangilandi.");
  }

  return (
    <section className="mx-auto max-w-lg space-y-5">
      <div className="rounded-2xl border border-gold-500/20 bg-navy-900/80 p-6 sm:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold-500 text-navy-950">
          <UserRound size={22} aria-hidden />
        </div>
        <h2 className="mt-4 font-serif text-3xl text-white">Profil</h2>
        <p className="mt-3 text-sm text-slate-400">Kirgan hisob</p>
        <p className="mt-1 break-all text-white">{email || "Email ko'rinmayapti"}</p>
      </div>
      <form onSubmit={(event) => void savePassword(event)} className={`${cardClass} space-y-4`}>
        <h3 className="font-serif text-xl text-white">Parolni yangilash</h3>
        <label className="block">
          <span className={labelClass}>Yangi parol</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={6} className={fieldClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Parolni takrorlang</span>
          <input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" minLength={6} className={fieldClass} />
        </label>
        {message ? <p role="status" className="text-sm text-gold-300">{message}</p> : null}
        <button type="submit" disabled={saving} className={goldBtn}>{saving ? "Saqlanmoqda..." : "Parolni saqlash"}</button>
      </form>
      <div className="rounded-2xl border border-white/10 bg-navy-900/80 p-6">
        <h3 className="font-serif text-xl text-white">Chiqish</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">Chiqish joriy admin sessiyasini tugatadi.</p>
        {error ? <p role="alert" className="mt-3 text-sm text-red-300">{error}</p> : null}
        <button type="button" onClick={onLogout} disabled={busy} className={`${goldBtn} mt-4`}>
          <LogOut size={16} aria-hidden />
          {busy ? "Chiqilmoqda..." : "Xavfsiz chiqish"}
        </button>
      </div>
    </section>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [section, setSection] = useState<SectionId>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || data?.role !== "admin") {
        await clearServerSession();
        router.replace("/");
        return;
      }

      await syncServerSession();
      setIsAdmin(true);
      setLoading(false);
    }

    void checkAdmin();
  }, [router]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  async function handleLogout() {
    setSigningOut(true);
    setLogoutError("");
    await clearServerSession();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setLogoutError(error.message);
      setSigningOut(false);
      return;
    }
    router.replace("/admin/login");
  }

  if (loading) {
    return <div className="bg-navy-950 p-10 text-center text-slate-300">Tekshirilmoqda...</div>;
  }

  if (!isAdmin) return null;

  const current = NAV.find((item) => item.id === section) ?? NAV[0];

  return (
    <div className="flex bg-navy-950 text-slate-200">
      {menuOpen ? (
        <button type="button" aria-label="Menyuni yopish" className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMenuOpen(false)} />
      ) : null}
      <aside
        className={`fixed bottom-0 left-0 top-16 z-40 flex w-72 flex-col overflow-y-auto border-r border-white/10 bg-navy-900 transition-transform duration-200 lg:sticky lg:bottom-auto lg:z-auto lg:h-[calc(100vh-4rem)] lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">QDU</p>
          <p className="mt-1 font-serif text-xl text-white">Street Law Club</p>
          <p className="mt-2 truncate text-xs text-slate-400">{email}</p>
        </div>
        <nav aria-label="Admin menyu" className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSection(item.id);
                  setMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  active ? "bg-gold-500 text-navy-950" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={18} aria-hidden />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="sticky top-16 z-20 flex items-center gap-3 border-b border-white/10 bg-navy-950/95 px-4 py-3 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setMenuOpen(true)} className="grid h-11 w-11 place-items-center rounded-lg text-white hover:bg-white/10" aria-label="Admin menyusini ochish">
            <Menu size={20} aria-hidden />
          </button>
          <p className="truncate font-medium text-white">{current.label}</p>
        </div>
        <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {section === "dashboard" ? <DashboardSection onOpen={setSection} /> : null}
          {section === "team" ? <TeamSection /> : null}
          {section === "applications" ? <ApplicationsSection /> : null}
          {section === "events" ? <EventsSection /> : null}
          {section === "articles" ? <ArticlesSection /> : null}
          {section === "gallery" ? <GallerySection /> : null}
          {section === "tests" ? <TestsSection /> : null}
          {section === "profile" ? <ProfileSection email={email} busy={signingOut} error={logoutError} onLogout={() => void handleLogout()} /> : null}
        </div>
      </div>
    </div>
  );
}
