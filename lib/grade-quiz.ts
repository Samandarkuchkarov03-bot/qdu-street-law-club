"use server";

import { createServerSupabase } from "@/lib/supabase-server";

export type QuizAnswerResult = { questionId: string; correct: boolean };

export type GradeResult =
  | { ok: true; score: number; total: number; results: QuizAnswerResult[] }
  | { ok: false; error: string };

type Answer = { questionId: string; optionId: string };

const UUID = /^[0-9a-f-]{36}$/i;

function missingFunction(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "PGRST202" || /could not find the function/i.test(error.message ?? "");
}

function readResults(value: unknown): QuizAnswerResult[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as { questionId?: unknown; correct?: unknown };
    if (typeof row.questionId !== "string" || typeof row.correct !== "boolean") return [];
    return [{ questionId: row.questionId, correct: row.correct }];
  });
}

function asGrade(value: unknown): GradeResult | null {
  if (!value || typeof value !== "object") return null;
  const row = value as { ok?: unknown; score?: unknown; total?: unknown; results?: unknown; error?: unknown };
  if (row.ok === false) return { ok: false, error: typeof row.error === "string" ? row.error : "Testni baholab bo'lmadi." };
  if (row.ok !== true || typeof row.score !== "number" || typeof row.total !== "number") return null;
  return { ok: true, score: row.score, total: row.total, results: readResults(row.results) };
}

async function gradeFromTable(testId: string, answers: Answer[]): Promise<GradeResult> {
  const supabase = createServerSupabase();
  const { data: test, error: testError } = await supabase.from("tests").select("id,is_published").eq("id", testId).maybeSingle();
  if (testError || !test?.is_published) return { ok: false, error: "Test topilmadi yoki nashr qilinmagan." };

  const { data: questions, error: questionsError } = await supabase.from("test_questions").select("id").eq("test_id", testId);
  if (questionsError) return { ok: false, error: "Savollarni tekshirib bo'lmadi." };
  const questionIds = (questions ?? []).map((question) => question.id as string);
  if (questionIds.length === 0) return { ok: false, error: "Bu testda savol yo'q." };
  if (answers.length !== questionIds.length) return { ok: false, error: "Barcha savollarga javob bering." };

  const picked = new Map<string, string>();
  const seenOptions = new Set<string>();
  for (const answer of answers) {
    if (!questionIds.includes(answer.questionId)) return { ok: false, error: "Savol bu testga tegishli emas." };
    if (picked.has(answer.questionId)) return { ok: false, error: "Bir savolga faqat bitta javob yuboring." };
    if (seenOptions.has(answer.optionId)) return { ok: false, error: "Bir variantni qayta yuborib bo'lmaydi." };
    picked.set(answer.questionId, answer.optionId);
    seenOptions.add(answer.optionId);
  }
  if (questionIds.some((id) => !picked.has(id))) return { ok: false, error: "Barcha savollarga javob bering." };

  const { data: options, error: optionsError } = await supabase.from("test_options").select("id,question_id,is_correct").in("question_id", questionIds);
  if (optionsError) {
    if (optionsError.code === "42501" || /permission denied|is_correct/i.test(optionsError.message)) {
      return { ok: false, error: "Testni baholash funksiyasi o'rnatilmagan. SQL migratsiyasini ishga tushiring." };
    }
    return { ok: false, error: "Javoblarni tekshirib bo'lmadi." };
  }

  const correctByQuestion = new Map<string, string[]>();
  const optionQuestion = new Map<string, string>();
  for (const option of options ?? []) {
    const questionId = option.question_id as string;
    optionQuestion.set(option.id as string, questionId);
    if (option.is_correct) {
      const list = correctByQuestion.get(questionId) ?? [];
      list.push(option.id as string);
      correctByQuestion.set(questionId, list);
    }
  }

  let score = 0;
  const results: QuizAnswerResult[] = [];
  for (const questionId of questionIds) {
    const choice = picked.get(questionId);
    if (!choice || optionQuestion.get(choice) !== questionId) return { ok: false, error: "Tanlangan variant topilmadi." };
    const correct = (correctByQuestion.get(questionId) ?? []).includes(choice);
    if (correct) score += 1;
    results.push({ questionId, correct });
  }

  return { ok: true, score, total: questionIds.length, results };
}

export async function gradeQuiz(testId: string, answers: Answer[]): Promise<GradeResult> {
  if (!UUID.test(testId) || !Array.isArray(answers) || answers.length > 100) {
    return { ok: false, error: "Test javoblari noto'g'ri yuborildi." };
  }
  if (answers.some((answer) => !answer || !UUID.test(answer.questionId) || !UUID.test(answer.optionId))) {
    return { ok: false, error: "Javob identifikatori noto'g'ri." };
  }
  const questionIds = new Set<string>();
  const optionIds = new Set<string>();
  for (const answer of answers) {
    if (questionIds.has(answer.questionId)) return { ok: false, error: "Bir savolga faqat bitta javob yuboring." };
    if (optionIds.has(answer.optionId)) return { ok: false, error: "Bir variantni qayta yuborib bo'lmaydi." };
    questionIds.add(answer.questionId);
    optionIds.add(answer.optionId);
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase.rpc("grade_published_test", {
    p_test_id: testId,
    p_answers: answers,
  });
  if (!error) {
    const graded = asGrade(data);
    if (graded) return graded;
    return { ok: false, error: "Test natijasini o'qib bo'lmadi." };
  }
  if (missingFunction(error)) return gradeFromTable(testId, answers);
  return { ok: false, error: "Testni baholab bo'lmadi." };
}
