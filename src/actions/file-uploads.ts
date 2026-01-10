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
  frontPath?: string; // Path in storage bucket (e.g., "userId/id-front.jpg")
  backPath?: string; // Path in storage bucket (e.g., "userId/id-back.jpg")
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

    // Get authenticated user to ensure we use auth.uid() for RLS policy
    // This is critical: RLS policy checks (storage.foldername(name))[1] = auth.uid()::text
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        success: false,
        errorMessage: "User not authenticated. Please log in again.",
      };
    }

    // SECURITY: Use authUser.id (auth.uid()) instead of userId parameter
    // This ensures the folder path matches what RLS policy expects
    // The RLS policy enforces: (storage.foldername(name))[1] = auth.uid()::text
    // This means users can ONLY upload to their own folder, preventing unauthorized access
    // No need to validate userId parameter - RLS policy is the security layer
    const authenticatedUserId = authUser.id;

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
    // CRITICAL: Use authenticatedUserId (auth.uid()) to match RLS policy
    // The RLS policy checks: (storage.foldername(name))[1] = auth.uid()::text
    const uploadPromises = [
      supabase.storage
        .from("verification-documents")
        .upload(`${authenticatedUserId}/id-front.jpg`, frontFile, {
          cacheControl: "3600",
          upsert: true,
        }),
      supabase.storage
        .from("verification-documents")
        .upload(`${authenticatedUserId}/id-back.jpg`, backFile, {
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

    // Get public URLs for the uploaded files
    // Since verification-documents bucket is private, we need to create signed URLs
    // But for storage in database, we'll save the path and construct URL when needed
    // For now, we'll save the full path that can be used to construct the URL
    const frontPath = `${authenticatedUserId}/id-front.jpg`;
    const backPath = `${authenticatedUserId}/id-back.jpg`;

    // Create signed URLs (valid for 1 year) for immediate use
    const [frontUrlResult, backUrlResult] = await Promise.all([
      supabase.storage
        .from("verification-documents")
        .createSignedUrl(frontPath, 60 * 60 * 24 * 365), // 1 year
      supabase.storage
        .from("verification-documents")
        .createSignedUrl(backPath, 60 * 60 * 24 * 365), // 1 year
    ]);

    // Return the signed URLs if available, otherwise return the paths
    // The path can be used to construct URLs later
    return {
      success: true,
      frontUrl: frontUrlResult.data?.signedUrl || frontPath,
      backUrl: backUrlResult.data?.signedUrl || backPath,
      frontPath: frontPath, // Also return path for database storage
      backPath: backPath,
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

// Server action to upload refund receipt
export const uploadRefundReceipt = async (
  requestId: string,
  file: File
): Promise<UploadResult> => {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user: authUser }, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        success: false,
        errorMessage: "User not authenticated. Please log in again.",
      };
    }

    // Verify that the request belongs to the user
    const { data: request, error: requestError } = await supabase
      .from("wallet_refund_requests")
      .select("tasker_id, status")
      .eq("id", requestId)
      .single();

    if (requestError || !request) {
      return {
        success: false,
        errorMessage: "Refund request not found",
      };
    }

    if (request.tasker_id !== authUser.id) {
      return {
        success: false,
        errorMessage: "Unauthorized: You can only upload receipts for your own requests",
      };
    }

    if (request.status !== "pending") {
      return {
        success: false,
        errorMessage: `Cannot upload receipt. Current status: ${request.status}`,
      };
    }

    // Validate file type (images and PDF)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        errorMessage: "Please upload a valid file (JPG, PNG, WebP, or PDF)",
      };
    }

    if (file.size > maxSize) {
      return {
        success: false,
        errorMessage: "File size must be less than 5MB",
      };
    }

    // Determine file extension
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `receipt.${fileExt}`;
    const filePath = `${authUser.id}/${requestId}/${fileName}`;

    // Use receipts bucket (or verification-documents if receipts doesn't exist)
    // First, try to upload to receipts bucket
    let uploadResult = await supabase.storage
      .from("receipts")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    // If receipts bucket doesn't exist, fallback to verification-documents
    if (uploadResult.error && uploadResult.error.message.includes("bucket")) {
      uploadResult = await supabase.storage
        .from("verification-documents")
        .upload(`receipts/${filePath}`, file, {
          cacheControl: "3600",
          upsert: true,
        });
    }

    if (uploadResult.error) {
      return {
        success: false,
        errorMessage: `Failed to upload receipt: ${uploadResult.error.message}`,
      };
    }

    // Create signed URL (valid for 1 year)
    const bucketName = uploadResult.error ? "verification-documents" : "receipts";
    const finalPath = uploadResult.error
      ? `receipts/${filePath}`
      : filePath;

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from(bucketName)
        .createSignedUrl(finalPath, 60 * 60 * 24 * 365); // 1 year

    if (signedUrlError) {
      console.error("Error creating signed URL:", signedUrlError);
      // Return the path even if signed URL creation fails
      return {
        success: true,
        url: finalPath,
      };
    }

    return {
      success: true,
      url: signedUrlData.signedUrl || finalPath,
    };
  } catch (error) {
    console.error("Error uploading refund receipt:", error);
    return {
      success: false,
      errorMessage: "Failed to upload receipt",
    };
  }
};
