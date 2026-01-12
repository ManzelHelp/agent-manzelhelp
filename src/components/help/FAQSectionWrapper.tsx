"use client";

import FAQSection from "./FAQSection";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  icon: React.ReactNode;
  title: string;
  questions: FAQItem[];
}

interface FAQSectionWrapperProps {
  faqTitle: string;
  categories: FAQCategory[];
}

export default function FAQSectionWrapper({
  faqTitle,
  categories,
}: FAQSectionWrapperProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
            {faqTitle}
          </h2>
          <div className="w-20 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
        </div>

        <FAQSection categories={categories} />
      </div>
    </section>
  );
}
