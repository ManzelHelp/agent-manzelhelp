"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import type { TransactionType, PaymentStatus, BookingStatus } from "@/types/supabase";

// Enhanced interfaces with better type safety
export interface EarningsData {
  today: number;
  week: number;
  month: number;
  total: number;
  todayChange: number;
  weekChange: number;
  monthChange: number;
  currency: string;
}

export interface PerformanceMetrics {
  completedJobs: number;
  totalReviews: number;
  averageRating: number;
  responseTime: number;
  positiveReviews: number;
  completionRate: number;
}

export interface Transaction {
  id: string;
  amount: number;
  netAmount: number;
  platformFee: number;
  transactionType: TransactionType;
  paymentStatus: PaymentStatus;
  createdAt: string;
  processedAt: string | null;
  bookingId: string | null;
  serviceTitle: string | null;
  bookingStatus: BookingStatus | null;
  paymentMethod: string | null;
  currency: string;
}

export interface ChartData {
  date: string;
  earnings: number;
  jobs: number;
  expenses?: number;
}

// New interfaces for enhanced functionality
export interface PaymentMethod {
  id: string;
  type: "credit_card" | "debit_card" | "paypal" | "wallet" | "cash";
  last4?: string;
  email?: string;
  isDefault: boolean;
  expiresAt?: string;
  brand?: string;
}

export interface WalletBalance {
  available: number;
  pending: number;
  currency: string;
  lastUpdated: string;
}

export interface FinanceSummary {
  totalSpent: number;
  totalEarned: number;
  pendingPayments: number;
  completedJobs: number;
  averageJobValue: number;
  currency: string;
  period: "week" | "month" | "year";
}

interface TransactionWithBooking {
  id: string;
  amount: string | number;
  platform_fee: string | number | null;
  transaction_type: TransactionType;
  payment_status: PaymentStatus;
  payment_method: string | null;
  created_at: string;
  processed_at: string | null;
  booking_id: string | null;
  service_bookings: {
    id: string;
    status: BookingStatus;
    tasker_services: {
      title: string;
    }[];
  }[];
}

export async function getEarningsData(): Promise<EarningsData> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("User not authenticated");
  }

  try {
    // Force fresh data - no caching
    const fetchOptions = { cache: 'no-store' as const };
    // Get current period earnings
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Fetch all transactions and filter by date in JavaScript (more reliable)
    // This ensures we get all transactions regardless of created_at vs processed_at
    const { data: allTransactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("amount, platform_fee, created_at, processed_at")
      .eq("payee_id", user.id)
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false });

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError);
      throw transactionsError;
    }

    // Filter transactions by date using processed_at if available, otherwise created_at
    const filterByDate = (data: any[], startDate: Date, endDate?: Date) => {
      return data.filter((item) => {
        const dateToUse = item.processed_at || item.created_at;
        if (!dateToUse) return false;
        const itemDate = new Date(dateToUse);
        if (endDate) {
          return itemDate >= startDate && itemDate < endDate;
        }
        return itemDate >= startDate;
      });
    };

    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const todayData = filterByDate(allTransactions || [], startOfToday, endOfToday);
    const weekData = filterByDate(allTransactions || [], startOfWeek);
    const monthData = filterByDate(allTransactions || [], startOfMonth);
    const totalData = allTransactions || [];

    // Previous period queries for trend calculation
    const yesterday = new Date(startOfToday);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    // Use the same allTransactions data and filter for previous periods
    const yesterdayData = filterByDate(allTransactions || [], yesterday, startOfToday);
    const lastWeekData = filterByDate(allTransactions || [], startOfLastWeek, startOfWeek);
    const lastMonthData = filterByDate(allTransactions || [], startOfLastMonth, startOfMonth);

    const calculateTotal = (data: { amount: string | number; platform_fee: string | number }[]) =>
      data.reduce((sum, item) => {
        const amount = typeof item.amount === 'string' ? parseFloat(item.amount) : (item.amount || 0);
        const fee = typeof item.platform_fee === 'string' ? parseFloat(item.platform_fee) : (item.platform_fee || 0);
        return sum + (amount - fee);
      }, 0);

    const todayEarnings = calculateTotal(todayData);
    const weekEarnings = calculateTotal(weekData);
    const monthEarnings = calculateTotal(monthData);
    const totalEarnings = calculateTotal(totalData);

    const yesterdayEarnings = calculateTotal(yesterdayData);
    const lastWeekEarnings = calculateTotal(lastWeekData);
    const lastMonthEarnings = calculateTotal(lastMonthData);

    // Debug logging (only primitives to avoid serialization issues)
    console.log("📊 Earnings calculation:", {
      totalTransactions: allTransactions?.length || 0,
      todayCount: todayData.length,
      weekCount: weekData.length,
      monthCount: monthData.length,
      todayEarnings,
      weekEarnings,
      monthEarnings,
      totalEarnings,
    });

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      today: todayEarnings,
      week: weekEarnings,
      month: monthEarnings,
      total: totalEarnings,
      todayChange: calculateChange(todayEarnings, yesterdayEarnings),
      weekChange: calculateChange(weekEarnings, lastWeekEarnings),
      monthChange: calculateChange(monthEarnings, lastMonthEarnings),
      currency: "MAD",
    };
  } catch (error) {
    console.error("Error fetching earnings data:", error);
    return {
      today: 0,
      week: 0,
      month: 0,
      total: 0,
      todayChange: 0,
      weekChange: 0,
      monthChange: 0,
      currency: "MAD",
    };
  }
}

export async function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("User not authenticated");
  }

  try {
    const [reviewsResult, bookingsResult, jobsResult] = await Promise.all([
      supabase
        .from("reviews")
        .select("overall_rating")
        .eq("reviewee_id", user.id),

      // Get all completed bookings, then filter by customer_confirmed_at in JS
      supabase
        .from("service_bookings")
        .select("id, status, created_at, accepted_at, customer_confirmed_at")
        .eq("tasker_id", user.id)
        .eq("status", "completed"),

      // Get all completed jobs, then filter by customer_confirmed_at in JS
      // Note: jobs table doesn't have accepted_at, only created_at
      supabase
        .from("jobs")
        .select("id, status, created_at, customer_confirmed_at")
        .eq("assigned_tasker_id", user.id)
        .eq("status", "completed"),
    ]);

    // Check for errors
    if (bookingsResult.error) {
      console.error("❌ Error fetching bookings:", bookingsResult.error);
    }
    if (jobsResult.error) {
      console.error("❌ Error fetching jobs:", jobsResult.error);
    }

    const reviews = reviewsResult.data || [];
    const allBookingsData = bookingsResult.data || [];
    const allJobsData = jobsResult.data || [];

    // Filter to only confirmed bookings/jobs (customer_confirmed_at IS NOT NULL)
    const confirmedBookings = allBookingsData.filter(
      (b) => b.customer_confirmed_at !== null && b.customer_confirmed_at !== undefined
    );
    const confirmedJobs = allJobsData.filter(
      (j) => j.customer_confirmed_at !== null && j.customer_confirmed_at !== undefined
    );

    // Total completed jobs = confirmed bookings + confirmed jobs
    const completedJobs = confirmedBookings.length + confirmedJobs.length;
    
    console.log("📊 [getPerformanceMetrics] Completed jobs calculation:", {
      taskerId: user.id,
      allCompletedBookings: allBookingsData.length,
      confirmedBookings: confirmedBookings.length,
      allCompletedJobs: allJobsData.length,
      confirmedJobs: confirmedJobs.length,
      totalCompletedJobs: completedJobs,
      bookingsError: bookingsResult.error?.message,
      jobsError: jobsResult.error?.message,
      sampleConfirmedBooking: confirmedBookings[0]?.id,
      sampleConfirmedJob: confirmedJobs[0]?.id,
      firstJobCustomerConfirmed: allJobsData[0]?.customer_confirmed_at,
    });
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / totalReviews
        : 0;
    const positiveReviews = reviews.filter((r) => r.overall_rating >= 4).length;

    // For response time calculation, we need all bookings/jobs (not just completed)
    // Note: jobs table doesn't have accepted_at, so we'll skip response time for jobs
    const [allBookingsResult] = await Promise.all([
      supabase
        .from("service_bookings")
        .select("created_at, accepted_at")
        .eq("tasker_id", user.id),
    ]);
    
    const allBookings = allBookingsResult.data || [];
    
    // Calculate average response time (time between booking creation and acceptance)
    // Jobs don't have accepted_at, so we only calculate for bookings
    const acceptedBookings = allBookings.filter(
      (b) => b.accepted_at && b.created_at
    );
    
    const allResponseTimes = acceptedBookings.map((b) => {
      const created = new Date(b.created_at);
      const accepted = new Date(b.accepted_at!);
      return accepted.getTime() - created.getTime();
    });
    
    const averageResponseTime =
      allResponseTimes.length > 0
        ? allResponseTimes.reduce((sum, time) => sum + time, 0) /
          allResponseTimes.length
        : 0;

    // Total bookings + jobs for completion rate
    // We need to fetch all jobs separately since we didn't fetch them for response time
    const { data: allJobsForCount } = await supabase
      .from("jobs")
      .select("id")
      .eq("assigned_tasker_id", user.id);
    
    const totalBookingsAndJobs = allBookings.length + (allJobsForCount?.length || 0);

    return {
      completedJobs,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      responseTime: Math.round(averageResponseTime / (1000 * 60 * 60)), // Convert to hours
      positiveReviews,
      completionRate:
        completedJobs > 0 && totalBookingsAndJobs > 0 
          ? (completedJobs / totalBookingsAndJobs) * 100 
          : 0,
    };
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return {
      completedJobs: 0,
      totalReviews: 0,
      averageRating: 0,
      responseTime: 0,
      positiveReviews: 0,
      completionRate: 0,
    };
  }
}

export async function getTransactionHistory(
  limit: number = 10,
  offset: number = 0
): Promise<{
  transactions: Transaction[];
  hasMore: boolean;
  total?: number;
}> {
  if (limit < 1 || limit > 100) {
    throw new Error("Limit must be between 1 and 100");
  }

  if (offset < 0) {
    throw new Error("Offset must be non-negative");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("User not authenticated");
  }

  try {
    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("payee_id", user.id);

    // Fetch transactions and bookings/jobs separately to avoid serialization issues
    const [transactionsResult, bookingsResult] = await Promise.all([
      // Get transactions (tasker is payee) - include both booking_id and job_id
      supabase
        .from("transactions")
        .select("id, amount, platform_fee, transaction_type, payment_status, payment_method, created_at, processed_at, booking_id, job_id")
        .eq("payee_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1),

      // Get bookings for fallback - no nested relations
      supabase
        .from("service_bookings")
        .select("id, agreed_price, currency, status, payment_method, created_at, completed_at, tasker_service_id")
        .eq("tasker_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1),
    ]);

    const transactions = transactionsResult.data || [];
    const bookings = bookingsResult.data || [];

    // If transactions exist, fetch service titles and job titles separately and join manually
    if (transactions.length > 0) {
      // Get unique booking IDs and job IDs from transactions
      const bookingIds = transactions
        .map((t) => t.booking_id)
        .filter((id): id is string => id !== null && id !== undefined);

      const jobIds = transactions
        .map((t) => t.job_id)
        .filter((id): id is string => id !== null && id !== undefined);

      console.log("[getTransactionHistory] Extracted IDs:", {
        totalTransactions: transactions.length,
        bookingIds: bookingIds.length,
        jobIds: jobIds.length,
        jobIdsList: jobIds,
      });

      // Fetch bookings with service titles
      let bookingsMap = new Map<string, { status: string; serviceTitle: string; paymentMethod: string }>();
      if (bookingIds.length > 0) {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("service_bookings")
          .select("id, status, payment_method, tasker_service_id, tasker_services(title)")
          .in("id", bookingIds);

        if (!bookingsError && bookingsData) {
          bookingsData.forEach((booking: any) => {
            const serviceTitle = Array.isArray(booking.tasker_services)
              ? booking.tasker_services[0]?.title
              : booking.tasker_services?.title || "Service";
            bookingsMap.set(booking.id, {
              status: booking.status,
              serviceTitle: serviceTitle,
              paymentMethod: booking.payment_method || "cash",
            });
          });
        }
      }

      // Fetch jobs with titles
      let jobsMap = new Map<string, { title: string; status: string; paymentMethod: string }>();
      if (jobIds.length > 0) {
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("id, title, status, currency")
          .in("id", jobIds);

        if (!jobsError && jobsData) {
          jobsData.forEach((job: any) => {
            jobsMap.set(job.id, {
              title: String(job.title || "Job"),
              status: String(job.status || ""),
              paymentMethod: "cash", // Jobs typically use cash payment
            });
          });
        }
      }

      // Map transactions to return format
      const mappedTransactions = transactions.map((transaction: any) => {
        const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : (transaction.amount || 0);
        const fee = typeof transaction.platform_fee === 'string' ? parseFloat(transaction.platform_fee) : (transaction.platform_fee || 0);
        
        // Prioritize job_id for title, then fallback to booking_id
        let serviceTitle: string | null = null;
        let bookingStatus: BookingStatus | null = null;
        let paymentMethod: string | null = transaction.payment_method || "cash";

        if (transaction.job_id && jobsMap.has(transaction.job_id)) {
          const jobInfo = jobsMap.get(transaction.job_id)!;
          serviceTitle = jobInfo.title;
          paymentMethod = jobInfo.paymentMethod;
        } else if (transaction.booking_id && bookingsMap.has(transaction.booking_id)) {
          const bookingInfo = bookingsMap.get(transaction.booking_id)!;
          serviceTitle = bookingInfo.serviceTitle;
          bookingStatus = bookingInfo.status as BookingStatus;
          paymentMethod = bookingInfo.paymentMethod;
        }

        return {
          id: String(transaction.id),
          amount: amount,
          netAmount: amount - fee,
          platformFee: fee,
          transactionType: transaction.transaction_type as TransactionType,
          paymentStatus: transaction.payment_status as PaymentStatus,
          paymentMethod: paymentMethod,
          createdAt: transaction.created_at ? new Date(transaction.created_at).toISOString() : new Date().toISOString(),
          processedAt: transaction.processed_at ? new Date(transaction.processed_at).toISOString() : null,
          bookingId: transaction.booking_id ? String(transaction.booking_id) : null,
          serviceTitle: serviceTitle,
          bookingStatus: bookingStatus,
          currency: "MAD",
        };
      });

      const total = Number(totalCount) || 0;
      const hasMore = (offset + limit) < total;

      return {
        transactions: mappedTransactions,
        hasMore,
        total,
      };
    }

    // If no transactions, return empty array
    const total = Number(totalCount) || 0;
    const hasMore = (offset + limit) < total;
    return {
      transactions: [],
      hasMore,
      total,
    };
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return [];
  }
}

export async function getChartData(
  period: "day" | "week" | "month" = "week"
): Promise<ChartData[]> {
  const validPeriods = ["day", "week", "month"];
  if (!validPeriods.includes(period)) {
    throw new Error(
      `Invalid period. Must be one of: ${validPeriods.join(", ")}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("User not authenticated");
  }

  try {
    const now = new Date();
    let startDate: Date;
    let groupBy: string;

    switch (period) {
      case "day":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        groupBy = "day";
        break;
      case "week":
        startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // Last 12 weeks
        groupBy = "week";
        break;
      case "month":
        startDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000); // Last 12 months
        groupBy = "month";
        break;
    }

    // Remove !inner to include all transactions, not just those with bookings
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        amount,
        platform_fee,
        created_at,
        booking_id
      `
      )
      .eq("payee_id", user.id)
      .eq("payment_status", "paid")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Group data by period
    const groupedData = new Map<string, { earnings: number; jobs: number }>();

    (data || []).forEach((transaction) => {
      const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : (transaction.amount || 0);
      const fee = typeof transaction.platform_fee === 'string' ? parseFloat(transaction.platform_fee) : (transaction.platform_fee || 0);
      const netAmount = amount - fee;
      const date = new Date(transaction.created_at);
      let key: string;

      switch (groupBy) {
        case "day":
          key = date.toISOString().split("T")[0];
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          break;
        default:
          key = date.toISOString().split("T")[0];
      }

      if (!groupedData.has(key)) {
        groupedData.set(key, { earnings: 0, jobs: 0 });
      }

      const current = groupedData.get(key)!;
      current.earnings += netAmount;
      current.jobs += 1;
    });

    return Array.from(groupedData.entries())
      .map(([date, data]) => ({
        date,
        earnings: data.earnings,
        jobs: data.jobs,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return [];
  }
}

// Enhanced customer finance functions
export async function getCustomerFinanceSummary(
  period: "week" | "month" | "year" = "month",
  month?: number,
  year?: number
): Promise<FinanceSummary> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("Authentication error in getCustomerFinanceSummary:", error);
      return {
        totalSpent: 0,
        totalEarned: 0,
        pendingPayments: 0,
        completedJobs: 0,
        averageJobValue: 0,
        currency: "MAD",
        period,
      };
    }
    const now = new Date();
    let startDate: Date;
    let endDate: Date | undefined;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month": {
        const selectedMonth = month !== undefined ? month - 1 : now.getMonth(); // month is 1-12, Date uses 0-11
        const selectedYear = year !== undefined ? year : now.getFullYear();
        startDate = new Date(selectedYear, selectedMonth, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedYear, selectedMonth + 1, 0); // Last day of the month
        endDate.setHours(23, 59, 59, 999);
        
        console.log("[getCustomerFinanceSummary] Month filter:", {
          selectedMonth: month,
          selectedYear,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        break;
      }
      case "year": {
        const selectedYear = year !== undefined ? year : now.getFullYear();
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999); // Last day of the year
        break;
      }
    }

    const [spentResult, pendingResult, bookingsResult, jobsResult] = await Promise.all([
      // Total spent (as payer) - handle empty transactions table
      // For month/year, filter by the selected period
      (() => {
        // For transactions, use processed_at if available (for paid transactions), otherwise created_at
        // But we need to filter in JS since we can't easily do OR in Supabase query
        let query = supabase
          .from("transactions")
          .select("amount, currency, created_at, processed_at")
          .eq("payer_id", user.id)
          .eq("payment_status", "paid");
        
        // Filter by created_at first (will filter more in JS)
        query = query.gte("created_at", startDate.toISOString());
        if (endDate) {
          // Also get transactions that might be processed in the period even if created earlier
          // We'll filter properly in JavaScript
        }
        
        return query;
      })(),

      // Pending payments - handle empty transactions table
      supabase
        .from("transactions")
        .select("amount, currency")
        .eq("payer_id", user.id)
        .eq("payment_status", "pending"),

      // Completed bookings - use actual data
      // Also include jobs for customer
      supabase
        .from("service_bookings")
        .select("agreed_price, currency, status, completed_at, customer_confirmed_at")
        .eq("customer_id", user.id)
        .eq("status", "completed"),
      
      // Also get completed jobs
      supabase
        .from("jobs")
        .select("final_price, currency, status, completed_at, customer_confirmed_at")
        .eq("customer_id", user.id)
        .eq("status", "completed"),
    ]);

    // Calculate total spent from transactions (if any exist)
    // Use processed_at if available (for paid transactions), otherwise created_at
    const filteredTransactions = (spentResult.data || []).filter((t) => {
      // Use processed_at if available, otherwise created_at
      const dateToUse = t.processed_at || t.created_at;
      if (!dateToUse) return false;
      
      const txDate = new Date(dateToUse);
      if (isNaN(txDate.getTime())) return false;
      
      // Normalize dates to start of day for comparison
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = endDate ? new Date(endDate) : null;
      if (end) end.setHours(23, 59, 59, 999);
      
      const compareDate = new Date(txDate);
      compareDate.setHours(0, 0, 0, 0);
      
      if (compareDate < start) return false;
      if (end && compareDate > end) return false;
      return true;
    });
    
    let totalSpent = filteredTransactions.reduce(
      (sum, t) => sum + parseFloat(String(t.amount || "0")),
      0
    );
    
    // Filter bookings and jobs by date and customer_confirmed_at
    // Normalize dates for consistent comparison
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);
    
    console.log("[getCustomerFinanceSummary] Filtering data:", {
      period,
      month,
      year,
      startDate: start.toISOString(),
      endDate: end?.toISOString(),
      totalBookings: bookingsResult.data?.length || 0,
      totalJobs: jobsResult.data?.length || 0,
      totalTransactions: spentResult.data?.length || 0,
      sampleBooking: bookingsResult.data?.[0] ? {
        completed_at: bookingsResult.data[0].completed_at,
        customer_confirmed_at: bookingsResult.data[0].customer_confirmed_at,
        agreed_price: bookingsResult.data[0].agreed_price,
      } : null,
      sampleJob: jobsResult.data?.[0] ? {
        completed_at: jobsResult.data[0].completed_at,
        customer_confirmed_at: jobsResult.data[0].customer_confirmed_at,
        final_price: jobsResult.data[0].final_price,
      } : null,
      sampleTransaction: spentResult.data?.[0] ? {
        amount: spentResult.data[0].amount,
        created_at: spentResult.data[0].created_at,
        processed_at: spentResult.data[0].processed_at,
      } : null,
    });
    
    // Filter bookings: use customer_confirmed_at if available, otherwise completed_at, otherwise skip
    const confirmedBookings = (bookingsResult.data || []).filter(
      (b) => {
        // Try customer_confirmed_at first, then completed_at as fallback
        const dateToUse = b.customer_confirmed_at || b.completed_at;
        if (!dateToUse) return false;
        
        const confirmedDate = new Date(dateToUse);
        if (isNaN(confirmedDate.getTime())) return false; // Invalid date
        
        const compareDate = new Date(confirmedDate);
        compareDate.setHours(0, 0, 0, 0);
        
        if (compareDate < start) return false;
        if (end && compareDate > end) return false;
        return true;
      }
    );
    
    // Filter jobs: use customer_confirmed_at if available, otherwise completed_at, otherwise skip
    const confirmedJobs = (jobsResult.data || []).filter(
      (j) => {
        // Try customer_confirmed_at first, then completed_at as fallback
        const dateToUse = j.customer_confirmed_at || j.completed_at;
        if (!dateToUse) return false;
        
        const confirmedDate = new Date(dateToUse);
        if (isNaN(confirmedDate.getTime())) return false; // Invalid date
        
        const compareDate = new Date(confirmedDate);
        compareDate.setHours(0, 0, 0, 0);
        
        if (compareDate < start) return false;
        if (end && compareDate > end) return false;
        return true;
      }
    );
    
    console.log("[getCustomerFinanceSummary] Filtered results:", {
      confirmedBookings: confirmedBookings.length,
      confirmedJobs: confirmedJobs.length,
      filteredTransactions: filteredTransactions.length,
      totalSpentBeforeFallback: totalSpent,
      sampleConfirmedBooking: confirmedBookings[0] ? {
        agreed_price: confirmedBookings[0].agreed_price,
        customer_confirmed_at: confirmedBookings[0].customer_confirmed_at,
        completed_at: confirmedBookings[0].completed_at,
      } : null,
      sampleConfirmedJob: confirmedJobs[0] ? {
        final_price: confirmedJobs[0].final_price,
        customer_confirmed_at: confirmedJobs[0].customer_confirmed_at,
        completed_at: confirmedJobs[0].completed_at,
      } : null,
    });
    
    // Fallback: If no transactions but confirmed bookings/jobs exist, use their total
    if (totalSpent === 0 && (confirmedBookings.length > 0 || confirmedJobs.length > 0)) {
      const bookingsTotal = confirmedBookings.reduce(
        (sum, b) => sum + parseFloat(String(b.agreed_price || "0")),
        0
      );
      const jobsTotal = confirmedJobs.reduce(
        (sum, j) => sum + parseFloat(String(j.final_price || "0")),
        0
      );
      totalSpent = bookingsTotal + jobsTotal;
    }

    // Calculate pending payments from transactions (if any exist)
    const pendingPayments = (pendingResult.data || []).reduce(
      (sum, t) => sum + parseFloat(String(t.amount || "0")),
      0
    );

    // Get completed jobs count (bookings + jobs) and calculate average
    const completedJobs = confirmedBookings.length + confirmedJobs.length;
    const totalValue = confirmedBookings.reduce(
      (sum, b) => sum + parseFloat(String(b.agreed_price || "0")),
      0
    ) + confirmedJobs.reduce(
      (sum, j) => sum + parseFloat(String(j.final_price || "0")),
      0
    );
    const averageJobValue = completedJobs > 0 ? totalValue / completedJobs : 0;

    // Get currency from first booking/job or default to MAD
    const currency = confirmedBookings[0]?.currency || confirmedJobs[0]?.currency || "MAD";

    return {
      totalSpent: Number(totalSpent) || 0,
      totalEarned: 0, // Customers don't earn, they spend
      pendingPayments: Number(pendingPayments) || 0,
      completedJobs: Number(completedJobs) || 0,
      averageJobValue: Number(averageJobValue) || 0,
      currency: String(currency || "MAD"),
      period,
    };
  } catch (error) {
    console.error("Error fetching customer finance summary:", error);
    // Return a safe default object to prevent serialization issues
    return {
      totalSpent: 0,
      totalEarned: 0,
      pendingPayments: 0,
      completedJobs: 0,
      averageJobValue: 0,
      currency: "MAD",
      period,
    };
  }
}

export async function getCustomerTransactionHistory(
  limit: number = 10,
  offset: number = 0
): Promise<{
  transactions: Transaction[];
  hasMore: boolean;
  total?: number;
}> {
  try {
    if (limit < 1 || limit > 100) {
      console.error("Invalid limit in getCustomerTransactionHistory:", limit);
      return { transactions: [], hasMore: false, total: 0 };
    }

    if (offset < 0) {
      console.error("Invalid offset in getCustomerTransactionHistory:", offset);
      return { transactions: [], hasMore: false, total: 0 };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("Authentication error in getCustomerTransactionHistory:", error);
      return { transactions: [], hasMore: false, total: 0 };
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("payer_id", user.id);

    // Fetch transactions and bookings separately to avoid serialization issues
    const [transactionsResult, bookingsResult] = await Promise.all([
      // Get transactions (customer is payer) - include both booking_id and job_id
      supabase
        .from("transactions")
        .select("id, amount, platform_fee, transaction_type, payment_status, payment_method, created_at, processed_at, booking_id, job_id")
        .eq("payer_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1),

      // Get bookings for fallback - no nested relations
      supabase
        .from("service_bookings")
        .select("id, agreed_price, currency, status, payment_method, created_at, completed_at, tasker_service_id")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1),
    ]);

    const transactions = transactionsResult.data || [];
    const bookings = bookingsResult.data || [];

    // If transactions exist, fetch service titles and job titles separately and join manually
    if (transactions.length > 0) {
      // Get unique booking IDs and job IDs from transactions
      const bookingIds = transactions
        .map((t) => t.booking_id)
        .filter((id): id is string => id !== null && id !== undefined);

      const jobIds = transactions
        .map((t) => t.job_id)
        .filter((id): id is string => id !== null && id !== undefined);

      console.log("[getCustomerTransactionHistory] Extracted IDs:", {
        totalTransactions: transactions.length,
        bookingIds: bookingIds.length,
        jobIds: jobIds.length,
        jobIdsList: jobIds,
        sampleTransaction: transactions[0] ? {
          id: transactions[0].id,
          booking_id: transactions[0].booking_id,
          job_id: transactions[0].job_id,
        } : null,
      });

      // Fetch bookings with service info for these transaction booking IDs
      let bookingServiceMap: Record<string, { title: string; status: string; payment_method?: string | null }> = {};
      
      if (bookingIds.length > 0) {
        const { data: bookingServices } = await supabase
          .from("service_bookings")
          .select("id, status, tasker_service_id, payment_method, tasker_services(title)")
          .in("id", bookingIds);

        // Extract service titles - fetch separately if needed
        const serviceIds = (bookingServices || [])
          .map((b: any) => b.tasker_service_id)
          .filter((id: any): id is string => id !== null && id !== undefined);

        if (serviceIds.length > 0) {
          const { data: services } = await supabase
            .from("tasker_services")
            .select("id, title")
            .in("id", serviceIds);

          const serviceTitleMap: Record<string, string> = {};
          for (const service of services || []) {
            serviceTitleMap[service.id] = service.title || "Service";
          }

          // Map bookings to service titles and payment_method
          for (const booking of bookingServices || []) {
            bookingServiceMap[booking.id] = {
              title: serviceTitleMap[booking.tasker_service_id] || "Service",
              status: booking.status,
              payment_method: booking.payment_method || null,
            };
          }
        }
      }

      // Fetch jobs with titles and status for these transaction job IDs
      // Note: jobs table does NOT have payment_method column
      let jobTitleMap: Record<string, { title: string; status: string }> = {};
      
      if (jobIds.length > 0) {
        console.log("[getCustomerTransactionHistory] Fetching jobs with IDs:", jobIds);
        
        // Try to fetch jobs - customer should be able to read their own jobs
        // Add .eq("customer_id", user.id) to ensure RLS allows access
        // Note: jobs table does NOT have payment_method column
        const { data: jobs, error: jobsError } = await supabase
          .from("jobs")
          .select("id, title, status")
          .eq("customer_id", user.id) // Ensure customer can only read their own jobs
          .in("id", jobIds);

        if (jobsError) {
          console.error("Error fetching jobs for transactions:", jobsError);
        }

        console.log("[getCustomerTransactionHistory] Jobs query result:", {
          jobIdsRequested: jobIds,
          customerId: user.id,
          jobsFound: jobs?.length || 0,
          jobs: jobs?.map(j => ({ id: String(j.id), title: j.title })) || [],
          error: jobsError?.message,
          errorCode: jobsError?.code,
        });

        // Map jobs to titles and status
        // Use String() to ensure consistent key format (UUID as string)
        for (const job of jobs || []) {
          const jobIdKey = String(job.id);
          jobTitleMap[jobIdKey] = {
            title: job.title || "Job",
            status: job.status,
          };
        }

        console.log("[getCustomerTransactionHistory] Final jobTitleMap:", {
          jobIdsRequested: jobIds,
          jobIdsCount: jobIds.length,
          jobsFound: jobs?.length || 0,
          jobTitleMapKeys: Object.keys(jobTitleMap),
        });
      } else {
        console.log("[getCustomerTransactionHistory] No job IDs found in transactions");
      }


      // Map transactions to Transaction format with explicit serialization
      const mappedTransactions = transactions.map((transaction) => {
        // Check if transaction is for a job or booking
        let title = "Service";
        let status: string | null = null;
        let paymentMethod = transaction.payment_method || "unknown";
        
        if (transaction.job_id) {
          // Transaction is for a job
          // Use String() to ensure consistent key format
          const jobIdKey = String(transaction.job_id);
          const jobInfo = jobTitleMap[jobIdKey];
          if (jobInfo) {
            title = jobInfo.title;
            status = jobInfo.status;
            // Payment method for jobs is stored in transactions table, not jobs table
            // Keep transaction.payment_method or default to "cash"
            if (!transaction.payment_method) {
              paymentMethod = "cash"; // Default for jobs
            }
          } else {
            // Job not found in map - log for debugging
            console.warn("[getCustomerTransactionHistory] Job not found in map:", {
              transactionId: transaction.id,
              jobId: transaction.job_id,
              jobIdKey,
              availableJobIds: Object.keys(jobTitleMap),
            });
            title = "Job"; // Fallback
          }
        } else if (transaction.booking_id) {
          // Transaction is for a booking
          const bookingInfo = bookingServiceMap[transaction.booking_id] || { title: "Service", status: null, payment_method: null };
          title = bookingInfo.title;
          status = bookingInfo.status;
          // Use booking payment_method if transaction doesn't have one
          if (!transaction.payment_method && bookingInfo.payment_method) {
            paymentMethod = bookingInfo.payment_method;
          }
        }
        
        // Default payment method if still unknown
        if (paymentMethod === "unknown" || !paymentMethod) {
          paymentMethod = "cash"; // Default to cash for jobs/bookings
        }
        
        // Ensure all values are properly serialized
        const amount = parseFloat(String(transaction.amount || "0")) || 0;
        const platformFee = parseFloat(String(transaction.platform_fee || "0")) || 0;
        
        return {
          id: String(transaction.id || ""),
          amount: Number(amount),
          netAmount: Number(amount - platformFee),
          platformFee: Number(platformFee),
          transactionType: String(transaction.transaction_type || "job_payment") as TransactionType,
          paymentStatus: String(transaction.payment_status || "pending") as PaymentStatus,
          paymentMethod: String(paymentMethod || "cash"),
          createdAt: transaction.created_at ? new Date(transaction.created_at).toISOString() : new Date().toISOString(),
          processedAt: transaction.processed_at ? new Date(transaction.processed_at).toISOString() : (transaction.created_at ? new Date(transaction.created_at).toISOString() : null),
          bookingId: transaction.booking_id ? String(transaction.booking_id) : null,
          serviceTitle: String(title || "Service"),
          bookingStatus: (status ? String(status) : null) as BookingStatus | null,
          currency: "MAD", // Default, could be made dynamic
        };
      });

      const total = Number(totalCount) || 0;
      const hasMore = (offset + limit) < total;

      return {
        transactions: mappedTransactions,
        hasMore,
        total,
      };
    }

    // If no transactions, get bookings and convert to transaction format
    // Fetch service titles separately
    const serviceIds = bookings
      .map((b) => b.tasker_service_id)
      .filter((id): id is string => id !== null && id !== undefined);

    let serviceTitleMap: Record<string, string> = {};
    
    if (serviceIds.length > 0) {
      const { data: services } = await supabase
        .from("tasker_services")
        .select("id, title")
        .in("id", serviceIds);

      for (const service of services || []) {
        serviceTitleMap[service.id] = service.title || "Service";
      }
    }

    // Convert booking data to transaction format with explicit serialization
    const mappedBookings = bookings.map((booking) => {
      const amount = parseFloat(String(booking.agreed_price || "0")) || 0;
      return {
        id: String(booking.id || ""),
        amount: Number(amount),
        netAmount: Number(amount),
        platformFee: 0,
        transactionType: "job_payment" as TransactionType, // Use job_payment as booking and job are the same
        paymentStatus: booking.status === "completed" ? ("paid" as PaymentStatus) : ("pending" as PaymentStatus),
        paymentMethod: String(booking.payment_method || "cash"),
        createdAt: booking.created_at ? new Date(booking.created_at).toISOString() : new Date().toISOString(),
        processedAt: booking.completed_at ? new Date(booking.completed_at).toISOString() : null,
        bookingId: String(booking.id || ""),
        serviceTitle: String(serviceTitleMap[booking.tasker_service_id] || "Service"),
        bookingStatus: String(booking.status || "") as BookingStatus,
        currency: String(booking.currency || "MAD"),
      };
    });

    const total = Number(totalCount) || 0;
    const hasMore = (offset + limit) < total;

    return {
      transactions: mappedBookings,
      hasMore,
      total,
    };
  } catch (error) {
    console.error("Error fetching customer transaction history:", error);
    // Return empty object instead of throwing to prevent server action errors
    return { transactions: [], hasMore: false, total: 0 };
  }
}

export async function getWalletBalance(): Promise<WalletBalance> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("User not authenticated");
  }

  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("Error fetching user wallet balance:", userError);
      throw userError;
    }

    // Get pending wallet transactions (handle empty table gracefully)
    const { data: pendingData, error: pendingError } = await supabase
      .from("wallet_transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("type", "pending");

    // Don't throw error if wallet_transactions table is empty, just log it
    if (pendingError) {
      console.warn("No wallet transactions found or error:", pendingError);
    }

    const pending = (pendingData || []).reduce(
      (sum, t) => sum + parseFloat(t.amount || "0"),
      0
    );

    return {
      available: parseFloat(userData.wallet_balance || "0"),
      pending,
      currency: "MAD", // Default currency, could be made dynamic
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return {
      available: 0,
      pending: 0,
      currency: "MAD",
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function getCustomerChartData(
  userId: string,
  period: "day" | "week" | "month" = "week"
): Promise<ChartData[]> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const validPeriods = ["day", "week", "month"];
  if (!validPeriods.includes(period)) {
    throw new Error(
      `Invalid period. Must be one of: ${validPeriods.join(", ")}`
    );
  }

  const supabase = await createClient();

  try {
    const now = new Date();
    let startDate: Date;
    let groupBy: string;

    switch (period) {
      case "day":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = "day";
        break;
      case "week":
        startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
        groupBy = "week";
        break;
      case "month":
        startDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
        groupBy = "month";
        break;
    }

    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        amount,
        created_at,
        booking_id,
        service_bookings!inner(
          id
        )
        `
      )
      .eq("payer_id", userId) // Customer is the payer
      .eq("payment_status", "paid")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Group data by period
    const groupedData = new Map<string, { expenses: number; jobs: number }>();

    (data || []).forEach((transaction) => {
      const date = new Date(transaction.created_at);
      let key: string;

      switch (groupBy) {
        case "day":
          key = date.toISOString().split("T")[0];
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          break;
        default:
          key = date.toISOString().split("T")[0];
      }

      if (!groupedData.has(key)) {
        groupedData.set(key, { expenses: 0, jobs: 0 });
      }

      const current = groupedData.get(key)!;
      current.expenses += parseFloat(transaction.amount);
      current.jobs += 1;
    });

    return Array.from(groupedData.entries())
      .map(([date, data]) => ({
        date,
        earnings: 0, // Customers don't earn
        expenses: data.expenses,
        jobs: data.jobs,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching customer chart data:", error);
    return [];
  }
}

// Enhanced error handling and validation
export async function validateFinanceAccess(userId: string): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, is_active")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.is_active === true;
  } catch (error) {
    console.error("Error validating finance access:", error);
    return false;
  }
}

export async function refreshFinanceData() {
  revalidatePath("/customer/finance");
  revalidatePath("/tasker/finance");
  return { success: true };
}
