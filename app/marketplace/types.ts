// Shared types for marketplace components

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  repliedAt: Date | string | null;
  createdAt: Date | string;
  userId: string;
  user: { name?: string | null; email: string };
};
