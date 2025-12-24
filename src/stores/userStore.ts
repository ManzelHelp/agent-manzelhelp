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

// Create store conditionally - this is the key fix for Next.js 15 + React 19
export const useUserStore = (() => {
  if (typeof window === "undefined") {
    // Server: return plain store without any middleware
    return create<UserState>(storeState);
  }
  
  // Client: use persist middleware
  // Use require() inside the conditional to prevent SSR evaluation
  const { persist, createJSONStorage } = require("zustand/middleware");
  
  // Create store with persist middleware for client-side only
  // Zustand 5.x handles rehydration automatically when skipHydration is true
  // The onRehydrateStorage callback is called automatically after rehydration
  const store = create<UserState>()(
    persist(storeState, {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
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
