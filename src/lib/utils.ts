import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    const errorMessage = error.message;
    
    // Vérifier si c'est un objet d'erreur Supabase avec des propriétés supplémentaires
    const supabaseError = error as any;
    const errorCode = supabaseError?.code || supabaseError?.status;
    
    // Auth errors
    if (errorMessage.includes("Invalid login credentials") || 
        errorMessage.includes("Invalid credentials") ||
        errorMessage.includes("Email not confirmed") ||
        errorCode === "invalid_credentials") {
      return { errorMessage: "errors.supabase.invalid_credentials" };
    }
    
    if (errorMessage.includes("User already registered") || 
        errorMessage.includes("already registered") ||
        errorMessage.includes("email address is already") ||
        errorMessage.includes("User already exists") ||
        errorMessage.includes("duplicate key value") ||
        errorCode === "user_already_registered" ||
        errorCode === "signup_disabled") {
      return { errorMessage: "errors.supabase.email_already_used" };
    }
    
    if (errorMessage.includes("Password should be at least")) {
      return { errorMessage: "errors.supabase.password_too_short" };
    }

    if (errorCode === "rate_limit" || errorMessage.includes("rate limit")) {
      return { errorMessage: "errors.supabase.rate_limit" };
    }

    if (errorMessage.includes("session_expired") || errorMessage.includes("JWT expired")) {
      return { errorMessage: "errors.supabase.session_expired" };
    }
    
    // Return original message if no specific translation key
    // We prefix with "raw:" to indicate it's not a translation key
    return { errorMessage: errorMessage };
  } else {
    return { errorMessage: "errors.general.unexpected" };
  }
};
