"use server";

import { createClient, createServiceRoleClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { getAllCategoryHierarchies } from "@/lib/categories";
import { getNotificationTranslationsForUser } from "@/lib/notifications";
import { getErrorTranslationForUser } from "@/lib/errors";
import { getUserLocale, getTranslatedString } from "@/lib/i18n-server";
import { z } from "zod"; // Seul ajout d'import nécessaire

// Helper function to get category and service names by service ID
function getCategoryAndServiceNamesSync(serviceId: number) {
  const hierarchies = getAllCategoryHierarchies();
  for (const { parent, subcategories } of hierarchies) {
    const foundService = subcategories.find((s) => s.id === serviceId);
    if (foundService) {
      return {
        categoryName: parent.name_en,
        serviceName: foundService.name_en,
      };
    }
  }
  return {
    categoryName: "Unknown Category",
    serviceName: "Unknown Service",
  };
}

export interface JobWithDetails {
  id: string;
  customer_id: string;
  service_id: number;
  title: string;
  description: string;
  preferred_date: string;
  preferred_time_start: string | null;
  preferred_time_end: string | null;
  is_flexible: boolean | null;
  estimated_duration: number | null;
  customer_budget: number | null;
  final_price: number | null;
  is_promoted: boolean | null;
  promotion_expires_at: string | null;
  promotion_boost_score: number | null;
  assigned_tasker_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  customer_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  images: string[] | null;
  requirements: string | null;
  currency: string | null;
  address_id: string;
  max_applications: number | null;
  premium_applications_purchased: number | null;
  current_applications: number | null;
  status: string | null;
  application_count: number;
  category_name_en?: string;
  service_name_en?: string;
  street_address?: string | null;
  city?: string | null;
  region?: string | null;
  assigned_tasker_first_name?: string | null;
  assigned_tasker_last_name?: string | null;
  assigned_tasker_avatar?: string | null;
  customer_first_name?: string | null;
  customer_last_name?: string | null;
  customer_avatar_url?: string | null;
}

// --- LOGIQUE ORIGINALE RESTITUÉE ---
export async function getCustomerJobs(
  customerId: string,
  limit: number = 10,
  offset: number = 0,
  includeTotal: boolean = true
): Promise<{
  jobs: JobWithDetails[];
  total: number;
  hasMore: boolean;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    let total = 0;
    if (includeTotal || offset === 0) {
      const { count, error: countError } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", customerId);

      if (countError) {
        console.error("Error fetching jobs count:", countError);
        return {
          jobs: [],
          total: 0,
          hasMore: false,
          error: `Failed to fetch jobs count: ${countError.message}`,
        };
      }
      total = count || 0;
    }

    const { data: allJobs, error: fetchError } = await supabase
      .from("jobs")
      .select(
        `
      *,
      application_count:job_applications(count),
      address:addresses(
        street_address,
        city,
        region
      ),
      assigned_tasker:users!jobs_assigned_tasker_id_fkey(
        first_name,
        last_name,
        avatar_url
      ),
      service:services!jobs_service_id_fkey(
        id,
        name_en,
        category_id,
        category:service_categories!services_category_id_fkey(
          name_en
        )
      )
    `
      )
      .eq("customer_id", customerId);

    if (fetchError) {
      console.error("Error fetching jobs:", fetchError);
      return {
        jobs: [],
        total: 0,
        hasMore: false,
        error: `Failed to fetch jobs: ${fetchError.message}`,
      };
    }

    const statusPriority: Record<string, number> = {
      active: 1,
      assigned: 2,
      in_progress: 3,
      under_review: 4,
      completed: 5,
      cancelled: 6,
    };

    const sortedJobs = (allJobs || []).sort((a, b) => {
      const statusA = statusPriority[a.status || ""] || 999;
      const statusB = statusPriority[b.status || ""] || 999;

      if (statusA !== statusB) {
        return statusA - statusB;
      }

      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    const paginatedJobs = sortedJobs.slice(offset, offset + limit);
    const hasMore = sortedJobs.length > offset + limit;
    const jobs = paginatedJobs;

    const formattedJobs: JobWithDetails[] = jobs.map((job) => {
      const service = job.service as any;
      const categoryName =
        service?.category?.name_en ||
        (() => {
          const { categoryName } = getCategoryAndServiceNamesSync(
            job.service_id
          );
          return categoryName;
        })();
      const serviceName =
        service?.name_en ||
        (() => {
          const { serviceName } = getCategoryAndServiceNamesSync(
            job.service_id
          );
          return serviceName;
        })();

      return {
        ...job,
        application_count: job.application_count?.[0]?.count || 0,
        category_name_en: categoryName,
        service_name_en: serviceName,
        street_address: job.address?.street_address,
        city: job.address?.city,
        region: job.address?.region,
        assigned_tasker_first_name: job.assigned_tasker?.first_name,
        assigned_tasker_last_name: job.assigned_tasker?.last_name,
        assigned_tasker_avatar: job.assigned_tasker?.avatar_url,
      };
    });

    return {
      jobs: formattedJobs,
      total,
      hasMore,
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error in getCustomerJobs:", error);
    return {
      jobs: [],
      total: 0,
      hasMore: false,
      error:
        error instanceof Error
          ? error.message
          : await getErrorTranslationForUser(undefined, "general", "unexpected"),
    };
  }
}

export async function getJobById(
  jobId: string
): Promise<JobWithDetails | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "jobs",
      "notAuthenticated"
    );
    throw new Error(errorMessage);
  }

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      application_count:job_applications(count),
      address:addresses(
        street_address,
        city,
        region,
        postal_code,
        country
      ),
      assigned_tasker:users!jobs_assigned_tasker_id_fkey(
        first_name,
        last_name,
        avatar_url,
        email,
        phone
      ),
      service:services!jobs_service_id_fkey(
        id,
        name_en,
        name_fr,
        name_ar,
        category:service_categories!services_category_id_fkey(
          id,
          name_en,
          name_fr,
          name_ar
        )
      )
    `
    )
    .eq("id", jobId)
    .eq("customer_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching job:", error);
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "jobs",
      "jobNotFound"
    );
    throw new Error(errorMessage);
  }

  const categoryName = data.service?.category?.name_en || "Unknown Category";
  const serviceName = data.service?.name_en || "Unknown Service";

  return {
    ...data,
    application_count: data.application_count?.[0]?.count || 0,
    category_name_en: categoryName,
    service_name_en: serviceName,
    street_address: data.address?.street_address,
    city: data.address?.city,
    region: data.address?.region,
    assigned_tasker_first_name: data.assigned_tasker?.first_name,
    assigned_tasker_last_name: data.assigned_tasker?.last_name,
    assigned_tasker_avatar: data.assigned_tasker?.avatar_url,
  };
}

export async function updateJobStatus(
  jobId: string,
  customerId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const { data: existingJob, error: fetchError } = await supabase
      .from("jobs")
      .select("customer_id")
      .eq("id", jobId)
      .single();

    if (fetchError || !existingJob) {
      const errorMessage = await getErrorTranslationForUser(
        customerId,
        "jobs",
        "jobNotFound"
      );
      return { success: false, error: errorMessage };
    }

    if (existingJob.customer_id !== customerId) {
      const errorMessage = await getErrorTranslationForUser(
        customerId,
        "jobs",
        "unauthorized"
      );
      return { success: false, error: errorMessage };
    }

    const { error } = await supabase
      .from("jobs")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (error) {
      console.error("Error updating job:", error);
      return {
        success: false,
        error: `Failed to update job: ${error.message}`,
      };
    }

    revalidatePath("/customer/my-jobs");
    revalidatePath(`/customer/my-jobs/${jobId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in updateJobStatus:", error);
    const errorMessage = await getErrorTranslationForUser(
      customerId,
      "jobs",
      "failedToUpdate"
    );
    return { success: false, error: errorMessage };
  }
}

export async function deleteJob(
  jobId: string,
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const { data: existingJob, error: fetchError } = await supabase
      .from("jobs")
      .select("customer_id, status, assigned_tasker_id")
      .eq("id", jobId)
      .single();

    if (fetchError || !existingJob) {
      const errorMessage = await getErrorTranslationForUser(
        customerId,
        "jobs",
        "jobNotFound"
      );
      return { success: false, error: errorMessage };
    }

    if (existingJob.customer_id !== customerId) {
      const errorMessage = await getErrorTranslationForUser(
        customerId,
        "jobs",
        "unauthorized"
      );
      return { success: false, error: errorMessage };
    }

    if (existingJob.assigned_tasker_id) {
      const errorMessage = await getErrorTranslationForUser(
        customerId,
        "jobs",
        "jobAlreadyAssigned"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    if (["in_progress", "completed"].includes(existingJob.status || "")) {
      const errorMessage = await getErrorTranslationForUser(
        customerId,
        "jobs",
        "failedToDelete"
      );
      return {
        success: false,
        error: errorMessage,
      };
    }

    const { error } = await supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      console.error("Error deleting job:", error);
      const errorMessage = await getErrorTranslationForUser(
        customerId,
        "jobs",
        "failedToDelete"
      );
      return {
        success: false,
        error: `${errorMessage}: ${error.message}`,
      };
    }

    revalidatePath("/customer/my-jobs");

    return { success: true };
  } catch (error) {
    console.error("Error in deleteJob:", error);
    const errorMessage = await getErrorTranslationForUser(
      customerId,
      "jobs",
      "failedToDelete"
    );
    return { success: false, error: errorMessage };
  }
}

export async function assignTaskerToJob(
  jobId: string,
  taskerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "jobs",
        "notAuthenticated"
      );
      return { success: false, error: errorMessage };
    }

    const { data: existingJob, error: fetchError } = await supabase
      .from("jobs")
      .select("customer_id, status")
      .eq("id", jobId)
      .single();

    if (fetchError || !existingJob) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "jobs",
        "jobNotFound"
      );
      return { success: false, error: errorMessage };
    }

    if (existingJob.customer_id !== user.id) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "jobs",
        "unauthorized"
      );
      return { success: false, error: errorMessage };
    }

    if (
      existingJob.status !== "active" &&
      existingJob.status !== "under_review"
    ) {
      return {
        success: false,
        error: "Job is no longer available for assignment",
      };
    }

    const { error } = await supabase
      .from("jobs")
      .update({
        assigned_tasker_id: taskerId,
        status: "assigned",
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (error) {
      console.error("Error assigning tasker to job:", error);
      return {
        success: false,
        error: `Failed to assign tasker: ${error.message}`,
      };
    }

    revalidatePath("/customer/my-jobs");
    revalidatePath(`/customer/my-jobs/${jobId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in assignTaskerToJob:", error);
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "jobs",
      "failedToAcceptApplication"
    );
    return { success: false, error: errorMessage };
  }
}

export interface JobApplicationWithDetails {
  id: string;
  job_id: string;
  tasker_id: string;
  proposed_price: number;
  estimated_duration: number | null;
  message: string | null;
  status: string | null;
  is_premium: boolean | null;
  created_at: string;
  updated_at: string;
  availability: string | null;
  experience_level: string | null;
  experience_description: string | null;
  availability_details: string | null;
  is_flexible_schedule: boolean | null;
  tasker_first_name: string | null;
  tasker_last_name: string | null;
  tasker_avatar_url: string | null;
  tasker_phone: string | null;
  tasker_email: string | null;
  tasker_created_at: string | null;
  tasker_verification_status: string | null;
}

export async function getJobApplications(
  jobId: string
): Promise<JobApplicationWithDetails[]> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "jobs",
        "notAuthenticated"
      );
      throw new Error(errorMessage);
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("customer_id")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "jobs",
        "jobNotFound"
      );
      throw new Error(errorMessage);
    }

    if (job.customer_id !== user.id) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "jobs",
        "unauthorized"
      );
      throw new Error(errorMessage);
    }

    const { data, error } = await supabase
      .from("job_applications")
      .select(
        `
        *,
        tasker:users!job_applications_tasker_id_fkey(
          first_name,
          last_name,
          avatar_url,
          phone,
          email,
          created_at,
          verification_status
        )
      `
      )
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching job applications:", error);
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    const applications: JobApplicationWithDetails[] = (data || []).map(
      (app: any) => {
        const tasker = app.tasker || {};

        return {
          id: String(app.id),
          job_id: String(app.job_id),
          tasker_id: String(app.tasker_id),
          proposed_price: Number(app.proposed_price || 0),
          estimated_duration: app.estimated_duration
            ? Number(app.estimated_duration)
            : null,
          message: app.message ? String(app.message) : null,
          status: app.status ? String(app.status) : null,
          is_premium: app.is_premium === true,
          created_at: app.created_at
            ? new Date(app.created_at).toISOString()
            : new Date().toISOString(),
          updated_at: app.updated_at
            ? new Date(app.updated_at).toISOString()
            : new Date().toISOString(),
          availability: app.availability ? String(app.availability) : null,
          experience_level: app.experience_level
            ? String(app.experience_level)
            : null,
          experience_description: app.experience_description
            ? String(app.experience_description)
            : null,
          availability_details: app.availability_details
            ? String(app.availability_details)
            : null,
          is_flexible_schedule: app.is_flexible_schedule === true,
          tasker_first_name: tasker.first_name
            ? String(tasker.first_name)
            : null,
          tasker_last_name: tasker.last_name
            ? String(tasker.last_name)
            : null,
          tasker_avatar_url: tasker.avatar_url
            ? String(tasker.avatar_url)
            : null,
          tasker_phone: tasker.phone ? String(tasker.phone) : null,
          tasker_email: tasker.email ? String(tasker.email) : null,
          tasker_created_at: tasker.created_at
            ? new Date(tasker.created_at).toISOString()
            : null,
          tasker_verification_status: tasker.verification_status
            ? String(tasker.verification_status)
            : null,
        };
      }
    );

    return applications;
  } catch (error) {
    console.error("Error in getJobApplications:", error);
    throw error;
  }
}

export interface CreateJobData {
  title: string;
  description: string;
  service_id: number;
  preferred_date: string;
  preferred_time_start?: string;
  preferred_time_end?: string;
  is_flexible?: boolean;
  estimated_duration?: number;
  customer_budget: number;
  currency?: string;
  address_id: string;
  max_applications?: number;
  requirements?: string;
  images?: string[];
}

export interface UpdateJobData {
  title: string;
  description: string;
  service_id: number;
  customer_budget: number;
  estimated_duration: number;
  preferred_date: string;
  preferred_time_start?: string | null;
  preferred_time_end?: string | null;
  is_flexible: boolean;
  requirements?: string | null;
}

// Zod schema for updateJob validation
const updateJobServerSchema = z.object({
  title: z.string().min(1, "Title is required").min(3, "Title must be at least 3 characters"),
  description: z.string().min(1, "Description is required").min(80, "Description must be at least 80 characters"),
  service_id: z.coerce.number().min(1, "Service ID is required"),
  customer_budget: z.coerce.number().positive("Budget must be positive").min(1, "Budget must be at least 1"),
  estimated_duration: z.coerce.number().positive("Estimated duration must be positive").min(1, "Duration must be at least 1 hour").optional(),
  preferred_date: z.string().min(1, "Preferred date is required"),
  preferred_time_start: z.string().optional().nullable(),
  preferred_time_end: z.string().optional().nullable(),
  is_flexible: z.boolean().optional(),
  requirements: z.string().optional().nullable(),
});

export async function updateJob(
  jobId: string,
  updateData: UpdateJobData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // --- VALIDATION ZOD AJOUTÉE ICI ---
    const validation = updateJobServerSchema.safeParse(updateData);
    if (!validation.success) {
      const errorDetails = Object.entries(validation.error.format())
        .filter(([key]) => key !== "_errors")
        .map(([key, value]) => {
          const err = value as { _errors: string[] };
          return `${key}: ${err._errors.join(", ")}`;
        })
        .join(" | ");

      console.error("❌ Zod Validation Failed for updateJob:", errorDetails);
      return {
        success: false,
        error: `Validation error: ${errorDetails}`,
      };
    }
    // ----------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "jobs",
        "notAuthenticated"
      );
      return { success: false, error: errorMessage };
    }

    const { data: existingJob, error: fetchError } = await supabase
      .from("jobs")
      .select("customer_id")
      .eq("id", jobId)
      .single();

    if (fetchError || !existingJob) {
      return { success: false, error: "Job not found" };
    }

    if (existingJob.customer_id !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
      .from("jobs")
      .update({
        title: updateData.title.trim(),
        description: updateData.description.trim(),
        service_id: updateData.service_id,
        customer_budget: updateData.customer_budget,
        estimated_duration: updateData.estimated_duration,
        preferred_date: updateData.preferred_date,
        preferred_time_start: updateData.preferred_time_start || null,
        preferred_time_end: updateData.preferred_time_end || null,
        is_flexible: updateData.is_flexible,
        requirements: updateData.requirements?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (error) {
      console.error("Error updating job:", error);
      return {
        success: false,
        error: `Failed to update job: ${error.message}`,
      };
    }

    revalidatePath("/customer/my-jobs");
    revalidatePath(`/customer/my-jobs/${jobId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in updateJob:", error);
    return { success: false, error: "Failed to update job" };
  }
}

// -------------------------------------------------------------
// SEUL CHANGEMENT : Introduction du schéma Zod pour createJob
// -------------------------------------------------------------
const createJobServerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  // z.coerce permet de gérer les cas où un string "1" est envoyé pour un number
  service_id: z.coerce.number().min(1, "Service ID is required"),
  preferred_date: z.string().min(1, "Preferred date is required"),
  preferred_time_start: z.string().optional(),
  preferred_time_end: z.string().optional(),
  is_flexible: z.boolean().optional(),
  estimated_duration: z.coerce.number().optional(),
  customer_budget: z.coerce.number().positive("Budget must be positive"),
  currency: z.string().optional(),
  // z.coerce.string() permet de gérer l'ID adresse (string ou number dans le form)
  address_id: z.coerce.string().min(1, "Address ID is required"),
  max_applications: z.coerce.number().optional(),
  requirements: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export async function createJob(
  jobData: CreateJobData
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  const supabase = await createClient();

  try {
    // --- VALIDATION ZOD AJOUTÉE ICI ---
    const validation = createJobServerSchema.safeParse(jobData);
    if (!validation.success) {
      const errorDetails = Object.entries(validation.error.format())
        .filter(([key]) => key !== "_errors")
        .map(([key, value]) => {
          const err = value as { _errors: string[] };
          return `${key}: ${err._errors.join(", ")}`;
        })
        .join(" | ");

      console.error("❌ Zod Validation Failed:", errorDetails);
      return {
        success: false,
        error: `Validation error: ${errorDetails}`,
      };
    }
    // ----------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "jobs",
        "notAuthenticated"
      );
      return { success: false, error: errorMessage };
    }

    // Verify the service exists in the services table
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("id, name_en")
      .eq("id", jobData.service_id)
      .single();

    if (serviceError || !service) {
      console.error("Service validation error:", {
        serviceError,
        serviceId: jobData.service_id,
        message: `Service with ID ${jobData.service_id} does not exist in the services table.`,
      });
      return {
        success: false,
        error: `The selected service is not available. Please refresh the page and select a different service.`,
      };
    }

    // Verify the address belongs to the customer
    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .select("id")
      .eq("id", jobData.address_id)
      .eq("user_id", user.id)
      .single();

    if (addressError || !address) {
      return { success: false, error: "Invalid address selected" };
    }

    // Create the job
    const estimatedDurationInt = jobData.estimated_duration
      ? Math.round(jobData.estimated_duration)
      : null;

    const { data: newJob, error: jobError } = await supabase
      .from("jobs")
      .insert({
        customer_id: user.id,
        service_id: jobData.service_id,
        title: jobData.title.trim(),
        description: jobData.description.trim(),
        preferred_date: jobData.preferred_date,
        preferred_time_start: jobData.preferred_time_start || null,
        preferred_time_end: jobData.preferred_time_end || null,
        is_flexible: jobData.is_flexible || false,
        estimated_duration: estimatedDurationInt,
        customer_budget: jobData.customer_budget,
        currency: jobData.currency || "MAD",
        address_id: jobData.address_id,
        max_applications: jobData.max_applications || 3,
        requirements: jobData.requirements?.trim() || null,
        images: jobData.images || null,
        status: "under_review",
      })
      .select("id")
      .single();

    if (jobError) {
      console.error("Error creating job:", jobError);
      return {
        success: false,
        error: `Failed to create job: ${jobError.message}`,
      };
    }

    // Create job application count record
    const { error: countError } = await supabase
      .from("job_application_counts")
      .insert({
        job_id: newJob.id,
        application_count: 0,
      });

    if (countError) {
      console.error("Error creating job application count:", countError);
    }

    revalidatePath("/customer/my-jobs");
    revalidatePath("/customer/dashboard");

    return { success: true, jobId: newJob.id };
  } catch (error) {
    console.error("Error in createJob:", error);
    return { success: false, error: "Failed to create job" };
  }
}

export async function acceptJobApplication(
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "jobs",
        "notAuthenticated"
      );
      return { success: false, error: errorMessage };
    }

    const { data: application, error: appError } = await supabase
      .from("job_applications")
      .select(
        `
        *,
        job:jobs!job_applications_job_id_fkey(
          id,
          title,
          customer_id,
          assigned_tasker_id,
          status
        )
      `
      )
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      return { success: false, error: "Application not found" };
    }

    if (application.job.customer_id !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (application.job.assigned_tasker_id) {
      return { success: false, error: "Job already has an assigned tasker" };
    }

    const { error: updateAppError } = await supabase
      .from("job_applications")
      .update({
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateAppError) {
      console.error("Error updating application:", updateAppError);
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "jobs",
        "failedToAcceptApplication"
      );
      return { success: false, error: errorMessage };
    }

    const { error: updateJobError } = await supabase
      .from("jobs")
      .update({
        assigned_tasker_id: application.tasker_id,
        final_price: application.proposed_price,
        status: "assigned",
        updated_at: new Date().toISOString(),
      })
      .eq("id", application.job_id);

    if (updateJobError) {
      console.error("Error updating job:", updateJobError);
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "jobs",
        "failedToAcceptApplication"
      );
      return { success: false, error: errorMessage };
    }

    const { error: rejectOthersError } = await supabase
      .from("job_applications")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("job_id", application.job_id)
      .neq("id", applicationId);

    if (rejectOthersError) {
      console.error("Error rejecting other applications:", rejectOthersError);
    }

    const jobTitle = (application.job as any)?.title || "the job";
    const notificationTranslations = await getNotificationTranslationsForUser(
      application.tasker_id,
      "application_accepted",
      { jobTitle }
    );
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: application.tasker_id,
        type: "application_accepted",
        title: notificationTranslations.title,
        message: notificationTranslations.message,
        related_job_id: application.job_id,
        is_read: false,
      });

    if (notificationError) {
      console.error("Error creating notification (application_accepted):", {
        message: notificationError.message,
        code: notificationError.code,
        details: notificationError.details,
        hint: notificationError.hint,
        taskerId: application.tasker_id,
        jobId: application.job_id,
      });
    } else {
      console.log("Notification created successfully (application_accepted):", {
        taskerId: application.tasker_id,
        jobId: application.job_id,
      });
    }

    revalidatePath(`/customer/my-jobs/${application.job_id}/applications`);
    revalidatePath("/customer/my-jobs");
    revalidatePath("/tasker/my-jobs");
    revalidatePath("/tasker/notifications");

    return { success: true };
  } catch (error) {
    console.error("Error in acceptJobApplication:", error);
    return { success: false, error: "Failed to accept application" };
  }
}

export async function rejectJobApplication(
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "jobs",
        "notAuthenticated"
      );
      return { success: false, error: errorMessage };
    }

    const { data: application, error: appError } = await supabase
      .from("job_applications")
      .select(
        `
        *,
        job:jobs!job_applications_job_id_fkey(
          customer_id
        )
      `
      )
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      return { success: false, error: "Application not found" };
    }

    if (application.job.customer_id !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const { error: updateError } = await supabase
      .from("job_applications")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Error updating application:", updateError);
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "jobs",
        "failedToRejectApplication"
      );
      return { success: false, error: errorMessage };
    }

    revalidatePath(`/customer/my-jobs/${application.job_id}/applications`);
    revalidatePath("/customer/my-jobs");

    return { success: true };
  } catch (error) {
    console.error("Error in rejectJobApplication:", error);
    return { success: false, error: "Failed to reject application" };
  }
}

export interface CreateJobApplicationData {
  job_id: string;
  proposed_price: number;
  estimated_duration?: number;
  message?: string;
  availability?: string;
  experience_level?: string;
  experience_description?: string;
  availability_details?: string;
  is_flexible_schedule?: boolean;
}

export async function createJobApplication(
  applicationData: CreateJobApplicationData
): Promise<{ success: boolean; applicationId?: string; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "jobs",
        "notAuthenticated"
      );
      return { success: false, error: errorMessage };
    }

    const { data: dbUser, error: dbUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    let dbUserByEmail = null;
    if ((dbUserError || !dbUser) && user.email) {
      const { data: emailUser } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", user.email)
        .maybeSingle();
      dbUserByEmail = emailUser;

      if (emailUser && emailUser.id !== user.id) {
        console.warn("ID mismatch detected:", {
          authId: user.id,
          dbId: emailUser.id,
          email: user.email,
        });
      }
    }

    if (dbUserError || (!dbUser && !dbUserByEmail)) {
      console.log("User not found in users table, creating...", {
        userId: user.id,
        email: user.email,
        role: user.user_metadata?.role,
      });

      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            id: user.id,
            email: user.email || "",
            role:
              (user.user_metadata?.role as "customer" | "tasker") || "tasker",
            email_verified: user.email_confirmed_at ? true : false,
            is_active: true,
            preferred_language: "en",
            verification_status: "pending",
            wallet_balance: 0,
          },
        ])
        .select("id")
        .single();

      if (createError) {
        console.error("Failed to create user in users table:", {
          error: createError,
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint,
        });

        if (createError.code === "23505" && user.email) {
          console.log("User already exists (duplicate), fetching by email...");
          const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .maybeSingle();

          if (existingUser) {
            console.log("Found existing user by email, continuing...");
          } else {
            return {
              success: false,
              error: `Your account is not properly set up: ${createError.message}. Please contact support.`,
            };
          }
        } else {
          return {
            success: false,
            error: `Your account is not properly set up: ${createError.message}. Please contact support.`,
          };
        }
      } else if (!newUser) {
        console.error("User creation returned no data");
        return {
          success: false,
          error: "Your account is not properly set up. Please contact support.",
        };
      } else {
        console.log("User created successfully in users table");
      }
    } else if (dbUserByEmail && dbUserByEmail.id !== user.id) {
      console.warn("User exists with different ID, using existing user:", {
        authId: user.id,
        dbId: dbUserByEmail.id,
        email: user.email,
      });
    }

    if (!applicationData.job_id) {
      return { success: false, error: "Job ID is required" };
    }
    if (
      !applicationData.proposed_price ||
      applicationData.proposed_price <= 0
    ) {
      return { success: false, error: "Valid proposed price is required" };
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(
        "id, customer_id, status, assigned_tasker_id, max_applications, current_applications, title"
      )
      .eq("id", applicationData.job_id)
      .single();

    if (jobError || !job) {
      return { success: false, error: "Job not found" };
    }

    if (job.customer_id === user.id) {
      return { success: false, error: "You cannot apply to your own job" };
    }

    if (job.status !== "active" && job.status !== "under_review") {
      return {
        success: false,
        error: "Job is no longer accepting applications",
      };
    }

    if (job.assigned_tasker_id) {
      return { success: false, error: "Job already has an assigned tasker" };
    }

    const { data: existingApplication, error: existingError } = await supabase
      .from("job_applications")
      .select("id")
      .eq("job_id", applicationData.job_id)
      .eq("tasker_id", user.id)
      .single();

    if (existingApplication && !existingError) {
      return { success: false, error: "You have already applied to this job" };
    }

    if (
      job.max_applications &&
      job.current_applications >= job.max_applications
    ) {
      return {
        success: false,
        error: "Job has reached maximum application limit",
      };
    }

    const { data: finalUserCheck, error: finalUserCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (finalUserCheckError) {
      console.error("Error verifying user before application creation:", {
        userId: user.id,
        error: finalUserCheckError,
      });
      return {
        success: false,
        error:
          "Error verifying your account. Please try again or contact support.",
      };
    }

    if (!finalUserCheck) {
      console.error(
        "User does not exist in users table before application creation:",
        {
          userId: user.id,
          email: user.email,
        }
      );
      return {
        success: false,
        error: "Your account is not properly set up. Please contact support.",
      };
    }

    const estimatedDurationInt = applicationData.estimated_duration
      ? Math.round(applicationData.estimated_duration)
      : null;

    console.log("Creating job application with:", {
      job_id: applicationData.job_id,
      tasker_id: user.id,
      user_exists: !!finalUserCheck,
    });

    const { data: newApplication, error: applicationError } = await supabase
      .from("job_applications")
      .insert({
        job_id: applicationData.job_id,
        tasker_id: user.id,
        proposed_price: applicationData.proposed_price,
        estimated_duration: estimatedDurationInt,
        message: applicationData.message?.trim() || null,
        availability: applicationData.availability?.trim() || null,
        experience_level: applicationData.experience_level || null,
        experience_description:
          applicationData.experience_description?.trim() || null,
        availability_details:
          applicationData.availability_details?.trim() || null,
        is_flexible_schedule: applicationData.is_flexible_schedule || false,
        status: "pending",
      })
      .select("id")
      .single();

    if (applicationError) {
      console.error("Error creating job application:", {
        error: applicationError,
        code: applicationError.code,
        message: applicationError.message,
        details: applicationError.details,
        hint: applicationError.hint,
        userId: user.id,
        userExists: !!finalUserCheck,
      });

      if (applicationError.code === "23503") {
        return {
          success: false,
          error:
            "Your account is not properly set up. The system cannot verify your user account. Please contact support.",
        };
      }

      return {
        success: false,
        error: `Failed to create application: ${applicationError.message}`,
      };
    }

    const { error: updateCountError } = await supabase
      .from("jobs")
      .update({
        current_applications: (job.current_applications || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationData.job_id);

    if (updateCountError) {
      console.error("Error updating job application count:", updateCountError);
    }

    if (job.customer_id) {
      const jobTitle = job.title || "your job";
      const notificationTranslations = await getNotificationTranslationsForUser(
        job.customer_id,
        "application_received",
        { jobTitle }
      );
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: job.customer_id,
          type: "application_received",
          title: notificationTranslations.title,
          message: notificationTranslations.message,
          related_job_id: applicationData.job_id,
          is_read: false,
        });

      if (notificationError) {
        console.error("Error creating notification (application_received):", {
          message: notificationError.message,
          code: notificationError.code,
          details: notificationError.details,
          hint: notificationError.hint,
          customerId: job.customer_id,
          jobId: applicationData.job_id,
        });
      } else {
        console.log("Notification created successfully (application_received):", {
          customerId: job.customer_id,
          jobId: applicationData.job_id,
        });
      }
    }

    revalidatePath(`/job-offer/${applicationData.job_id}`);
    revalidatePath("/tasker/my-jobs");
    revalidatePath("/customer/my-jobs");
    revalidatePath("/customer/notifications");

    return { success: true, applicationId: newApplication.id };
  } catch (error) {
    console.error("Error in createJobApplication:", error);
    return { success: false, error: "Failed to create job application" };
  }
}

export async function startJob(
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "jobs",
        "notAuthenticated"
      );
      return { success: false, error: errorMessage };
    }

    const taskerId = user.id;

    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select("id, assigned_tasker_id, status, customer_id, title")
      .eq("id", jobId)
      .single();

    if (fetchError || !job) {
      return { success: false, error: "Job not found" };
    }

    if (job.assigned_tasker_id !== taskerId) {
      return {
        success: false,
        error: "You are not assigned to this job",
      };
    }

    if (job.status !== "assigned") {
      return {
        success: false,
        error: `Job must be in 'assigned' status to start. Current status: ${job.status}`,
      };
    }

    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        status: "in_progress",
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (updateError) {
      console.error("Error starting job:", {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
      });
      return {
        success: false,
        error: `Failed to start job: ${updateError.message}${
          updateError.hint ? ` (${updateError.hint})` : ""
        }`,
      };
    }

    if (job.customer_id) {
      const jobTitle = job.title || "your job";
      const notificationTranslations = await getNotificationTranslationsForUser(
        job.customer_id,
        "job_started",
        { jobTitle }
      );
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: job.customer_id,
          type: "job_started",
          title: notificationTranslations.title,
          message: notificationTranslations.message,
          related_job_id: jobId,
          is_read: false,
        });

      if (notificationError) {
        console.error("Error creating notification (job_started):", {
          message: notificationError.message,
          code: notificationError.code,
          details: notificationError.details,
          hint: notificationError.hint,
          customerId: job.customer_id,
          jobId: jobId,
        });
      } else {
        console.log("Notification created successfully (job_started):", {
          customerId: job.customer_id,
          jobId: jobId,
        });
      }
    }

    revalidatePath("/tasker/my-jobs");
    revalidatePath(`/tasker/my-jobs/${jobId}`);
    revalidatePath("/customer/my-jobs");
    revalidatePath(`/customer/my-jobs/${jobId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in startJob:", error);
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "jobs",
      "failedToStart"
    );
    return { success: false, error: errorMessage };
  }
}

export async function completeJob(
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "jobs",
        "notAuthenticated"
      );
      return { success: false, error: errorMessage };
    }

    const taskerId = user.id;

    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select("id, assigned_tasker_id, status, customer_id, title")
      .eq("id", jobId)
      .single();

    if (fetchError || !job) {
      return { success: false, error: "Job not found" };
    }

    if (job.assigned_tasker_id !== taskerId) {
      return {
        success: false,
        error: "You are not assigned to this job",
      };
    }

    if (job.status !== "in_progress") {
      return {
        success: false,
        error: `Job must be in 'in_progress' status to complete. Current status: ${job.status}`,
      };
    }

    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (updateError) {
      console.error("Error completing job:", {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
      });
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "jobs",
        "failedToComplete"
      );
      return {
        success: false,
        error: `${errorMessage}: ${updateError.message}${
          updateError.hint ? ` (${updateError.hint})` : ""
        }`,
      };
    }

    if (job.customer_id) {
      const jobTitle = job.title || "your job";
      const notificationTranslations = await getNotificationTranslationsForUser(
        job.customer_id,
        "job_completed",
        { jobTitle }
      );
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: job.customer_id,
          type: "job_completed",
          title: notificationTranslations.title,
          message: notificationTranslations.message,
          related_job_id: jobId,
          is_read: false,
        });

      if (notificationError) {
        console.error("Error creating notification (job_completed):", {
          message: notificationError.message,
          code: notificationError.code,
          details: notificationError.details,
          hint: notificationError.hint,
          customerId: job.customer_id,
          jobId: jobId,
        });
      } else {
        console.log("Notification created successfully (job_completed):", {
          customerId: job.customer_id,
          jobId: jobId,
        });
      }
    }

    revalidatePath("/tasker/my-jobs");
    revalidatePath(`/tasker/my-jobs/${jobId}`);
    revalidatePath("/customer/my-jobs");
    revalidatePath(`/customer/my-jobs/${jobId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in completeJob:", error);
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "jobs",
      "failedToComplete"
    );
    return { success: false, error: errorMessage };
  }
}

export async function confirmJobCompletion(
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "jobs",
        "notAuthenticated"
      );
      return { success: false, error: errorMessage };
    }

    const customerId = user.id;

    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select(
        "id, customer_id, status, completed_at, customer_confirmed_at, title, assigned_tasker_id, final_price, customer_budget, currency"
      )
      .eq("id", jobId)
      .single();

    if (fetchError || !job) {
      return { success: false, error: "Job not found" };
    }

    if (job.customer_id !== customerId) {
      return {
        success: false,
        error: "You are not authorized to confirm this job",
      };
    }

    if (job.status !== "completed") {
      return {
        success: false,
        error: `Job must be in 'completed' status to confirm. Current status: ${job.status}`,
      };
    }

    if (!job.completed_at) {
      return {
        success: false,
        error: "The tasker has not yet completed this job",
      };
    }

    if (job.customer_confirmed_at) {
      return {
        success: false,
        error: "This job has already been confirmed",
      };
    }

    const taskerId = String(job.assigned_tasker_id || "");
    const finalPrice = Number(job.final_price || job.customer_budget || 0);
    const currency = String(job.currency || "MAD");
    const jobTitle = String(job.title || "the job");

    console.log("🔍 Job confirmation data:", {
      jobId,
      taskerId,
      finalPrice,
      customerBudget: job.customer_budget,
      finalPriceFromJob: job.final_price,
      hasTaskerId: !!taskerId,
      hasPrice: finalPrice > 0,
    });

    let taskerWalletBalance = 0;
    if (taskerId) {
      const { data: taskerData, error: taskerError } = await supabase
        .from("users")
        .select("wallet_balance")
        .eq("id", taskerId)
        .single();

      if (taskerError) {
        console.error("Error fetching tasker wallet balance:", taskerError);
      } else {
        taskerWalletBalance = taskerData?.wallet_balance || 0;
      }
    }

    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        customer_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (updateError) {
      console.error("Error confirming job completion:", {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
      });
      return {
        success: false,
        error: `Failed to confirm job completion: ${updateError.message}${
          updateError.hint ? ` (${updateError.hint})` : ""
        }`,
      };
    }

    console.log("✅ Job confirmed: customer_confirmed_at set");

    if (taskerId && finalPrice > 0) {
      const platformFeeRate = 0.1;
      const totalAmount = finalPrice;
      const platformFee = totalAmount * platformFeeRate;
      const netAmount = totalAmount - platformFee;

      console.log("💰 Processing payment for job:", {
        jobId,
        taskerId,
        customerId,
        totalAmount,
        platformFee,
        netAmount,
        currentWalletBalance: taskerWalletBalance,
      });

      console.log("💳 Attempting to create transaction:", {
        job_id: jobId,
        booking_id: null,
        payer_id: customerId,
        payee_id: taskerId,
        transaction_type: "job_payment",
        amount: totalAmount,
        platform_fee: platformFee,
        payment_status: "paid",
      });

      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          job_id: jobId,
          booking_id: null,
          payer_id: customerId,
          payee_id: taskerId,
          transaction_type: "job_payment",
          amount: totalAmount,
          platform_fee: platformFee,
          payment_status: "paid",
          processed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (transactionError) {
        console.error(
          "❌ CRITICAL: Error creating transaction for job completion:",
          {
            message: transactionError.message,
            code: transactionError.code,
            details: transactionError.details,
            hint: transactionError.hint,
            jobId,
            taskerId,
            customerId,
            totalAmount,
            platformFee,
          }
        );
      } else {
        console.log("✅ Transaction created successfully:", {
          transactionId: transaction?.id,
          jobId: transaction?.job_id,
          amount: transaction?.amount,
          platformFee: transaction?.platform_fee,
        });
      }

      const newWalletBalance = taskerWalletBalance - platformFee;

      console.log(`[confirmJobCompletion] Wallet update calculation:`, {
        taskerId,
        currentBalance: taskerWalletBalance,
        platformFee,
        newBalance: newWalletBalance,
        jobId,
        transactionId: transaction?.id,
      });

      if (newWalletBalance < 0) {
        console.error("❌ CRITICAL: Wallet balance would be negative:", {
          taskerId,
          currentBalance: taskerWalletBalance,
          platformFee,
          newBalance: newWalletBalance,
        });
        return {
          success: false,
          error: `Insufficient wallet balance. Current: ${taskerWalletBalance} MAD, Fee: ${platformFee} MAD`,
        };
      }

      let walletUpdateError;
      let walletUpdateSuccess = false;

      const serviceSupabase = createServiceRoleClient();
      if (serviceSupabase) {
        try {
          console.log(
            `[confirmJobCompletion] Attempting wallet update with service role client for tasker ${taskerId}`
          );
          const result = await serviceSupabase
            .from("users")
            .update({ wallet_balance: newWalletBalance })
            .eq("id", taskerId)
            .select("wallet_balance");
          walletUpdateError = result.error;
          if (!walletUpdateError && result.data && result.data.length > 0) {
            walletUpdateSuccess = true;
            console.log(
              `[confirmJobCompletion] ✅ Wallet updated successfully. New balance: ${result.data[0].wallet_balance}`
            );
          }
        } catch (serviceRoleError) {
          console.error("❌ Error using service role client:", serviceRoleError);
          walletUpdateError =
            serviceRoleError instanceof Error
              ? serviceRoleError
              : new Error(String(serviceRoleError));
        }
      }

      if (!walletUpdateSuccess && !serviceSupabase) {
        console.warn(
          "⚠️ Service role client not available, attempting with regular client (RLS must allow wallet_balance updates)"
        );
        const { error, data } = await supabase
          .from("users")
          .update({ wallet_balance: newWalletBalance })
          .eq("id", taskerId)
          .select("wallet_balance");
        walletUpdateError = error;
        if (!walletUpdateError && data && data.length > 0) {
          walletUpdateSuccess = true;
          console.log(
            `[confirmJobCompletion] ✅ Wallet updated successfully with regular client. New balance: ${data[0].wallet_balance}`
          );
        } else if (walletUpdateError) {
          console.error(
            "❌ Regular client also failed to update wallet:",
            walletUpdateError
          );
        }
      }

      if (walletUpdateError) {
        console.error("❌ CRITICAL: Error updating tasker wallet balance:", {
          error: walletUpdateError,
          errorMessage: walletUpdateError.message,
          errorCode: (walletUpdateError as any).code,
          errorDetails: (walletUpdateError as any).details,
          taskerId,
          currentBalance: taskerWalletBalance,
          platformFee,
          newBalance: newWalletBalance,
        });
        return {
          success: false,
          error: `Failed to update wallet: ${walletUpdateError.message}`,
        };
      }

      if (!walletUpdateSuccess) {
        console.error(
          "❌ CRITICAL: Wallet update appeared to succeed but no data returned:",
          {
            taskerId,
            currentBalance: taskerWalletBalance,
            platformFee,
            newBalance: newWalletBalance,
            walletUpdateError,
          }
        );
        try {
          const verifySupabase = createServiceRoleClient();
          if (!verifySupabase) {
            console.error("❌ CRITICAL: Could not create service role client for verification");
            return {
              success: false,
              error: "Service role client not available for verification",
            };
          }
          const { data: verifyData, error: verifyError } = await verifySupabase
            .from("users")
            .select("wallet_balance")
            .eq("id", taskerId)
            .single();

          if (verifyError) {
            console.error(
              "❌ CRITICAL: Could not verify wallet update:",
              verifyError
            );
            return {
              success: false,
              error: `Wallet update verification failed: ${verifyError.message}`,
            };
          }

          if (
            verifyData &&
            parseFloat(String(verifyData.wallet_balance)) !== newWalletBalance
          ) {
            console.error("❌ CRITICAL: Wallet was NOT updated correctly!", {
              expected: newWalletBalance,
              actual: verifyData.wallet_balance,
              taskerId,
            });
            return {
              success: false,
              error: `Wallet update failed: Expected ${newWalletBalance} but got ${verifyData.wallet_balance}`,
            };
          } else {
            console.log(
              `✅ Wallet update verified: ${verifyData.wallet_balance}`
            );
            walletUpdateSuccess = true;
          }
        } catch (verifyException) {
          console.error(
            "❌ CRITICAL: Exception verifying wallet update:",
            verifyException
          );
          return {
            success: false,
            error: `Wallet update verification exception: ${
              verifyException instanceof Error
                ? verifyException.message
                : "Unknown error"
            }`,
          };
        }
      }

      if (walletUpdateSuccess) {
        console.log(
          `✅ Tasker ${taskerId} wallet updated: ${taskerWalletBalance} - ${platformFee} (fees) = ${newWalletBalance}`
        );

        try {
          console.log(
            `[confirmJobCompletion] Attempting to insert wallet_transaction for tasker ${taskerId}, amount: -${platformFee}`
          );
          const serviceSupabase = createServiceRoleClient();
          if (!serviceSupabase) {
            console.warn(
              "⚠️ Service role client not available, skipping wallet_transaction logging"
            );
          } else {
            const { data: walletTxData, error: walletTxError } =
              await serviceSupabase
                .from("wallet_transactions")
                .insert({
                  user_id: taskerId,
                  amount: -platformFee,
                  type: "fee_deduction",
                  related_job_id: jobId,
                  notes: `Platform fee (10%) deducted for job payment. Transaction ID: ${
                    transaction?.id || "N/A"
                  }`,
                })
                .select()
                .single();

            if (walletTxError) {
              console.error(
                "❌ CRITICAL: Failed to insert wallet_transaction:",
                {
                  error: walletTxError,
                  errorMessage: walletTxError.message,
                  errorCode: walletTxError.code,
                  errorDetails: walletTxError.details,
                  errorHint: walletTxError.hint,
                  taskerId,
                  platformFee,
                  jobId,
                  transactionId: transaction?.id,
                }
              );
            } else {
              console.log(
                `✅ Wallet transaction logged successfully: ID ${walletTxData?.id} for tasker ${taskerId}, amount: -${platformFee}`
              );
            }
          }
        } catch (walletTransactionError) {
          console.error("❌ CRITICAL: Exception inserting wallet_transaction:", {
            error: walletTransactionError,
            errorMessage:
              walletTransactionError instanceof Error
                ? walletTransactionError.message
                : String(walletTransactionError),
            taskerId,
            platformFee,
            jobId,
          });
        }
      }

      const { data: taskerStats, error: taskerStatsFetchError } = await supabase
        .from("user_stats")
        .select("completed_jobs, total_earnings")
        .eq("id", taskerId)
        .maybeSingle();

      if (
        taskerStatsFetchError &&
        taskerStatsFetchError.code !== "PGRST116"
      ) {
        console.error("Error fetching tasker stats:", taskerStatsFetchError);
      } else {
        const currentCompletedJobs = taskerStats?.completed_jobs || 0;
        const currentTotalEarnings = parseFloat(
          String(taskerStats?.total_earnings || 0)
        );

        const { error: taskerStatsUpdateError } = await supabase
          .from("user_stats")
          .upsert(
            {
              id: taskerId,
              completed_jobs: currentCompletedJobs + 1,
              total_earnings: currentTotalEarnings + netAmount,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "id",
            }
          );

        if (taskerStatsUpdateError) {
          console.error("Error updating tasker stats:", taskerStatsUpdateError);
        } else {
          console.log(
            `✅ Tasker ${taskerId} stats updated: completed_jobs=${
              currentCompletedJobs + 1
            }, total_earnings=${currentTotalEarnings + netAmount}`
          );
        }
      }

      const { data: customerStats, error: customerStatsFetchError } =
        await supabase
          .from("user_stats")
          .select("total_spent")
          .eq("id", customerId)
          .maybeSingle();

      if (
        customerStatsFetchError &&
        customerStatsFetchError.code !== "PGRST116"
      ) {
        console.error("Error fetching customer stats:", customerStatsFetchError);
      } else {
        const currentTotalSpent = parseFloat(
          String(customerStats?.total_spent || 0)
        );

        const { error: customerStatsUpdateError } = await supabase
          .from("user_stats")
          .upsert(
            {
              id: customerId,
              total_spent: currentTotalSpent + totalAmount,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "id",
            }
          );

        if (customerStatsUpdateError) {
          console.error(
            "Error updating customer stats:",
            customerStatsUpdateError
          );
        } else {
          console.log(
            `✅ Customer ${customerId} stats updated: total_spent=${
              currentTotalSpent + totalAmount
            }`
          );
        }
      }

      const customerPaymentTranslations = await getNotificationTranslationsForUser(
        customerId,
        "payment_received",
        { amount: totalAmount, currency, jobTitle }
      );
      const { error: customerPaymentNotificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: customerId,
          type: "payment_received",
          title: customerPaymentTranslations.title,
          message: customerPaymentTranslations.message,
          related_job_id: jobId,
          is_read: false,
        });
      if (customerPaymentNotificationError) {
        console.error(
          "Error creating customer payment notification:",
          customerPaymentNotificationError
        );
      }

      const taskerLocale = await getUserLocale(taskerId);
      const taskerConfirmedTitle = await getTranslatedString(
        taskerLocale,
        "notifications.titles.jobConfirmedByCustomer",
        {}
      );
      const taskerConfirmedMessage = await getTranslatedString(
        taskerLocale,
        "notifications.messages.jobConfirmedByCustomer",
        { jobTitle }
      );
      const { error: taskerNotificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: taskerId,
          type: "job_completed",
          title: taskerConfirmedTitle,
          message: taskerConfirmedMessage,
          related_job_id: jobId,
          is_read: false,
        });
      if (taskerNotificationError) {
        console.error(
          "Error creating tasker notification:",
          taskerNotificationError
        );
      }
    } else {
      console.warn("⚠️ Payment processing skipped:", {
        hasTaskerId: !!taskerId,
        hasFinalPrice: !!finalPrice,
      });
    }

    revalidatePath("/customer/my-jobs");
    revalidatePath(`/customer/my-jobs/${jobId}`);
    revalidatePath("/tasker/my-jobs");
    revalidatePath(`/tasker/my-jobs/${jobId}`);
    revalidatePath("/tasker/finance");
    revalidatePath("/tasker/dashboard");
    revalidatePath("/customer/finance");

    return { success: true };
  } catch (error) {
    console.error("Error in confirmJobCompletion:", error);
    const errorMessage = await getErrorTranslationForUser(
      undefined,
      "jobs",
      "failedToConfirm"
    );
    return { success: false, error: errorMessage };
  }
}

export async function approveJobByAdmin(
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "jobs",
        "notAuthenticated"
      );
      return { success: false, error: errorMessage };
    }

    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userDataError || !userData) {
      return { success: false, error: "Failed to verify user" };
    }

    if (userData.role !== "admin") {
      return { success: false, error: "Only admins can approve jobs" };
    }

    const { data: job, error: fetchError } = await supabase
      .from("jobs")
      .select("id, customer_id, status, title")
      .eq("id", jobId)
      .single();

    if (fetchError || !job) {
      return { success: false, error: "Job not found" };
    }

    if (job.status !== "under_review") {
      return {
        success: false,
        error: `Job cannot be approved. Current status: ${job.status}. Only jobs with status "under_review" can be approved.`,
      };
    }

    const { error: updateError } = await supabase
      .from("jobs")
      .update({
        status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (updateError) {
      console.error("Error approving job:", {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
      });
      return {
        success: false,
        error: `Failed to approve job: ${updateError.message}${
          updateError.hint ? ` (${updateError.hint})` : ""
        }`,
      };
    }

    if (job.customer_id) {
      const jobTitle = job.title || "your job";
      const notificationTranslations = await getNotificationTranslationsForUser(
        job.customer_id,
        "job_approved",
        { jobTitle }
      );
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: job.customer_id,
          type: "job_approved",
          title: notificationTranslations.title,
          message: notificationTranslations.message,
          related_job_id: jobId,
          is_read: false,
        });

      if (notificationError) {
        console.error("Error creating notification (job_approved):", {
          message: notificationError.message,
          code: notificationError.code,
          details: notificationError.details,
          hint: notificationError.hint,
          customerId: job.customer_id,
          jobId: jobId,
        });
      } else {
        console.log("Notification created successfully (job_approved):", {
          customerId: job.customer_id,
          jobId: jobId,
        });
      }
    }

    revalidatePath("/customer/my-jobs");
    revalidatePath(`/customer/my-jobs/${jobId}`);
    revalidatePath("/customer/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error in approveJobByAdmin:", error);
    return { success: false, error: "Failed to approve job" };
  }
}

export async function getTaskerJobs(
  taskerId: string,
  limit: number = 10,
  offset: number = 0,
  includeTotal: boolean = true
): Promise<{
  jobs: JobWithDetails[];
  total: number;
  hasMore: boolean;
}> {
  const supabase = await createClient();

  const { data: acceptedApplications, error: acceptedAppsError } =
    await supabase
      .from("job_applications")
      .select("job_id")
      .eq("tasker_id", taskerId)
      .eq("status", "accepted");

  const acceptedJobIds = acceptedAppsError
    ? []
    : (acceptedApplications || [])
        .map((app) => app.job_id)
        .filter((id) => id !== null);

  const { data: assignedJobs, error: assignedError } = await supabase
    .from("jobs")
    .select("id")
    .eq("assigned_tasker_id", taskerId);

  if (assignedError) {
    console.error("Error fetching assigned jobs:", assignedError);
  }

  const assignedJobIds = (assignedJobs || []).map((job) => job.id);

  const allJobIds = [...new Set([...assignedJobIds, ...acceptedJobIds])];

  let total = 0;
  if (includeTotal || offset === 0) {
    if (allJobIds.length > 0) {
      const { count, error: countError } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .in("id", allJobIds);

      if (countError) {
        console.error("Error fetching tasker jobs count:", countError);
        throw new Error(
          `Failed to fetch tasker jobs count: ${countError.message}`
        );
      }
      total = count || 0;
    } else {
      total = 0;
    }
  }

  let query = supabase.from("jobs").select(
    `
      *,
      application_count:job_applications(count),
      address:addresses(
        street_address,
        city,
        region
      ),
      customer:users!jobs_customer_id_fkey(
        id,
        first_name,
        last_name,
        avatar_url,
        email,
        phone
      ),
      service:services!jobs_service_id_fkey(
        id,
        name_en,
        category_id,
        category:service_categories!services_category_id_fkey(
          name_en
        )
      )
    `
  );

  if (allJobIds.length > 0) {
    query = query.in("id", allJobIds);
  } else {
    query = query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  const { data: allJobs, error: fetchError } = await query;

  if (fetchError) {
    console.error("Error fetching tasker jobs:", fetchError);
    throw new Error(`Failed to fetch tasker jobs: ${fetchError.message}`);
  }

  const statusPriority: Record<string, number> = {
    assigned: 1,
    in_progress: 2,
    completed: 3,
  };

  const sortedJobs = (allJobs || []).sort((a, b) => {
    const statusA = statusPriority[a.status || ""] || 999;
    const statusB = statusPriority[b.status || ""] || 999;

    if (statusA !== statusB) {
      return statusA - statusB;
    }

    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  });

  const paginatedJobs = sortedJobs.slice(offset, offset + limit);
  const hasMore = sortedJobs.length > offset + limit;
  const jobs = paginatedJobs;

  const formattedJobs: JobWithDetails[] = jobs.map((job) => {
    const service = job.service as any;
    const categoryName =
      service?.category?.name_en ||
      (() => {
        const { categoryName } = getCategoryAndServiceNamesSync(
          job.service_id
        );
        return categoryName;
      })();
    const serviceName =
      service?.name_en ||
      (() => {
        const { serviceName } = getCategoryAndServiceNamesSync(
          job.service_id
        );
        return serviceName;
      })();

    return {
      ...job,
      application_count: job.application_count?.[0]?.count || 0,
      category_name_en: categoryName,
      service_name_en: serviceName,
      street_address: job.address?.street_address,
      city: job.address?.city,
      region: job.address?.region,
      assigned_tasker_first_name: null,
      assigned_tasker_last_name: null,
      assigned_tasker_avatar: null,
      customer_first_name: (job.customer as any)?.first_name || null,
      customer_last_name: (job.customer as any)?.last_name || null,
      customer_avatar_url: (job.customer as any)?.avatar_url || null,
    };
  });

  return {
    jobs: formattedJobs,
    total,
    hasMore,
  };
}

export interface JobWithCustomerDetails {
  id: string;
  customer_id: string;
  service_id: number;
  title: string;
  description: string;
  preferred_date: string;
  preferred_time_start: string | null;
  preferred_time_end: string | null;
  is_flexible: boolean | null;
  estimated_duration: number | null;
  customer_budget: number | null;
  final_price: number | null;
  is_promoted: boolean | null;
  promotion_expires_at: string | null;
  promotion_boost_score: number | null;
  assigned_tasker_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  customer_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  images: string[] | null;
  requirements: string | null;
  currency: string | null;
  address_id: string;
  max_applications: number | null;
  premium_applications_purchased: number | null;
  current_applications: number | null;
  status: string | null;
  verification_status: string | null;
  // Customer details
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_avatar_url: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_created_at: string | null;
  // Address details
  street_address: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  // Category and service names
  category_name_en?: string;
  service_name_en?: string;
  // Application count
  application_count: number;
}

export async function getJobWithCustomerDetails(
  jobId: string
): Promise<JobWithCustomerDetails | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
        *,
        application_count:job_applications(count),
        customer:users!jobs_customer_id_fkey(
          first_name,
          last_name,
          avatar_url,
          phone,
          email,
          created_at
        ),
        address:addresses(
          street_address,
          city,
          region,
          postal_code,
          country
        ),
        service:services!jobs_service_id_fkey(
          id,
          name_en,
          name_fr,
          name_ar,
          category:service_categories!services_category_id_fkey(
            id,
            name_en,
            name_fr,
            name_ar
          )
        )
      `
      )
      .eq("id", jobId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching job:", error);
      throw new Error(`Failed to fetch job: ${error.message}`);
    }

    const categoryName = data.service?.category?.name_en || "Unknown Category";
    const serviceName = data.service?.name_en || "Unknown Service";

    return {
      ...data,
      application_count: data.application_count?.[0]?.count || 0,
      category_name_en: categoryName,
      service_name_en: serviceName,
      customer_first_name: data.customer?.first_name,
      customer_last_name: data.customer?.last_name,
      customer_avatar_url: data.customer?.avatar_url,
      customer_phone: data.customer?.phone,
      customer_email: data.customer?.email,
      customer_created_at: data.customer?.created_at,
      street_address: data.address?.street_address,
      city: data.address?.city,
      region: data.address?.region,
      postal_code: data.address?.postal_code,
      country: data.address?.country,
    };
  } catch (error) {
    console.error("Error in getJobWithCustomerDetails:", error);
    throw error;
  }
}