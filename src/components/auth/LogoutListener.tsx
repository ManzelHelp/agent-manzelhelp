"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useUserStore } from "@/stores/userStore";
import { toast } from "sonner";
import { createClient } from "@/supabase/client";

/**
 * Component that listens for logout events across browser tabs
 * Uses localStorage events to detect when user logs out in another tab
 */
export function LogoutListener() {
  const router = useRouter();
  const { user, setUser } = useUserStore();

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Skip if no user is logged in
    if (!user) return;

    let isInitialMount = true;
    let hasHandledInitialAuth = false;
    const mountTime = Date.now();

    // Listen for storage changes (logout in other tabs)
    // Storage events ONLY fire for changes in OTHER tabs/windows, not the current one
    const handleStorageChange = async (e: StorageEvent) => {
      // Ignore events that happen too soon after mount (likely from page refresh)
      if (Date.now() - mountTime < 2000) {
        return;
      }

      // Only react to user-storage being cleared (not just changed)
      // oldValue must exist and newValue must be null (actual logout)
      if (e.key === "user-storage" && e.newValue === null && e.oldValue !== null && e.oldValue !== "" && user) {
        // Verify session is actually gone before logging out
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          
          // Only logout if session is truly gone
          if (!session) {
            console.log("Logout detected in another tab");
            setUser(null);
            toast.info("You have been logged out");
            router.push("/");
          }
        } catch (error) {
          console.error("Error checking session:", error);
          // Don't logout on error - might be temporary network issue
        }
      }
    };

    // Listen for storage events (only fires for changes in OTHER tabs/windows)
    window.addEventListener("storage", handleStorageChange);

    // Listen for Supabase auth state changes
    // This can fire on mount, so we need to be careful
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip the initial event on mount (it's just checking current state)
        if (!hasHandledInitialAuth) {
          hasHandledInitialAuth = true;
          // If initial state shows no session but we have a user, don't logout
          // This could be a temporary issue or the session is being refreshed
          if (!session && user) {
            // Wait a bit and check again - might be session refresh
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (!retrySession && user) {
                // Still no session after retry - might be expired
                // But don't auto-logout, let the user continue
                console.warn("Session check: No active session but user exists in store");
              }
            }, 1000);
          }
          return;
        }

        // Only logout on explicit SIGNED_OUT event, not on other events
        // Token refresh events should not trigger logout
        if (event === "SIGNED_OUT" && user && !session) {
          console.log("Sign out detected via auth state change");
          setUser(null);
          toast.info("You have been logged out");
          router.push("/");
        }
      }
    );

    // Mark initial mount as complete after a delay
    setTimeout(() => {
      isInitialMount = false;
    }, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      subscription.unsubscribe();
    };
  }, [user, setUser, router]);

  return null; // This component doesn't render anything
}

