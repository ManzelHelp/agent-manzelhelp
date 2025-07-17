import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ADVANTAGES = [
  {
    title: "Verified & Trusted Helpers",
    description:
      "All our service agents are background-checked and reviewed by the community.",
    icon: "✅",
  },
  {
    title: "Flexible & Fast Booking",
    description:
      "Book a helper for the time and service you need, with instant confirmation.",
    icon: "⚡",
  },
  {
    title: "Wide Range of Services",
    description:
      "From cleaning to repairs, find the right expert for any task.",
    icon: "🛠️",
  },
];

const PRICING_ESTIMATES = [
  {
    service: "Cleaning",
    range: "€15 - €25 / hour",
    note: "Depends on experience & task complexity",
  },
  {
    service: "Handyman",
    range: "€20 - €40 / hour",
    note: "Varies by skill & project size",
  },
  {
    service: "Gardening",
    range: "€18 - €30 / hour",
    note: "Based on expertise & garden size",
  },
];

export default function FindAHelperPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 py-8">
      {/* Hero Section */}
      <section className="w-full max-w-3xl text-center mb-12">
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: "var(--primary)" }}
        >
          Find Trusted Helpers for Any Task
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-6">
          Book reliable service agents in your area – fast, easy, and secure.
        </p>
        <Button size="lg" className="rounded-full px-8 py-4 text-lg">
          Start Searching
        </Button>
      </section>

      {/* Advantages Section */}
      <section className="w-full max-w-4xl grid gap-6 md:grid-cols-3 mb-16">
        {ADVANTAGES.map((adv, idx) => (
          <Card
            key={idx}
            className="flex flex-col items-center p-6 text-center shadow-md h-full"
          >
            <div className="text-4xl mb-3" aria-hidden>
              {adv.icon}
            </div>
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: "var(--primary)" }}
            >
              {adv.title}
            </h2>
            <p className="text-base text-muted-foreground">{adv.description}</p>
          </Card>
        ))}
      </section>

      {/* Pricing Section */}
      <section className="w-full max-w-2xl mb-16">
        <Card className="p-8">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--primary)" }}
          >
            Estimated Prices
          </h2>
          <p className="mb-6 text-muted-foreground">
            Prices depend on the type of service and the experience of the
            worker. Here are some typical ranges:
          </p>
          <div className="grid gap-4">
            {PRICING_ESTIMATES.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row md:items-center md:justify-between bg-accent/30 rounded-lg p-4"
              >
                <span className="font-medium text-lg">{item.service}</span>
                <span className="text-primary font-semibold text-lg">
                  {item.range}
                </span>
                <span className="text-sm text-muted-foreground md:text-right">
                  {item.note}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Call to Action */}
      <section className="w-full max-w-2xl text-center">
        <h3 className="text-xl font-semibold mb-4">
          Ready to find your perfect helper?
        </h3>
        <Button size="lg" className="rounded-full px-8 py-4 text-lg">
          Get Started
        </Button>
      </section>
    </main>
  );
}
