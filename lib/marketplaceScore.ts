/**
 * Marketplace Ranking Score
 *
 * Computes a composite score for ranking materials in the marketplace.
 * Balances popularity, quality, freshness, and trust signals.
 *
 * Score = (salesWeight × sales)
 *       + (viewWeight × views)
 *       + (ratingWeight × avgRating × reviewCount)
 *       + (recencyBoost)   — exponential decay, half-life ~14 days
 *       + (verifiedBonus)  — flat bonus for verified teachers
 */

const SALES_WEIGHT = 5.0;
const VIEW_WEIGHT = 0.5;
const RATING_WEIGHT = 3.0;
const RECENCY_HALF_LIFE_DAYS = 14;
const RECENCY_MAX_BOOST = 20;
const VERIFIED_BONUS = 10;

export type ScoredMaterial = {
  createdAt: Date | string;
  _count: { purchases: number; materialViews?: number };
  reviews: { rating: number }[];
  teacher: {
    teacherProfile?: { isActive: boolean } | null;
    [key: string]: unknown;
  };
};

/**
 * Compute a ranking score for a single material.
 * Higher = better ranking.
 */
export function computeScore(material: ScoredMaterial): number {
  const sales = material._count.purchases;
  const views = material._count.materialViews ?? 0;
  const reviews = material.reviews;

  // Average rating (0 if no reviews)
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // Recency: exponential decay from creation date
  const ageMs = Date.now() - new Date(material.createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const recencyBoost =
    RECENCY_MAX_BOOST * Math.exp((-ageDays * Math.LN2) / RECENCY_HALF_LIFE_DAYS);

  // Verified teacher bonus
  const isVerified = !!material.teacher?.teacherProfile?.isActive;
  const verifiedBonus = isVerified ? VERIFIED_BONUS : 0;

  return (
    SALES_WEIGHT * sales +
    VIEW_WEIGHT * views +
    RATING_WEIGHT * avgRating * reviews.length +
    recencyBoost +
    verifiedBonus
  );
}
