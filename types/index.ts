export type Member = {
  id: string;
  fullName: string;
  position: string;
  bio: string;
  photo?: string;
};

export type ClubEvent = {
  id: string;
  title: string;
  summary: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  imageUrl?: string;
  video?: boolean;
  status: "upcoming" | "past" | "undated";
};

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  video?: boolean;
  createdLabel: string;
  readMinutes: number;
};

export type GalleryItem = {
  id: string;
  title: string;
  caption: string;
  src?: string;
  video?: boolean;
};

export type QuizOption = { id: string; text: string };
export type QuizQuestion = { id: string; q: string; options: QuizOption[] };
export type Quiz = { id: string; title: string; description: string; category: string; questions: QuizQuestion[] };

export type ApplicationInput = {
  firstName: string;
  lastName: string;
  faculty: string;
  course: number;
  contact: string;
  email: string;
  motivation: string;
  company?: string;
};

export type ContactInput = { name: string; email: string; message: string };
