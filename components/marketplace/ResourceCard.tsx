import React from "react";
import Image from "next/image";
import PurchaseButton from "@/app/marketplace/PurchaseButton";

type Teacher = {
  email: string;
  // Optional verified flag if present in the model
  verified?: boolean | null;
};

type Resource = {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  price: number;
  createdAt?: Date | string;
  teacher: Teacher;
};

type ResourceCardProps = {
  resource: Resource;
  isPurchased: boolean;
  user: { id: string; email: string; phone: string | null } | null;
};

/**
 * Maps subject names to image filenames in /Images folder
 */
function getThumbnailImage(subject: string): string {
  const subjectLower = subject.toLowerCase().trim();
  
  // Map subjects to image filenames
  if (subjectLower.includes("english")) {
    return "/Images/English.jpg";
  }
  if (subjectLower.includes("math") || subjectLower.includes("mathematics")) {
    return "/Images/maths.jpg";
  }
  if (subjectLower.includes("social")) {
    return "/Images/social studies.jpg";
  }
  
  // Default fallback
  return "/Images/teacher.jpg";
}

export function ResourceCard({ resource, isPurchased, user }: ResourceCardProps) {
  const rating = 4.6;
  const downloads = 1200;
  const updatedLabel = resource.createdAt ? "Recently updated" : "Recently updated";
  const verified =
    (resource.teacher as Teacher & { verified?: boolean | null }).verified ?? false;

  const teacherName = resource.teacher.email.split("@")[0];
  const thumbnailSrc = getThumbnailImage(resource.subject);

  return (
    <article className="group flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-transform transition-shadow duration-150 h-full">
      {/* Thumbnail */}
      <div className="relative h-28 w-full overflow-hidden bg-slate-100">
        <Image
          src={thumbnailSrc}
          alt={`${resource.subject} - ${resource.title}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-3 pt-2.5 pb-3">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
            {resource.subject}
          </span>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 border border-indigo-200">
            {resource.grade}
          </span>
          {verified && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
              <svg
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9.99992 2.5L4.16659 5.20833V9.99999C4.16659 13.5417 6.63325 16.8667 9.99992 17.5C13.3666 16.8667 15.8333 13.5417 15.8333 9.99999V5.20833L9.99992 2.5Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.5 9.99999L9.16667 11.6667L12.5 8.33333"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Verified</span>
            </span>
          )}
          {isPurchased && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
              Purchased
            </span>
          )}
        </div>

        {/* Title & description */}
        <h3 className="text-sm font-semibold text-slate-900 leading-tight line-clamp-1 mb-1">
          {resource.title}
        </h3>
        <p className="text-xs text-slate-600 line-clamp-2 mb-2 min-h-[2rem]">
          {resource.description}
        </p>

        {/* Meta - Compact single line */}
        <div className="mt-auto flex items-center gap-1.5 text-[10px] text-slate-500 mb-2">
          <span className="inline-flex items-center gap-0.5">
            <span aria-hidden="true">⭐</span>
            <span>{rating.toFixed(1)}</span>
          </span>
          <span>•</span>
          <span>{downloads > 999 ? `${(downloads / 1000).toFixed(1)}k` : downloads}</span>
        </div>

        {/* Price & actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <span className="text-sm font-semibold text-slate-900">
            KES {resource.price}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Preview
            </button>
            <PurchaseButton
              pdfId={resource.id}
              title={resource.title}
              price={resource.price}
              isPurchased={isPurchased}
              user={user}
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

