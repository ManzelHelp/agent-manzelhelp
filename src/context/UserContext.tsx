import React, { createContext, useContext } from "react";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import type { User as DBUser } from "@/types/supabase";

type UserWithProfile = (SupabaseAuthUser & { profile: DBUser | null }) | null;

const UserContext = createContext<UserWithProfile>(null);

export const useUser = () => useContext(UserContext);

export function UserProvider({
  user,
  children,
}: {
  user: UserWithProfile;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
