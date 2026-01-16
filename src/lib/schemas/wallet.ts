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
    (file) => {
      // PDFs are uploaded as-is and must respect the hard 5MB server limit.
      if (file.type === "application/pdf") return file.size <= 5 * 1024 * 1024;

      // Images are compressed client-side before upload.
      // We allow larger originals here to enable compression, but the final file
      // must still be <= 5MB (enforced in the upload flow).
      return file.size <= 20 * 1024 * 1024; // 20MB original max
    },
    {
      message:
        "Fichier trop volumineux. PDF: 5MB max. Image: 20MB max (compressée avant envoi).",
    }
  );
