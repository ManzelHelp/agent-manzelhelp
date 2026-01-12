import { z } from "zod";

// Schéma pour l'envoi de messages
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Le message ne peut pas être vide")
    .max(5000, "Le message ne peut pas dépasser 5000 caractères")
    .trim(),
});

// Schéma pour la raison d'annulation
export const cancellationReasonSchema = z.object({
  reason: z.string().min(1, "Veuillez sélectionner une raison"),
  customComment: z
    .string()
    .max(500, "Le commentaire ne peut pas dépasser 500 caractères")
    .optional(),
}).refine(
  (data) => {
    // Si la raison est "other", le commentaire personnalisé est requis
    if (data.reason === "other") {
      return data.customComment && data.customComment.trim().length > 0;
    }
    return true;
  },
  {
    message: "Veuillez fournir un commentaire personnalisé",
    path: ["customComment"],
  }
);
