// src/lib/schemas/jobs.ts
import { z } from "zod";

export const jobFormSchema = z.object({
  jobDetails: z.object({
    // Be permissive with input types coming from forms (string/number) then validate
    title: z.any().transform((v) => String(v)).pipe(z.string().min(1, "required")),
    description: z
      .any()
      .transform((v) => String(v))
      .pipe(
        z
          .string()
          .min(1, "required")
          .min(80, "La description doit contenir au moins 80 caractères")
      ),
    categoryId: z.coerce.number().int().min(1, "required"),
    serviceId: z.coerce.number().int().min(1, "required"),
    selectedAddressId: z.coerce.string().min(1, "required"),
    requirements: z.any().transform((v) => (v ? String(v) : "")).optional(),
    images: z.any().transform((v) => Array.isArray(v) ? v.map(String) : []), 
    }),
  scheduleBudget: z.object({
    preferredDate: z.any().transform((v) => String(v)).pipe(z.string().min(1, "required")),
    preferredTimeStart: z.any().transform((v) => (v ? String(v) : "")).optional(),
    preferredTimeEnd: z.any().transform((v) => (v ? String(v) : "")).optional(),
    isFlexible: z
      .any()
      .transform((v) => v === true || v === "true" || v === "on" || v === 1 || v === "1")
      .pipe(z.boolean())
      .default(false),
    estimatedDuration: z.coerce.number().positive("must_be_positive"),
    customerBudget: z.coerce.number().positive("must_be_positive"),
    currency: z.coerce.string().default("MAD"),
    maxApplications: z.coerce.number().int().min(1, "min_1"),
  }),
});

export type JobFormSchema = z.infer<typeof jobFormSchema>;

// Schema for updating a job
export const updateJobSchema = z.object({
  title: z.coerce.string().min(1, "Le titre est requis").min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.coerce.string().min(1, "La description est requise").min(80, "La description doit contenir au moins 80 caractères"),
  service_id: z.coerce.number().min(1, "Le service est requis"),
  customer_budget: z.coerce.number().positive("Le budget doit être positif").min(1, "Le budget doit être au moins 1"),
  estimated_duration: z.coerce.number().positive("La durée estimée doit être positive").min(1, "La durée doit être au moins 1 heure"),
  preferred_date: z.coerce.string().min(1, "La date préférée est requise"),
  preferred_time_start: z.coerce.string().optional().nullable(),
  preferred_time_end: z.coerce.string().optional().nullable(),
  is_flexible: z.boolean(),
  requirements: z.coerce.string().optional().nullable(),
});

export type UpdateJobSchema = z.infer<typeof updateJobSchema>;

// Schema for job application
export const jobApplicationSchema = z.object({
  proposed_price: z.coerce.number().positive("Le prix proposé doit être positif").min(1, "Le prix doit être au moins 1"),
  estimated_duration: z.coerce.number().positive("La durée estimée doit être positive").min(0.5, "La durée doit être d'au moins 30 minutes"),
  message: z.string().min(1, "Le message est requis").min(20, "Le message doit contenir au moins 20 caractères").max(500, "Le message ne doit pas dépasser 500 caractères"),
  availability: z.string().min(1, "La disponibilité est requise"),
  experience_level: z.string().min(1, "Le niveau d'expérience est requis"),
  experience_description: z.string().optional(),
  availability_details: z.string().optional(),
  is_flexible_schedule: z.boolean().default(false),
});

export type JobApplicationSchema = z.infer<typeof jobApplicationSchema>;