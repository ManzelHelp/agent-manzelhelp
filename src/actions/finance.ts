"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

// Enhanced type definitions with better organization
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type TransactionType =
  | "job_payment"
  | "platform_fee"
  | "premium_application"
  | "refund"
  | "job_promotion"
  | "service_promotion"
  | "booking_payment"
  | "service_payment"
  | "cash_payment";
export type BookingStatus =
  | "pending"
  | "accepted"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed"
  | "refunded";

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
  amount: string;
  net_amount: string;
  platform_fee: string | null;
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

    // Current period queries
    const [todayResult, weekResult, monthResult, totalResult] =
      await Promise.all([
        supabase
          .from("transactions")
          .select("net_amount")
          .eq("payee_id", user.id)
          .eq("payment_status", "paid")
          .gte("created_at", startOfToday.toISOString()),

        supabase
          .from("transactions")
          .select("net_amount")
          .eq("payee_id", user.id)
          .eq("payment_status", "paid")
          .gte("created_at", startOfWeek.toISOString()),

        supabase
          .from("transactions")
          .select("net_amount")
          .eq("payee_id", user.id)
          .eq("payment_status", "paid")
          .gte("created_at", startOfMonth.toISOString()),

        supabase
          .from("transactions")
          .select("net_amount")
          .eq("payee_id", user.id)
          .eq("payment_status", "paid"),
      ]);

    // Previous period queries for trend calculation
    const yesterday = new Date(startOfToday);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const [yesterdayResult, lastWeekResult, lastMonthResult] =
      await Promise.all([
        supabase
          .from("transactions")
          .select("net_amount")
          .eq("payee_id", user.id)
          .eq("payment_status", "paid")
          .gte("created_at", yesterday.toISOString())
          .lt("created_at", startOfToday.toISOString()),

        supabase
          .from("transactions")
          .select("net_amount")
          .eq("payee_id", user.id)
          .eq("payment_status", "paid")
          .gte("created_at", startOfLastWeek.toISOString())
          .lt("created_at", startOfWeek.toISOString()),

        supabase
          .from("transactions")
          .select("net_amount")
          .eq("payee_id", user.id)
          .eq("payment_status", "paid")
          .gte("created_at", startOfLastMonth.toISOString())
          .lt("created_at", startOfMonth.toISOString()),
      ]);

    const calculateTotal = (data: { net_amount: string }[]) =>
      data.reduce((sum, item) => sum + (parseFloat(item.net_amount) || 0), 0);

    const todayEarnings = calculateTotal(todayResult.data || []);
    const weekEarnings = calculateTotal(weekResult.data || []);
    const monthEarnings = calculateTotal(monthResult.data || []);
    const totalEarnings = calculateTotal(totalResult.data || []);

    const yesterdayEarnings = calculateTotal(yesterdayResult.data || []);
    const lastWeekEarnings = calculateTotal(lastWeekResult.data || []);
    const lastMonthEarnings = calculateTotal(lastMonthResult.data || []);

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
      currency: "USD",
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
      currency: "USD",
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
    const [reviewsResult, bookingsResult] = await Promise.all([
      supabase
        .from("reviews")
        .select("overall_rating")
        .eq("reviewee_id", user.id),

      supabase
        .from("service_bookings")
        .select("status, created_at, accepted_at")
        .eq("tasker_id", user.id),
    ]);

    const reviews = reviewsResult.data || [];
    const bookings = bookingsResult.data || [];

    const completedJobs = bookings.filter(
      (b) => b.status === "completed"
    ).length;
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / totalReviews
        : 0;
    const positiveReviews = reviews.filter((r) => r.overall_rating >= 4).length;

    // Calculate average response time (time between booking creation and acceptance)
    const acceptedBookings = bookings.filter(
      (b) => b.accepted_at && b.created_at
    );
    const responseTimes = acceptedBookings.map((b) => {
      const created = new Date(b.created_at);
      const accepted = new Date(b.accepted_at!);
      return accepted.getTime() - created.getTime();
    });
    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
        : 0;

    return {
      completedJobs,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      responseTime: Math.round(averageResponseTime / (1000 * 60 * 60)), // Convert to hours
      positiveReviews,
      completionRate:
        completedJobs > 0 ? (completedJobs / bookings.length) * 100 : 0,
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
  limit: number = 20,
  offset: number = 0
): Promise<Transaction[]> {
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
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        id,
        amount,
        net_amount,
        platform_fee,
        transaction_type,
        payment_status,
        payment_method,
        created_at,
        processed_at,
        booking_id,
      service_bookings(
        id,
        status,
        tasker_services(
          title
        )
      )
      `
      )
      .eq("payee_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (data || []).map((transaction: TransactionWithBooking) => ({
      id: transaction.id,
      amount: parseFloat(transaction.amount),
      netAmount: parseFloat(transaction.net_amount),
      platformFee: parseFloat(transaction.platform_fee || "0"),
      transactionType: transaction.transaction_type,
      paymentStatus: transaction.payment_status,
      paymentMethod: transaction.payment_method,
      createdAt: transaction.created_at,
      processedAt: transaction.processed_at,
      bookingId: transaction.booking_id,
      serviceTitle:
        transaction.service_bookings?.[0]?.tasker_services?.[0]?.title || null,
      bookingStatus: transaction.service_bookings?.[0]?.status || null,
      currency: "USD",
    }));
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

    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        net_amount,
        created_at,
        booking_id,
        service_bookings!inner(
          id
        )
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
      current.earnings += parseFloat(transaction.net_amount);
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
  period: "week" | "month" | "year" = "month"
): Promise<FinanceSummary> {
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

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const [spentResult, pendingResult, bookingsResult] = await Promise.all([
      // Total spent (as payer) - handle empty transactions table
      supabase
        .from("transactions")
        .select("amount, currency")
        .eq("payer_id", user.id)
        .eq("payment_status", "paid")
        .gte("created_at", startDate.toISOString()),

      // Pending payments - handle empty transactions table
      supabase
        .from("transactions")
        .select("amount, currency")
        .eq("payer_id", user.id)
        .eq("payment_status", "pending"),

      // Completed bookings - use actual data
      supabase
        .from("service_bookings")
        .select("agreed_price, currency, status, completed_at")
        .eq("customer_id", user.id)
        .eq("status", "completed")
        .gte("completed_at", startDate.toISOString()),
    ]);

    // Calculate total spent from transactions (if any exist)
    const totalSpent = (spentResult.data || []).reduce(
      (sum, t) => sum + parseFloat(t.amount || "0"),
      0
    );

    // Calculate pending payments from transactions (if any exist)
    const pendingPayments = (pendingResult.data || []).reduce(
      (sum, t) => sum + parseFloat(t.amount || "0"),
      0
    );

    // Get completed jobs and calculate average
    const completedJobs = bookingsResult.data?.length || 0;
    const averageJobValue =
      completedJobs > 0
        ? (bookingsResult.data || []).reduce(
            (sum, b) => sum + parseFloat(b.agreed_price || "0"),
            0
          ) / completedJobs
        : 0;

    // Get currency from first booking or default to USD
    const currency = bookingsResult.data?.[0]?.currency || "USD";

    return {
      totalSpent,
      totalEarned: 0, // Customers don't earn, they spend
      pendingPayments,
      completedJobs,
      averageJobValue,
      currency,
      period,
    };
  } catch (error) {
    console.error("Error fetching customer finance summary:", error);
    return {
      totalSpent: 0,
      totalEarned: 0,
      pendingPayments: 0,
      completedJobs: 0,
      averageJobValue: 0,
      currency: "USD",
      period,
    };
  }
}

export async function getCustomerTransactionHistory(
  limit: number = 20,
  offset: number = 0
): Promise<Transaction[]> {
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
    // First try to get transactions
    const { data: transactionData } = await supabase
      .from("transactions")
      .select(
        `
        id,
        amount,
        net_amount,
        platform_fee,
        transaction_type,
        payment_status,
        payment_method,
        created_at,
        processed_at,
        booking_id,
        service_bookings(
          id,
          status,
          tasker_services(
            title
          )
        )
        `
      )
      .eq("payer_id", user.id) // Customer is the payer
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // If transactions exist, return them
    if (transactionData && transactionData.length > 0) {
      return transactionData.map((transaction: TransactionWithBooking) => ({
        id: transaction.id,
        amount: parseFloat(transaction.amount),
        netAmount: parseFloat(transaction.net_amount),
        platformFee: parseFloat(transaction.platform_fee || "0"),
        transactionType: transaction.transaction_type,
        paymentStatus: transaction.payment_status,
        paymentMethod: transaction.payment_method,
        createdAt: transaction.created_at,
        processedAt: transaction.processed_at,
        bookingId: transaction.booking_id,
        serviceTitle:
          transaction.service_bookings?.[0]?.tasker_services?.[0]?.title ||
          null,
        bookingStatus: transaction.service_bookings?.[0]?.status || null,
        currency: "USD", // Default currency
      }));
    }

    // If no transactions, fallback to booking data
    console.warn("No transactions found, falling back to booking data");
    const { data: bookingData, error: bookingError } = await supabase
      .from("service_bookings")
      .select(
        `
        id,
        agreed_price,
        currency,
        status,
        payment_method,
        created_at,
        completed_at,
        tasker_services(
          title
        )
        `
      )
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (bookingError) {
      console.error("Error fetching booking data:", bookingError);
      return [];
    }

    // Convert booking data to transaction format
    return (bookingData || []).map(
      (booking: {
        id: string;
        agreed_price: string;
        currency: string;
        status: string;
        payment_method: string;
        created_at: string;
        completed_at: string;
        tasker_services: { title: string }[];
      }) => ({
        id: booking.id,
        amount: parseFloat(booking.agreed_price || "0"),
        netAmount: parseFloat(booking.agreed_price || "0"),
        platformFee: 0,
        transactionType: "booking_payment" as TransactionType,
        paymentStatus: booking.status === "completed" ? "paid" : "pending",
        paymentMethod: booking.payment_method || "unknown",
        createdAt: booking.created_at,
        processedAt: booking.completed_at,
        bookingId: booking.id,
        serviceTitle: booking.tasker_services?.[0]?.title || "Service",
        bookingStatus: booking.status as BookingStatus,
        currency: booking.currency || "USD",
      })
    );
  } catch (error) {
    console.error("Error fetching customer transaction history:", error);
    return [];
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
      currency: "USD", // Default currency, could be made dynamic
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return {
      available: 0,
      pending: 0,
      currency: "USD",
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
