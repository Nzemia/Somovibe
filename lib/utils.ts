import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email || "***";
  const [username, domain] = email.split("@");
  if (!username || !domain) return email;
  if (username.length <= 3) {
    return `${username[0]}***@${domain}`;
  }
  const visibleStart = username.slice(0, 3);
  const visibleEnd = username.slice(-2);
  return `${visibleStart}***${visibleEnd}@${domain}`;
}

export function getAverageRating(reviews: { rating: number }[]): number {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
}
