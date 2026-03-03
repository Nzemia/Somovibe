"use client";

import { useState, useEffect } from "react";

const QUOTES = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The mediocre teacher tells. The good teacher explains. The superior teacher demonstrates. The great teacher inspires.", author: "William Arthur Ward" },
  { text: "In learning you will teach, and in teaching you will learn.", author: "Phil Collins" },
  { text: "The art of teaching is the art of assisting discovery.", author: "Mark Van Doren" },
  { text: "It is the supreme art of the teacher to awaken joy in creative expression and knowledge.", author: "Albert Einstein" },
  { text: "One child, one teacher, one book, one pen can change the world.", author: "Malala Yousafzai" },
  { text: "The best teachers are those who show you where to look, but don't tell you what to see.", author: "Alexandra K. Trenfor" },
  { text: "Teaching is the one profession that creates all other professions.", author: "Unknown" },
  { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats" },
  { text: "To teach is to touch a life forever.", author: "Unknown" },
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
