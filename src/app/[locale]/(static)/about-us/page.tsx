import React from "react";

export default function AboutUsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Why Choose Manzel Help?
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-200 mb-8 text-center">
        Manzel Help is your trusted platform to connect with local helpers for
        all your home and daily needs. Whether you need furniture assembled, a
        room cleaned, or a hand with moving, Manzel Help brings people
        together—just like Taskrabbit or Homeservice24, but with a focus on your
        community.
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">
          What Makes Manzel Help Special?
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-800 dark:text-gray-100">
          <li>
            <span className="font-semibold">Easy to Use:</span> Post a task or
            offer your services in just a few clicks. Our intuitive interface
            makes it simple for anyone to get started.
          </li>
          <li>
            <span className="font-semibold">Wide Range of Services:</span> From
            cleaning and repairs to tutoring and pet care, you can find help for
            almost anything.
          </li>
          <li>
            <span className="font-semibold">Trust & Safety:</span> All users are
            verified and reviewed, so you can hire or offer services with
            confidence.
          </li>
          <li>
            <span className="font-semibold">Local Community Focus:</span>{" "}
            Support your neighbors and local economy by connecting with people
            nearby.
          </li>
          <li>
            <span className="font-semibold">Transparent Pricing:</span> Agree on
            rates up front—no hidden fees or surprises.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">How It Works</h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-800 dark:text-gray-100">
          <li>
            <span className="font-semibold">Sign Up:</span> Create your free
            account as a helper or someone seeking help.
          </li>
          <li>
            <span className="font-semibold">Post or Browse Tasks:</span>{" "}
            Describe what you need or browse available jobs in your area.
          </li>
          <li>
            <span className="font-semibold">Connect & Chat:</span> Message
            directly within the platform to clarify details and agree on terms.
          </li>
          <li>
            <span className="font-semibold">Get It Done:</span> Meet up,
            complete the task, and leave a review to help others in the
            community.
          </li>
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Popular Use Cases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[var(--color-surface)] rounded-lg shadow p-5 border border-[var(--color-border)]">
            <h3 className="font-bold mb-2">Home Cleaning</h3>
            <p className="text-gray-700 dark:text-gray-200">
              Find trusted cleaners for regular or one-time jobs.
            </p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg shadow p-5 border border-[var(--color-border)]">
            <h3 className="font-bold mb-2">Furniture Assembly</h3>
            <p className="text-gray-700 dark:text-gray-200">
              Get help assembling IKEA or other furniture quickly and correctly.
            </p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg shadow p-5 border border-[var(--color-border)]">
            <h3 className="font-bold mb-2">Moving Help</h3>
            <p className="text-gray-700 dark:text-gray-200">
              Hire helpers for heavy lifting, packing, or transport.
            </p>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg shadow p-5 border border-[var(--color-border)]">
            <h3 className="font-bold mb-2">Tutoring & More</h3>
            <p className="text-gray-700 dark:text-gray-200">
              Find tutors, pet sitters, gardeners, and more—all in one place.
            </p>
          </div>
        </div>
      </section>

      <section className="text-center mt-12">
        <h2 className="text-2xl font-semibold mb-3">Join Manzel Help Today</h2>
        <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
          Whether you want to offer your skills or need a helping hand, Manzel
          Help is your go-to platform for safe, reliable, and local services.
        </p>
        <a
          href="/sign-up"
          className="inline-block bg-[var(--color-primary)] text-white font-bold py-3 px-8 rounded-lg shadow hover:bg-[var(--color-primary)]/90 transition"
        >
          Get Started
        </a>
      </section>
    </div>
  );
}
