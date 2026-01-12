import { z } from "zod";

export const createBookingSchema = z.object({
  tasker_id: z.coerce.string().min(1, "ID de l'assistant manquant"),
  tasker_service_id: z.coerce.string().min(1, "ID du service manquant"),
  booking_type: z.enum(["instant", "scheduled", "recurring"]),
  scheduled_date: z.string().optional().nullable(),
  scheduled_time_start: z.string().optional().nullable(),
  scheduled_time_end: z.string().optional().nullable(),
  estimated_duration: z.coerce.number().min(0.5, "La durée doit être d'au moins 30 minutes"),
  address_id: z.coerce.string().min(1, "Veuillez sélectionner une adresse"),
  agreed_price: z.coerce.number().positive("Le prix doit être positif"),
  customer_requirements: z.string()
    .min(100, "Veuillez détailler vos besoins (minimum 100 caractères)")
    .max(2000, "Les besoins spécifiques ne peuvent pas dépasser 2000 caractères"),
  payment_method: z.enum(["cash", "online", "wallet", "pending"]),
});