"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const stats: Stat[] = [
  {
    value: 500,
    suffix: "+",
    label: "Verified Teachers",
    description: "Educators sharing their best CBC materials",
    color: "from-[#008c43] to-[#00b856]",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    value: 10000,
    suffix: "+",
    label: "Learning Materials",
    description: "Notes, past papers & study guides",
    color: "from-[#006832] to-[#008c43]",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    value: 50000,
    suffix: "+",
    label: "Happy Students",
    description: "Learners improving their CBC grades",
    color: "from-[#004d25] to-[#006832]",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: 2,
    suffix: "M+ KES",
    label: "Earned by Teachers",
    description: "Total teacher earnings through Somovibe",
    color: "from-[#00b856] to-[#00d468]",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function AnimatedCounter({
  value,
  suffix,
  duration = 1800,
  active,
}: {
  value: number;
  suffix: string;
  duration?: number;
  active: boolean;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    startRef.current = 0;

    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(value);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, value, duration]);

  const formatted =
    value >= 10000
      ? `${(display / 1000).toFixed(display >= value ? 0 : 1)}K`
      : display.toLocaleString();

  return (
    <span className="tabular-nums">
      {value >= 10000 ? formatted : display.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [animated, setAnimated] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated) {
          setVisible(true);
          setAnimated(true);
        }
      },
      { threshold: 0.25 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [animated]);

  return (
    <section
      ref={sectionRef}
      className="bg-white py-14 sm:py-20 border-b border-[#e0f2ea]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block bg-[#f0faf5] text-[#008c43] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-[#d1e8dc]">
            By the Numbers
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">
            Trusted by Kenya&apos;s Educators & Learners
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-6 sm:p-8 text-white transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl`}
              style={{
                transitionDelay: `${i * 80}ms`,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms`,
              }}
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/20 mb-4">
                {stat.icon}
              </div>

              {/* Number */}
              <div className="text-3xl sm:text-4xl font-extrabold leading-none mb-1">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  active={animated}
                  duration={1600 + i * 150}
                />
              </div>

              {/* Label */}
              <div className="font-bold text-sm sm:text-base mb-1">{stat.label}</div>

              {/* Description */}
              <p className="text-white/70 text-xs sm:text-sm leading-snug">
                {stat.description}
              </p>

              {/* Decorative circle */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
