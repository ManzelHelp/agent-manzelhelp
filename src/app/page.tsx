export default function Page() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex flex-col items-center py-12 px-4">
      <section className="max-w-2xl w-full text-center mb-12">
        <h1
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Welcome to Manzel Help
        </h1>
        <p
          className="text-lg text-[var(--color-text-secondary)]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          A friendly place where users can offer and request services like
          housekeeping, tutoring, pet care, and more. Connect, help, and grow
          together!
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Services Offered Section */}
        <section className="bg-[var(--color-surface)] rounded-xl shadow p-6 flex flex-col items-center">
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Services Offered
          </h2>
          <div className="h-24 w-full flex items-center justify-center text-[var(--color-text-secondary)] border-2 border-dashed border-[var(--color-border)] rounded-lg">
            {/* Placeholder for service cards */}
            <span>Coming soon: Browse available services</span>
          </div>
        </section>

        {/* Request a Service Section */}
        <section className="bg-[var(--color-surface)] rounded-xl shadow p-6 flex flex-col items-center">
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Request a Service
          </h2>
          <div className="h-24 w-full flex items-center justify-center text-[var(--color-text-secondary)] border-2 border-dashed border-[var(--color-border)] rounded-lg">
            {/* Placeholder for request form */}
            <span>Coming soon: Post your service needs</span>
          </div>
        </section>
      </div>

      <section className="mt-16 w-full max-w-2xl text-center">
        <div className="bg-[var(--color-accent)] text-white rounded-lg py-6 px-4 shadow">
          <h3
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Why Manzel Help?
          </h3>
          <ul
            className="list-disc list-inside text-left mx-auto max-w-md"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <li>Connect with trusted local helpers</li>
            <li>Offer your skills and earn extra income</li>
            <li>Easy, friendly, and secure</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
