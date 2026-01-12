import { z } from "zod";

// Règle unique du mot de passe (8 char, Maj, min, chiffre - PAS de spécial)
export const passwordRule = z.string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Une lettre majuscule est requise")
  .regex(/[a-z]/, "Une lettre minuscule est requise")
  .regex(/[0-9]/, "Un chiffre est requis");

export const signupSchema = z.object({
  email: z.string().email("Veuillez entrer un email valide"),
  password: passwordRule,
  userRole: z.string().min(1, "Veuillez choisir un rôle")
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis")
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Veuillez entrer un email valide")
});

export const resetPasswordSchema = z.object({
  password: passwordRule,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});