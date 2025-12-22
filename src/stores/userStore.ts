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
  
  const store = create<UserState>()(
    persist(storeState, {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state: UserState) => ({ user: state.user }),
      skipHydration: true,
      onRehydrateStorage: () => (state: UserState | undefined) => {
        console.log(
          "User store rehydrated:",
          state?.user ? "User found" : "No user"
        );
      },
    })
  );

  // Rehydrate on client
  setTimeout(() => {
    try {
      if (store.persist?.hasHydrated() === false) {
        store.persist.rehydrate();
      }
    } catch (error) {
      console.error("Error rehydrating user store:", error);
    }
  }, 0);

  return store;
})();
