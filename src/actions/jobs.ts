"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { getAllCategoryHierarchies } from "@/lib/categories";

// Helper function to get category and service names by service ID
function getCategoryAndServiceNames(serviceId: number) {
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
  // Application count
  application_count: number;
  // Category and service names
  category_name_en?: string;
  service_name_en?: string;
  // Address details
  street_address?: string | null;
  city?: string | null;
  region?: string | null;
  // Assigned tasker details
  assigned_tasker_first_name?: string | null;
  assigned_tasker_last_name?: string | null;
  assigned_tasker_avatar?: string | null;
}

export async function getCustomerJobs(
  customerId: string,
  limit: number = 20,
  offset: number = 0,
  includeTotal: boolean = true
): Promise<{
  jobs: JobWithDetails[];
  total: number;
  hasMore: boolean;
}> {
  const supabase = await createClient();

  // Get total count only when needed
  let total = 0;
  if (includeTotal || offset === 0) {
    const { count, error: countError } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    if (countError) {
      console.error("Error fetching jobs count:", countError);
      throw new Error(`Failed to fetch jobs count: ${countError.message}`);
    }
    total = count || 0;
  }

  // Get jobs with pagination
  const { data, error } = await supabase
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
      )
    `
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  if (error) {
    console.error("Error fetching jobs:", error);
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }

  // Check if there are more items
  const hasMore = data.length > limit;
  const jobs = data.slice(0, limit);

  // Format the data and add category names
  const formattedJobs: JobWithDetails[] = jobs.map((job) => {
    const { categoryName, serviceName } = getCategoryAndServiceNames(
      job.service_id
    );

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
  };
}

export async function getJobById(
  jobId: string
): Promise<JobWithDetails | null> {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Authentication required");
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
      )
    `
    )
    .eq("id", jobId)
    .eq("customer_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Job not found
    }
    console.error("Error fetching job:", error);
    throw new Error(`Failed to fetch job: ${error.message}`);
  }

  const { categoryName, serviceName } = getCategoryAndServiceNames(
    data.service_id
  );

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
    // Verify the job belongs to the customer
    const { data: existingJob, error: fetchError } = await supabase
      .from("jobs")
      .select("customer_id")
      .eq("id", jobId)
      .single();

    if (fetchError || !existingJob) {
      return { success: false, error: "Job not found" };
    }

    if (existingJob.customer_id !== customerId) {
      return { success: false, error: "Unauthorized" };
    }

    // Update the job
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
    return { success: false, error: "Failed to update job" };
  }
}

export async function deleteJob(
  jobId: string,
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Verify the job belongs to the customer
    const { data: existingJob, error: fetchError } = await supabase
      .from("jobs")
      .select("customer_id, status, assigned_tasker_id")
      .eq("id", jobId)
      .single();

    if (fetchError || !existingJob) {
      return { success: false, error: "Job not found" };
    }

    if (existingJob.customer_id !== customerId) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if job can be deleted
    if (existingJob.assigned_tasker_id) {
      return {
        success: false,
        error: "Cannot delete job that has been assigned to a tasker",
      };
    }

    if (["in_progress", "completed"].includes(existingJob.status || "")) {
      return {
        success: false,
        error: "Cannot delete job in current status",
      };
    }

    // Delete the job (this will cascade delete job_applications)
    const { error } = await supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      console.error("Error deleting job:", error);
      return {
        success: false,
        error: `Failed to delete job: ${error.message}`,
      };
    }

    revalidatePath("/customer/my-jobs");

    return { success: true };
  } catch (error) {
    console.error("Error in deleteJob:", error);
    return { success: false, error: "Failed to delete job" };
  }
}

export async function assignTaskerToJob(
  jobId: string,
  taskerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Verify the job belongs to the customer
    const { data: existingJob, error: fetchError } = await supabase
      .from("jobs")
      .select("customer_id, status")
      .eq("id", jobId)
      .single();

    if (fetchError || !existingJob) {
      return { success: false, error: "Job not found" };
    }

    if (existingJob.customer_id !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (existingJob.status !== "open") {
      return {
        success: false,
        error: "Job is no longer available for assignment",
      };
    }

    // Update the job with assigned tasker
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
    return { success: false, error: "Failed to assign tasker" };
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
  // Tasker details
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
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Authentication required");
    }

    // First verify the job belongs to the customer
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("customer_id")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      throw new Error("Job not found");
    }

    if (job.customer_id !== user.id) {
      throw new Error("Unauthorized");
    }

    // Get applications with tasker details
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
      (app) => ({
        ...app,
        tasker_first_name: app.tasker?.first_name,
        tasker_last_name: app.tasker?.last_name,
        tasker_avatar_url: app.tasker?.avatar_url,
        tasker_phone: app.tasker?.phone,
        tasker_email: app.tasker?.email,
        tasker_created_at: app.tasker?.created_at,
        tasker_verification_status: app.tasker?.verification_status,
      })
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
  customer_budget: number;
  estimated_duration: number;
  preferred_date: string;
  preferred_time_start?: string | null;
  preferred_time_end?: string | null;
  is_flexible: boolean;
  requirements?: string | null;
}

export async function updateJob(
  jobId: string,
  updateData: UpdateJobData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Verify the job belongs to the customer
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

    // Validate required fields
    if (!updateData.title?.trim()) {
      return { success: false, error: "Job title is required" };
    }
    if (!updateData.description?.trim()) {
      return { success: false, error: "Job description is required" };
    }
    if (!updateData.customer_budget || updateData.customer_budget <= 0) {
      return { success: false, error: "Valid budget is required" };
    }
    if (!updateData.preferred_date) {
      return { success: false, error: "Preferred date is required" };
    }

    // Update the job
    const { error } = await supabase
      .from("jobs")
      .update({
        title: updateData.title.trim(),
        description: updateData.description.trim(),
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

export async function createJob(
  jobData: CreateJobData
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  const supabase = await createClient();

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Validate required fields
    if (!jobData.title?.trim()) {
      return { success: false, error: "Job title is required" };
    }
    if (!jobData.description?.trim()) {
      return { success: false, error: "Job description is required" };
    }
    if (!jobData.service_id) {
      return { success: false, error: "Service selection is required" };
    }
    if (!jobData.preferred_date) {
      return { success: false, error: "Preferred date is required" };
    }
    if (!jobData.customer_budget || jobData.customer_budget <= 0) {
      return { success: false, error: "Valid budget is required" };
    }
    if (!jobData.address_id) {
      return { success: false, error: "Job location is required" };
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
        estimated_duration: jobData.estimated_duration || null,
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
      // Don't fail the job creation for this
    }

    revalidatePath("/customer/my-jobs");
    revalidatePath("/customer/dashboard");

    return { success: true, jobId: newJob.id };
  } catch (error) {
    console.error("Error in createJob:", error);
    return { success: false, error: "Failed to create job" };
  }
}
