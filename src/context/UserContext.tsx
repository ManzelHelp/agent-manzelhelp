"use client";

import React, { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

const UserContext = createContext<User | null>(null);

export const useUser = () => useContext(UserContext);

export function UserProvider({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
