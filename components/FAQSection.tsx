"use client";

import { useState, useRef } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I become a teacher on Somovibe?",
    answer:
      "Simply click 'Become a Teacher', complete the registration form, and pay the one-time KES 100 verification fee via M-Pesa. Once verified, you can start uploading and selling your CBC teaching materials immediately.",
  },
  {
    question: "How much can I earn as a teacher?",
    answer:
      "You earn 75% commission on every sale — one of the highest rates in the industry. There is no cap on your earnings. The more quality materials you upload and the more you promote your profile, the more you earn. Many teachers on Somovibe earn over KES 10,000 per month.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We support M-Pesa STK Push, making payments instant and secure for all users in Kenya. Simply enter your M-Pesa phone number and confirm the prompt on your phone — no card details required.",
  },
  {
    question: "Are all materials CBC-aligned?",
    answer:
      "Yes. Every material submitted is reviewed against the CBC curriculum framework before being published. Our verification process ensures that content is accurate, grade-appropriate, and aligned with Kenya's 8-4-4 successor curriculum.",
  },
  {
    question: "How do I access materials I've purchased?",
    answer:
      "After a successful M-Pesa payment, your materials are instantly available for download from your student dashboard under 'My Downloads'. You can download them at any time — there are no expiry limits.",
  },
  {
    question: "Can I sell materials for any grade level?",
    answer:
      "Absolutely. Teachers can upload materials for all CBC levels — from Pre-Primary (PP1 & PP2) through Lower Primary (Grades 1–3), Upper Primary (Grades 4–6), and Junior Secondary (Grades 7–9).",
  },
];

function FAQItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`border border-[#d1e8dc] rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? "shadow-md border-[#008c43]" : "hover:border-[#008c43]/40"}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left bg-white hover:bg-[#f9fefb] transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
          {item.question}
        </span>
        <span
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen ? "bg-[#008c43] text-white rotate-45" : "bg-[#f0faf5] text-[#008c43]"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>

      <div
        ref={bodyRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "500px" : "0px" }}
      >
        <div className="px-5 sm:px-6 pb-5 bg-white border-t border-[#d1e8dc]">
          <p className="pt-4 text-gray-600 text-sm sm:text-base leading-relaxed">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block bg-[#f0faf5] text-[#008c43] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-[#d1e8dc] mb-4">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
            Everything you need to know about Somovibe. Can&apos;t find your answer?{" "}
            <a href="/contact" className="text-[#008c43] font-semibold hover:underline">
              Contact us
            </a>
            .
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              item={faq}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
