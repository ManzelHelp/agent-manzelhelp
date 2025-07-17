import React from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function BecomeAHelperPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Start Offering Your Services
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-200 mb-8 text-center">
        Ready to earn money, help your community, and share your skills? Join
        Manzel Help as a helper and connect with people who need your expertise.
        Whether you clean, fix, tutor, or assist in any way, you can make a
        difference and get paid for it!
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-center">
          How to Get Started
        </h2>
        <ol className="list-decimal pl-6 space-y-2 text-gray-800 dark:text-gray-100 max-w-xl mx-auto">
          <li>
            <span className="font-semibold">Sign Up or Login:</span> Create a
            free account or log in to your existing one.
          </li>
          <li>
            <span className="font-semibold">Complete Your Profile:</span> Add
            your skills, experience, and a profile picture to build trust.
          </li>
          <li>
            <span className="font-semibold">List Your Services:</span> Describe
            what you offer and set your rates.
          </li>
          <li>
            <span className="font-semibold">Connect with Clients:</span> Respond
            to requests, chat, and agree on details.
          </li>
          <li>
            <span className="font-semibold">Get Paid:</span> Complete tasks and
            receive payment securely.
          </li>
        </ol>
      </section>

      <section className="text-center mt-12">
        <h2 className="text-2xl font-semibold mb-3">Ready to Help Others?</h2>
        <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
          Join our community of helpers and start making a difference today.
          Sign up or log in to get started!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" size="lg">
            <Link href="/sign-up">Sign Up</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
