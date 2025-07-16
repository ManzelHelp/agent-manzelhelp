"use server";

import { handleError } from "@/lib/utils";
import { createClient } from "@/supabase/server";

export const loginAction = async (email: string, password: string) => {
  try {
    const { auth } = await createClient();

    const { error } = await auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const logOutAction = async () => {
  try {
    const { auth } = await createClient();

    const { error } = await auth.signOut();
    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const signUpAction = async (
  email: string,
  password: string,
  isProvider: boolean
) => {
  try {
    const { auth } = await createClient();

    const { data, error } = await auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    const userId = data.user?.id;
    if (!userId) throw new Error("Error signing up");

    // Insert additional user data into the user table using Supabase
    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from("user")
      .insert([{ id: userId, email, isProvider }]);
    if (dbError) throw dbError;

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};
