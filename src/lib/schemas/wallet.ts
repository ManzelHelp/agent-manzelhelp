import { z } from "zod";

export const refundRequestSchema = z.object({
  amount: z
    .number()
    .min(1, "Le montant doit être supérieur à 0")
    .max(100000, "Le montant ne peut pas dépasser 100 000 MAD")
    .refine((val) => val > 0, "Le montant doit être supérieur à 0"),
});

export type RefundRequestFormData = z.infer<typeof refundRequestSchema>;

// Schema for receipt file validation
export const receiptFileSchema = z
  .instanceof(File)
  .refine(
    (file) => {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];
      return allowedTypes.includes(file.type);
    },
    {
      message: "Veuillez télécharger un fichier valide (JPG, PNG, WebP ou PDF)",
    }
  )
  .refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    {
      message: "La taille du fichier ne peut pas dépasser 5 MB",
    }
  );
