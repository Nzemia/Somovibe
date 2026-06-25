"use client";

import { useEffect } from "react";

interface ViewsCounterProps {
  slug: string;
}

export function ViewsCounter({ slug }: ViewsCounterProps) {
  useEffect(() => {
    // Fire-and-forget view count increment on client-side component mount
    fetch(`/api/blog/${slug}/view`, {
      method: "POST",
    }).catch((err) => {
      console.error("Failed to increment views:", err);
    });
  }, [slug]);

  return null; // Side-effect only, renders nothing
}
