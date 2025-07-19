import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/supabase";

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
      partialize: (state) => ({ user: state.user }), // only persist user data
      onRehydrateStorage: () => (state) => {
        // Optional: Handle rehydration completion
        console.log(
          "User store rehydrated:",
          state?.user ? "User found" : "No user"
        );
      },
    }
  )
);
