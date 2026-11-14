"use server";

import { createServerSupabase } from "@/lib/supabase-server";

export type GradeResult =
  | { ok: true; score: number; total: number; correctOptionIds: string[] }
  | { ok: false; error: string };

type Answer = { questionId: string; optionId: string };

const UUID = /^[0-9a-f-]{36}$/i;

export async function gradeQuiz(testId: string, answers: Answer[]): Promise<GradeResult> {
  if (!UUID.test(testId) || !Array.isArray(answers) || answers.length > 100) {
    return { ok: false, error: "Test javoblari noto'g'ri yuborildi." };
  }
  if (answers.some((answer) => !UUID.test(answer.questionId) || !UUID.test(answer.optionId))) {
    return { ok: false, error: "Javob identifikatori noto'g'ri." };
  }

  const supabase = createServerSupabase();
  const { data: test, error: testError } = await supabase.from("tests").select("id,is_published").eq("id", testId).maybeSingle();
  if (testError || !test?.is_published) return { ok: false, error: "Test topilmadi yoki nashr qilinmagan." };

  const { data: questions, error: questionsError } = await supabase.from("test_questions").select("id").eq("test_id", testId);
  if (questionsError) return { ok: false, error: "Savollarni tekshirib bo'lmadi." };
  const questionIds = (questions ?? []).map((question) => question.id as string);
  if (questionIds.length === 0) return { ok: false, error: "Bu testda savol yo'q." };

  const picked = new Map<string, string>();
  for (const answer of answers) {
    if (!questionIds.includes(answer.questionId)) return { ok: false, error: "Savol bu testga tegishli emas." };
    picked.set(answer.questionId, answer.optionId);
  }
  if (questionIds.some((id) => !picked.has(id))) return { ok: false, error: "Barcha savollarga javob bering." };

  const { data: options, error: optionsError } = await supabase.from("test_options").select("id,question_id,is_correct").in("question_id", questionIds);
  if (optionsError) return { ok: false, error: "Javoblarni tekshirib bo'lmadi." };

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
  const correctOptionIds: string[] = [];
  for (const questionId of questionIds) {
    const correct = correctByQuestion.get(questionId) ?? [];
    correctOptionIds.push(...correct);
    const choice = picked.get(questionId);
    if (!choice || optionQuestion.get(choice) !== questionId) return { ok: false, error: "Tanlangan variant topilmadi." };
    if (correct.includes(choice)) score += 1;
  }

  return { ok: true, score, total: questionIds.length, correctOptionIds };
}
