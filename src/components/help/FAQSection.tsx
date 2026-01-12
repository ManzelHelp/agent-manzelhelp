"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useHelpSearch } from "./HelpSearchContext";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  icon: React.ReactNode;
  title: string;
  questions: FAQItem[];
}

interface FAQSectionProps {
  categories: FAQCategory[];
}

export default function FAQSection({ categories }: FAQSectionProps) {
  const t = useTranslations("help.faq");
  const { searchQuery } = useHelpSearch();

  // Filter FAQs based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }

    const query = searchQuery.toLowerCase().trim();

    return categories
      .map((category) => {
        const filteredQuestions = category.questions.filter(
          (faq) =>
            faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query) ||
            category.title.toLowerCase().includes(query)
        );

        if (filteredQuestions.length > 0) {
          return {
            ...category,
            questions: filteredQuestions,
          };
        }
        return null;
      })
      .filter((category): category is FAQCategory => category !== null);
  }, [categories, searchQuery]);

  if (filteredCategories.length === 0 && searchQuery.trim()) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-text-secondary)] text-lg">
          {t("noResults", { query: searchQuery })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {filteredCategories.map((category, categoryIndex) => (
        <div key={categoryIndex}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white">
              {category.icon}
            </div>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
              {category.title}
            </h3>
          </div>

          <div className="grid gap-4">
            {category.questions.map((faq, faqIndex) => (
              <Card key={faqIndex} className="p-6">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <h4 className="text-lg font-medium text-[var(--color-text-primary)] group-open:text-[var(--color-primary)]">
                      {faq.question}
                    </h4>
                    <div className="ml-4 flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-[var(--color-text-secondary)] group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </summary>
                  <div className="mt-4 text-[var(--color-text-secondary)] leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
