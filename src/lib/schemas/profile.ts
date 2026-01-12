import { z } from "zod";

// 1. Informations personnelles
export const personalInfoSchema = z.object({
  first_name: z
    .string()
    .min(2, "Le prénom doit faire au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes")
    .trim(),
  last_name: z
    .string()
    .min(2, "Le nom doit faire au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes")
    .trim(),
  phone: z
    .string()
    .min(1, "Le numéro de téléphone est requis")
    .refine((val) => {
      // Si le champ est vide après trim, c'est invalide (requis)
      if (!val || val.trim() === "") return false;
      
      // Nettoyer le numéro pour la validation (enlever espaces, tirets, parenthèses)
      const cleaned = val.replace(/[\s\-\(\)]/g, "");
      
      // Formats acceptés:
      // - 0XXXXXXXXX (10 ou 11 chiffres, commence par 0 puis 5, 6 ou 7)
      // - +212XXXXXXXXX (13 caractères, commence par +212 puis 5, 6 ou 7)
      // - 212XXXXXXXXX (12 chiffres, commence par 212 puis 5, 6 ou 7)
      
      // Vérifier si c'est un format 0XXXXXXXXX (commence par 0 puis 5, 6 ou 7)
      // Format: 0 + [5-7] + 8 ou 9 chiffres = 10 ou 11 chiffres au total
      // On accepte les numéros qui commencent par 0 puis 5, 6 ou 7, suivis de 8 ou 9 chiffres
      if (/^0[5-7]\d{8,9}$/.test(cleaned)) {
        return true;
      }
      
      // Vérifier si c'est un format +212XXXXXXXXX (commence par +212 puis 5, 6 ou 7)
      // Format: +212 + [5-7] + 8 ou 9 chiffres = 13 ou 14 caractères au total
      if (/^\+212[5-7]\d{8,9}$/.test(cleaned)) {
        return true;
      }
      
      // Vérifier si c'est un format 212XXXXXXXXX (commence par 212 puis 5, 6 ou 7)
      // Format: 212 + [5-7] + 8 ou 9 chiffres = 12 ou 13 chiffres au total
      if (/^212[5-7]\d{8,9}$/.test(cleaned)) {
        return true;
      }
      
      return false;
    }, "Numéro de téléphone invalide. Formats acceptés: 0XXXXXXXXX (10-11 chiffres) ou +212XXXXXXXXX (13-14 caractères). Le numéro doit commencer par 0 puis 5, 6 ou 7."),
  date_of_birth: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val === "") return true;
      // Vérifier le format YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(val)) {
        return false;
      }
      // Vérifier que la date est valide
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        return false;
      }
      // Vérifier que la date correspond bien à la chaîne (évite les dates invalides comme 2023-13-45)
      const [year, month, day] = val.split("-").map(Number);
      if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
        return false;
      }
      // Vérifier l'âge minimum (18 ans)
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      const dayDiff = today.getDate() - date.getDate();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      if (actualAge < 18) {
        return false;
      }
      // Vérifier l'âge maximum (120 ans)
      if (actualAge > 120) {
        return false;
      }
      // Vérifier que la date n'est pas dans le futur
      if (date > today) {
        return false;
      }
      return true;
    }, {
      message: "Date de naissance invalide. Vous devez avoir au moins 18 ans et la date doit être valide (format: AAAA-MM-JJ)"
    }),
});

// 2. Bio et Expérience
export const bioExperienceSchema = z.object({
  bio: z.string().min(50, "Votre bio doit faire au moins 50 caractères pour rassurer les clients"),
  experience_level: z.enum(["beginner", "intermediate", "expert"]),
  service_radius_km: z.number().min(1, "Le rayon minimum est de 1km").max(200, "Le rayon maximum est de 200km"),
});


// 4. Disponibilités
const availabilitySlotSchema = z.object({
  day: z.string(),
  enabled: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
});

export const availabilityFormSchema = z.array(availabilitySlotSchema)
  .refine((slots) => slots.some(slot => slot.enabled), {
    message: "Veuillez activer au moins un jour de travail",
  })
  .refine((slots) => slots.every(slot => !slot.enabled || slot.startTime < slot.endTime), {
    message: "L'heure de fin doit être après l'heure de début",
  });

// 5. Avis (Reviews)
export const reviewSchema = z.object({
  overallRating: z.number().min(1, "Veuillez donner une note globale").max(5),
  qualityRating: z.number().optional(),
  communicationRating: z.number().optional(),
  timelinessRating: z.number().optional(),
  comment: z.string().max(2000, "Le commentaire est trop long").optional(),
});

export const addressSchema = z.object({
    label: z.string().min(1, "Veuillez choisir une étiquette"),
    street_address: z.string().min(5, "L'adresse doit faire au moins 5 caractères"),
    city: z.string().min(2, "La ville est requise"),
    region: z.string().min(2, "La région est requise"),
    postal_code: z.string().optional().or(z.literal("")),
    country: z.string().min(2),
    is_default: z.boolean().default(false),
  });