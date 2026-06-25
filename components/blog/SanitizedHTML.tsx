"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

interface SanitizedHTMLProps {
  html: string;
}

export function SanitizedHTML({ html }: { html: string }) {
  const [sanitizedHtml, setSanitizedHtml] = useState(html);

  useEffect(() => {
    // Sanitize client-side once window/document is available
    if (typeof window !== "undefined") {
      setSanitizedHtml(DOMPurify.sanitize(html));
    }
  }, [html]);

  return (
    <div
      className="blog-content font-medium text-gray-800"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
