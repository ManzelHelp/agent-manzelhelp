"use client";

import { create } from "zustand";
import type { User } from "@/types/supabase";

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

const storeState = (set: (partial: Partial<UserState> | ((state: UserState) => Partial<UserState>)) => void) => ({
  user: null,
  setUser: (user: User | null) => set({ user }),
  clearUser: () => set({ user: null }),
});

// No-op storage for SSR - prevents any localStorage access during server-side rendering
const noopStorage = {
  getItem: (): string | null => null,
  setItem: (): void => {},
  removeItem: (): void => {},
};

// Safe storage factory that returns appropriate storage based on environment
// This function is only called when Zustand actually needs to access storage
const getStorage = () => {
  // Always check for window before accessing localStorage
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return noopStorage;
  }
  
  // On client side, return a safe wrapper around localStorage
  // This wrapper ensures we never directly expose localStorage to Zustand
  return {
    getItem: (name: string): string | null => {
      try {
        return window.localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      try {
        window.localStorage.setItem(name, value);
      } catch {
        // Ignore errors (e.g., quota exceeded)
      }
    },
    removeItem: (name: string): void => {
      try {
        window.localStorage.removeItem(name);
      } catch {
        // Ignore errors
      }
    },
  };
};

// Create store conditionally - this is the key fix for Next.js 15 + React 19
export const useUserStore = (() => {
  if (typeof window === "undefined") {
    // Server: return plain store without any middleware
    return create<UserState>(storeState);
  }
  
  // Client: use persist middleware
  // Dynamically import to prevent SSR evaluation
  // This ensures the middleware is only loaded on the client
  const { persist, createJSONStorage } = require("zustand/middleware");
  
  // Create store with persist middleware for client-side only
  // Zustand 5.x handles rehydration automatically when skipHydration is true
  // The onRehydrateStorage callback is called automatically after rehydration
  const store = create<UserState>()(
    persist(storeState, {
      name: "user-storage",
      storage: createJSONStorage(getStorage),
      partialize: (state: UserState) => ({ user: state.user }),
      skipHydration: true, // Prevents hydration mismatch between server and client
      onRehydrateStorage: () => (state: UserState | undefined) => {
        // This callback is automatically called after rehydration completes
        // No manual rehydration needed in Zustand 5.x
        if (process.env.NODE_ENV === "development") {
          console.log(
            "User store rehydrated:",
            state?.user ? "User found" : "No user"
          );
        }
      },
    })
  );

  return store;
})();
