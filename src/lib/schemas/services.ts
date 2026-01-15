import { z } from "zod";

// Validation pour l'Étape 1
export const serviceStep1Schema = z.object({
  title: z.string().min(5, "Le titre doit faire au moins 5 caractères"),
  description: z.string().min(20, "La description doit faire au moins 20 caractères"),
  categoryId: z.number().min(1, "Veuillez choisir une catégorie"),
  serviceId: z.number().min(1, "Veuillez choisir un service spécifique"),
  selectedAddressId: z.union([z.string(), z.number()]).refine(val => {
    if (typeof val === "string") return val !== "" && val !== "0";
    if (typeof val === "number") return val !== 0;
    return false;
  }, "Veuillez sélectionner une adresse"),
  serviceArea: z.string().optional(),
});

// Validation pour l'Étape 2
export const serviceStep2Schema = z.object({
  pricingType: z.enum(["fixed", "hourly", "per_item"]),
  basePrice: z.coerce.number().optional(),
  hourlyRate: z.coerce.number().optional(),
  minimumBookingHours: z.coerce.number().min(0.5, "Le minimum doit être d'au moins 0.5 heures").optional().or(z.literal(undefined)),
  estimatedDuration: z.coerce.number().min(0.5, "La durée estimée doit être d'au moins 0.5 heures").optional().or(z.literal(undefined)),
  extras: z.array(z.object({
    name: z.string(),
    price: z.number(),
  })).optional(),
}).superRefine((data, ctx) => {
  if (data.pricingType === "fixed" && (!data.basePrice || data.basePrice <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le prix fixe doit être supérieur à 0",
      path: ["basePrice"],
    });
  }
  if (data.pricingType === "hourly" && (!data.hourlyRate || data.hourlyRate <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le taux horaire doit être supérieur à 0",
      path: ["hourlyRate"],
    });
  }
  if (data.pricingType === "per_item" && (!data.basePrice || data.basePrice <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le prix par article doit être supérieur à 0",
      path: ["basePrice"],
    });
  }
});

// Validation pour l'édition de service
export const updateServiceSchema = z.object({
  title: z.string().min(5, "Le titre doit faire au moins 5 caractères"),
  description: z.string().min(20, "La description doit faire au moins 20 caractères"),
  price: z.coerce.number().min(0.01, "Le prix doit être supérieur à 0"),
  pricing_type: z.enum(["fixed", "hourly", "per_item"]),
  minimum_duration: z.coerce.number().min(0, "La durée minimale doit être positive").optional().or(z.literal(undefined)),
  service_area: z.string().optional(),
  service_status: z.enum(["active", "paused"]),
});