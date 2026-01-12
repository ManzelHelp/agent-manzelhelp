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
    
    // Traduire les erreurs Supabase Auth en messages clairs en français
    if (errorMessage.includes("Invalid login credentials") || 
        errorMessage.includes("Invalid credentials") ||
        errorMessage.includes("Email not confirmed") ||
        errorCode === "invalid_credentials") {
      return { errorMessage: "Aucun compte trouvé avec cet email ou mot de passe incorrect" };
    }
    
    if (errorMessage.includes("User already registered") || 
        errorMessage.includes("already registered") ||
        errorMessage.includes("email address is already") ||
        errorMessage.includes("User already exists") ||
        errorMessage.includes("duplicate key value") ||
        errorCode === "user_already_registered" ||
        errorCode === "signup_disabled") {
      return { errorMessage: "Cet email est déjà utilisé" };
    }
    
    if (errorMessage.includes("Password should be at least")) {
      return { errorMessage: "Le mot de passe doit contenir au moins 6 caractères" };
    }
    
    // Retourner le message d'erreur original si pas de traduction spécifique
    return { errorMessage: errorMessage };
  } else {
    return { errorMessage: "Une erreur est survenue" };
  }
};
