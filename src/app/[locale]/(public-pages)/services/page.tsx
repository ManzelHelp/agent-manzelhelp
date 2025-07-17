import React from "react";

const services = [
  {
    title: "Cleaning",
    description:
      "Professional home and apartment cleaning for one-time or regular needs.",
  },
  {
    title: "Furniture Assembly",
    description:
      "Get help assembling IKEA and other furniture quickly and correctly.",
  },
  {
    title: "Moving Help",
    description: "Hire helpers for heavy lifting, packing, or transport.",
  },
  {
    title: "Mounting",
    description: "Mount TVs, shelves, art, and more with expert help.",
  },
  {
    title: "Gardening",
    description: "Find help for lawn care, planting, and garden maintenance.",
  },
  {
    title: "Tutoring",
    description:
      "Connect with tutors for school subjects, languages, and more.",
  },
  {
    title: "Pet Care",
    description: "Pet sitting, dog walking, and other animal care services.",
  },
  {
    title: "Repairs",
    description: "Minor home repairs, handyman services, and maintenance.",
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Our Most Popular Services
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div
            key={service.title}
            className="bg-[var(--color-surface)] rounded-lg shadow p-6 border border-[var(--color-border)] flex flex-col items-center"
          >
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded mb-4 flex items-center justify-center text-gray-400">
              {/* Image placeholder */}
              <span className="text-xs">
                Image
                <br />
                coming soon
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-center">
              {service.title}
            </h2>
            <p className="text-gray-700 dark:text-gray-200 text-center">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
