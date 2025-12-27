"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { getAllCategoryHierarchies } from "@/lib/categories";

// Helper function to get category and service names by service ID (synchronous version for fallback)
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

  // Get jobs with pagination, including service and category information
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

  // Format the data and add category names from database or fallback to local
  const formattedJobs: JobWithDetails[] = jobs.map((job) => {
    // Try to get category name from database relation first
    const service = job.service as any;
    const categoryName = service?.category?.name_en || 
      (() => {
        // Fallback to local categories
        const { categoryName } = getCategoryAndServiceNamesSync(job.service_id);
        return categoryName;
      })();
    const serviceName = service?.name_en || 
      (() => {
        // Fallback to local categories
        const { serviceName } = getCategoryAndServiceNamesSync(job.service_id);
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

  const { categoryName, serviceName } = getCategoryAndServiceNamesSync(
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

    // Verify the service exists in the services table
    // This prevents foreign key constraint violations
    // The service_id must exist in the services table for the foreign key to work
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("id, name_en")
      .eq("id", jobData.service_id)
      .single();

    if (serviceError || !service) {
      console.error("Service validation error:", {
        serviceError,
        serviceId: jobData.service_id,
        message: `Service with ID ${jobData.service_id} does not exist in the services table. Please ensure the service is properly registered in the database.`,
      });
      return {
        success: false,
        error: `The selected service is not available. Please refresh the page and select a different service. If the problem persists, contact support.`,
      };
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
    // Convert estimated_duration to integer (round to nearest integer)
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

export async function acceptJobApplication(
  applicationId: string
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

    // Get the application and verify ownership
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

    // Update the application status to accepted
    const { error: updateAppError } = await supabase
      .from("job_applications")
      .update({
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateAppError) {
      console.error("Error updating application:", updateAppError);
      return { success: false, error: "Failed to accept application" };
    }

    // Update the job to assign the tasker
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
      return { success: false, error: "Failed to assign tasker to job" };
    }

    // Reject all other applications for this job
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
      // Don't fail the operation for this
    }

    // Create notification for the tasker that their application was accepted
    const jobTitle = (application.job as any)?.title || "the job";
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: application.tasker_id,
        type: "application_accepted",
        title: "Application Accepted",
        message: `Your application for job "${jobTitle}" has been accepted.`,
        related_job_id: application.job_id,
        is_read: false,
      });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't fail the operation for this
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
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get the application and verify ownership
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

    // Update the application status to rejected
    const { error: updateError } = await supabase
      .from("job_applications")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Error updating application:", updateError);
      return { success: false, error: "Failed to reject application" };
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
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user exists in users table (by ID first, then by email if ID doesn't match)
    const { data: dbUser, error: dbUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    // If not found by ID, check by email (in case of ID mismatch)
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
        // Use the existing user from DB instead of creating a new one
        // This handles the case where user was created with different ID
      }
    }

    if (dbUserError || (!dbUser && !dbUserByEmail)) {
      // User doesn't exist in users table, create it
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
            role: (user.user_metadata?.role as "customer" | "tasker") || "tasker",
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
        
        // If it's a duplicate key error (email or ID), try to fetch by email
        if (createError.code === "23505" && user.email) {
          console.log("User already exists (duplicate), fetching by email...");
          const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .maybeSingle();
          
          if (existingUser) {
            console.log("Found existing user by email, continuing...");
            // User exists with different ID, continue with existing user
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
      // User exists but with different ID - log warning but continue
      console.warn("User exists with different ID, using existing user:", {
        authId: user.id,
        dbId: dbUserByEmail.id,
        email: user.email,
      });
    }

    // Validate required fields
    if (!applicationData.job_id) {
      return { success: false, error: "Job ID is required" };
    }
    if (
      !applicationData.proposed_price ||
      applicationData.proposed_price <= 0
    ) {
      return { success: false, error: "Valid proposed price is required" };
    }

    // Check if job exists and is available for applications
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(
        "id, customer_id, status, assigned_tasker_id, max_applications, current_applications"
      )
      .eq("id", applicationData.job_id)
      .single();

    if (jobError || !job) {
      return { success: false, error: "Job not found" };
    }

    // Check if user is the job owner
    if (job.customer_id === user.id) {
      return { success: false, error: "You cannot apply to your own job" };
    }

    // Check if job is still open for applications
    if (job.status !== "active" && job.status !== "under_review") {
      return {
        success: false,
        error: "Job is no longer accepting applications",
      };
    }

    // Check if job already has an assigned tasker
    if (job.assigned_tasker_id) {
      return { success: false, error: "Job already has an assigned tasker" };
    }

    // Check if user has already applied to this job
    const { data: existingApplication, error: existingError } = await supabase
      .from("job_applications")
      .select("id")
      .eq("job_id", applicationData.job_id)
      .eq("tasker_id", user.id)
      .single();

    if (existingApplication && !existingError) {
      return { success: false, error: "You have already applied to this job" };
    }

    // Check application limit
    if (
      job.max_applications &&
      job.current_applications >= job.max_applications
    ) {
      return {
        success: false,
        error: "Job has reached maximum application limit",
      };
    }

    // Final verification: ensure user exists in users table before creating application
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
        error: "Error verifying your account. Please try again or contact support.",
      };
    }

    if (!finalUserCheck) {
      console.error("User does not exist in users table before application creation:", {
        userId: user.id,
        email: user.email,
      });
      return {
        success: false,
        error: "Your account is not properly set up. Please contact support.",
      };
    }

    // Create the job application
    // Convert estimated_duration to integer (round to nearest integer)
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
      
      // Check if it's a foreign key constraint error
      if (applicationError.code === "23503") {
        return {
          success: false,
          error: "Your account is not properly set up. The system cannot verify your user account. Please contact support.",
        };
      }
      
      return {
        success: false,
        error: `Failed to create application: ${applicationError.message}`,
      };
    }

    // Update job application count
    const { error: updateCountError } = await supabase
      .from("jobs")
      .update({
        current_applications: (job.current_applications || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationData.job_id);

    if (updateCountError) {
      console.error("Error updating job application count:", updateCountError);
      // Don't fail the application creation for this
    }

    revalidatePath(`/job-offer/${applicationData.job_id}`);
    revalidatePath("/tasker/my-jobs");

    return { success: true, applicationId: newApplication.id };
  } catch (error) {
    console.error("Error in createJobApplication:", error);
    return { success: false, error: "Failed to create job application" };
  }
}

/**
 * Get jobs assigned to a tasker
 */
export async function getTaskerJobs(
  taskerId: string,
  limit: number = 20,
  offset: number = 0,
  includeTotal: boolean = true
): Promise<{
  jobs: JobWithDetails[];
  total: number;
  hasMore: boolean;
}> {
  const supabase = await createClient();

  // Get job IDs where tasker has accepted application
  const { data: acceptedApplications, error: acceptedAppsError } = await supabase
    .from("job_applications")
    .select("job_id")
    .eq("tasker_id", taskerId)
    .eq("status", "accepted");

  const acceptedJobIds = acceptedAppsError
    ? []
    : (acceptedApplications || []).map((app) => app.job_id).filter((id) => id !== null);

  // Get job IDs assigned to this tasker
  const { data: assignedJobs, error: assignedError } = await supabase
    .from("jobs")
    .select("id")
    .eq("assigned_tasker_id", taskerId);

  if (assignedError) {
    console.error("Error fetching assigned jobs:", assignedError);
  }

  const assignedJobIds = (assignedJobs || []).map((job) => job.id);

  // Combine both lists (remove duplicates)
  const allJobIds = [...new Set([...assignedJobIds, ...acceptedJobIds])];

  // Get total count
  let total = 0;
  if (includeTotal || offset === 0) {
    if (allJobIds.length > 0) {
      const { count, error: countError } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .in("id", allJobIds);

      if (countError) {
        console.error("Error fetching tasker jobs count:", countError);
        throw new Error(`Failed to fetch tasker jobs count: ${countError.message}`);
      }
      total = count || 0;
    } else {
      total = 0;
    }
  }

  // Build the query: jobs assigned to this tasker OR jobs where tasker has accepted application
  let query = supabase
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
    // Fallback: if no jobs found, return empty result
    query = query.eq("id", "00000000-0000-0000-0000-000000000000"); // Non-existent ID
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  if (error) {
    console.error("Error fetching tasker jobs:", error);
    throw new Error(`Failed to fetch tasker jobs: ${error.message}`);
  }

  // Check if there are more items
  const hasMore = data.length > limit;
  const jobs = data.slice(0, limit);

  // Format the data and add category names from database or fallback to local
  const formattedJobs: JobWithDetails[] = jobs.map((job) => {
    // Try to get category name from database relation first
    const service = job.service as any;
    const categoryName = service?.category?.name_en || 
      (() => {
        // Fallback to local categories
        const { categoryName } = getCategoryAndServiceNamesSync(job.service_id);
        return categoryName;
      })();
    const serviceName = service?.name_en || 
      (() => {
        // Fallback to local categories
        const { serviceName } = getCategoryAndServiceNamesSync(job.service_id);
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
      // For tasker view, we don't need assigned_tasker info (it's the tasker themselves)
      assigned_tasker_first_name: null,
      assigned_tasker_last_name: null,
      assigned_tasker_avatar: null,
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
        )
      `
      )
      .eq("id", jobId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Job not found
      }
      console.error("Error fetching job:", error);
      throw new Error(`Failed to fetch job: ${error.message}`);
    }

    const { categoryName, serviceName } = getCategoryAndServiceNamesSync(
      data.service_id
    );

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
