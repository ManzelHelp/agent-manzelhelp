"use server";

import { createClient } from "@/supabase/server";

export interface UploadResult {
  success: boolean;
  url?: string;
  errorMessage?: string;
}

export interface IDDocumentUploadResult {
  success: boolean;
  frontUrl?: string;
  backUrl?: string;
  errorMessage?: string;
}

// Server action to upload ID documents
export const uploadIDDocumentsAction = async (
  userId: string,
  frontFile: File,
  backFile: File
): Promise<IDDocumentUploadResult> => {
  try {
    const supabase = await createClient();

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (
      !allowedTypes.includes(frontFile.type) ||
      !allowedTypes.includes(backFile.type)
    ) {
      return {
        success: false,
        errorMessage: "Please upload valid image files (JPG, PNG, or WebP)",
      };
    }

    if (frontFile.size > maxSize || backFile.size > maxSize) {
      return {
        success: false,
        errorMessage: "File size must be less than 5MB",
      };
    }

    // Upload both files in parallel
    const uploadPromises = [
      supabase.storage
        .from("verification-documents")
        .upload(`${userId}/id-front.jpg`, frontFile, {
          cacheControl: "3600",
          upsert: true,
        }),
      supabase.storage
        .from("verification-documents")
        .upload(`${userId}/id-back.jpg`, backFile, {
          cacheControl: "3600",
          upsert: true,
        }),
    ];

    const [frontResult, backResult] = await Promise.all(uploadPromises);

    if (frontResult.error) {
      return {
        success: false,
        errorMessage: `Failed to upload front ID: ${frontResult.error.message}`,
      };
    }

    if (backResult.error) {
      return {
        success: false,
        errorMessage: `Failed to upload back ID: ${backResult.error.message}`,
      };
    }

    return {
      success: true,
      frontUrl: frontResult.data.path,
      backUrl: backResult.data.path,
    };
  } catch (error) {
    console.error("Error uploading ID documents:", error);
    return {
      success: false,
      errorMessage: "Failed to upload ID documents",
    };
  }
};

// Server action to get signed URL for file access
export const getSignedUrlAction = async (
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<UploadResult> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      return {
        success: false,
        errorMessage: error.message,
      };
    }

    return {
      success: true,
      url: data.signedUrl,
    };
  } catch (error) {
    console.error("Error getting signed URL:", error);
    return {
      success: false,
      errorMessage: "Failed to get signed URL",
    };
  }
};

// Server action to delete uploaded files
export const deleteUploadedFilesAction = async (
  userId: string,
  filePaths: string[]
): Promise<{ success: boolean; errorMessage?: string }> => {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from("verification-documents")
      .remove(filePaths);

    if (error) {
      return {
        success: false,
        errorMessage: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting files:", error);
    return {
      success: false,
      errorMessage: "Failed to delete files",
    };
  }
};
