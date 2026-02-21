"use client";

import { useState, useEffect } from "react";

const QUOTES = [
  { text: "Your knowledge doesn't expire. Every note you've written is an asset that can earn for you forever.", author: "Somovibe" },
  { text: "The best teachers don't just change classrooms — they change lives across the entire country.", author: "Educator's Creed" },
  { text: "Upload once. Earn while you sleep. Your expertise deserves more than a monthly salary.", author: "Somovibe" },
  { text: "A teacher's impact never stops. Neither should their income.", author: "Somovibe" },
  { text: "You've spent years building knowledge. It's time that knowledge started building your wealth.", author: "Somovibe" },
  { text: "Every CBC note you share is a student somewhere finally understanding what clicked for them.", author: "Somovibe" },
  { text: "Teaching is not just a profession. It is a calling — and callings deserve compensation.", author: "Educator's Creed" },
  { text: "The notes you wrote last night could be earning you money every morning.", author: "Somovibe" },
];

export function TeacherQuotes() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 400); // fade out → swap → fade in
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const q = QUOTES[index];

  return (
    <div
      className="transition-opacity duration-400"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <p className="text-white text-base sm:text-lg font-semibold leading-snug mb-1">
        &ldquo;{q.text}&rdquo;
      </p>
      <p className="text-white/50 text-xs font-medium">— {q.author}</p>
    </div>
  );
}
