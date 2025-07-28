import React from "react";
import Link from "next/link";
import { getUserProfileAction } from "@/actions/users";
import { createClient } from "@/supabase/server";
import ServiceOfferCard from "@/components/ServiceOfferCard";
import { User, TaskerService } from "@/types/supabase";
import { Plus } from "lucide-react";

async function getTaskerServices(taskerId: string): Promise<TaskerService[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasker_services")
    .select("*")
    .eq("tasker_id", taskerId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data || [];
}

export default async function MyServicesPage() {
  // Get current user (tasker)
  const { user } = await getUserProfileAction();
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <h2 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
          Not signed in
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-4">
          Please log in to view your services.
        </p>
        <Link
          href="/login"
          className="px-4 py-2 rounded-md bg-[var(--color-secondary)] text-white font-medium hover:bg-[var(--color-secondary-dark)] transition-all"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Fetch tasker's services
  const services = await getTaskerServices(user.id);

  return (
    <main className="w-full min-h-[100dvh] bg-[var(--color-bg)] flex flex-col items-center px-0 sm:px-4 py-0">
      {/* Explanation & Quick Steps */}
      <section className="w-full max-w-2xl px-4 pt-6 pb-2">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-md p-4 sm:p-6 border border-[var(--color-border)] mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            Manage Your Services
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-4 text-sm sm:text-base">
            Here you can view, add, and manage all the services you offer as a
            tasker. Keeping your service list up to date helps customers find
            and book you more easily.
          </p>
          <div>
            <h2 className="font-semibold text-[var(--color-text-primary)] mb-1 text-base">
              Quick Steps:
            </h2>
            <ol className="list-decimal list-inside space-y-1 text-[var(--color-text-secondary)] text-sm sm:text-base">
              <li>
                Click{" "}
                <span className="font-semibold text-[var(--color-secondary-dark)]">
                  Add New Service
                </span>{" "}
                to create a new offer.
              </li>
              <li>Review your existing services below.</li>
              <li>Edit or update your offers to keep them attractive.</li>
              <li>Remove services you no longer provide.</li>
            </ol>
          </div>
        </div>
        <div className="flex justify-end mb-2">
          <Link
            href="./create-offer"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-secondary)] text-white font-semibold text-base shadow hover:bg-[var(--color-secondary-dark)] transition-all min-h-[44px] mobile-button whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add New Service</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full max-w-2xl px-4 pb-8 flex-1 flex flex-col">
        <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)] mt-6 mb-3 sm:mb-4">
          Your Service Offers
        </h3>
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-16 bg-[var(--color-surface)] rounded-xl shadow-inner border border-dashed border-[var(--color-border)] mt-2">
            <span className="text-6xl mb-4">🛠️</span>
            <h2 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
              No services yet
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-4 max-w-xs text-center">
              You haven't added any services. Start by creating your first
              service offer!
            </p>
            <Link
              href="./create-offer"
              className="px-5 py-2.5 rounded-lg bg-[var(--color-secondary)] text-white font-semibold hover:bg-[var(--color-secondary-dark)] transition-all text-base shadow"
            >
              Add Service
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {services.map((service) => (
              <ServiceOfferCard
                key={service.id}
                service={service}
                tasker={user as User}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
