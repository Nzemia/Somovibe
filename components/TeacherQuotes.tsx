"use client";

import { useState, useEffect } from "react";

const QUOTES = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Tr. Mualuko" },
  { text: "The mediocre teacher tells. The good teacher explains. The superior teacher demonstrates. The great teacher inspires.", author: "Tr. Mueni" },
  { text: "In learning you will teach, and in teaching you will learn.", author: "Tr. Mucheru" },
  { text: "The art of teaching is the art of assisting discovery.", author: "Tr. Shanyisa" },
  { text: "It is the supreme art of the teacher to awaken joy in creative expression and knowledge.", author: "Tr. Mueni" },
  { text: "One child, one teacher, one book, one pen can change the world.", author: "Tr. Ngure" },
  { text: "The best teachers are those who show you where to look, but don't tell you what to see.", author: "Tr. Wanjiru" },
  { text: "Teaching is the one profession that creates all other professions.", author: "Tr. Mucheru" },
  { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "Tr. Mwende" },
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
      }, 400); 
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
