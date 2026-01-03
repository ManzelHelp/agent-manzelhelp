"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useUserStore } from "@/stores/userStore";
import { getUserProfileAction } from "@/actions/auth";

/**
 * SessionSync component
 * 
 * This component synchronizes the Zustand user store with the Supabase session.
 * It listens to auth state changes and updates the store accordingly.
 * 
 * - When user logs in: fetches user profile and updates store
 * - When user logs out: clears the store immediately
 * - When session expires: clears the store
 * 
 * This ensures the UI is always in sync with the actual authentication state.
 */
export function SessionSync() {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    // Create Supabase client for client-side auth state listening
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return;
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseKey);

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[SessionSync] Auth state changed:", event, session?.user?.id);

      if (event === "SIGNED_OUT" || (event === "TOKEN_REFRESHED" && !session)) {
        // User logged out or session expired
        console.log("[SessionSync] User signed out, clearing store");
        setUser(null);
        // Also clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("user-storage");
        }
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // User signed in or session refreshed
        if (session?.user) {
          try {
            // Fetch complete user profile from database
            const profileResult = await getUserProfileAction();
            if (profileResult.success && profileResult.user) {
              console.log("[SessionSync] User profile loaded, updating store");
              setUser(profileResult.user);
            } else {
              console.warn("[SessionSync] Failed to load user profile:", profileResult.errorMessage);
              // If profile fetch fails, clear store to avoid inconsistent state
              setUser(null);
            }
          } catch (error) {
            console.error("[SessionSync] Error loading user profile:", error);
            setUser(null);
          }
        }
      }
    });

    // Initial check: verify current session matches store
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // No session but store might have user - clear it
        const currentUser = useUserStore.getState().user;
        if (currentUser) {
          console.log("[SessionSync] No session but store has user, clearing store");
          setUser(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("user-storage");
          }
        }
      } else {
        // Session exists - verify it matches store
        const currentUser = useUserStore.getState().user;
        if (!currentUser || currentUser.id !== session.user.id) {
          // Store is out of sync - fetch profile
          try {
            const profileResult = await getUserProfileAction();
            if (profileResult.success && profileResult.user) {
              console.log("[SessionSync] Store out of sync, updating from session");
              setUser(profileResult.user);
            }
          } catch (error) {
            console.error("[SessionSync] Error syncing store with session:", error);
          }
        }
      }
    };

    // Check session on mount
    checkSession();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  // This component doesn't render anything
  return null;
}

