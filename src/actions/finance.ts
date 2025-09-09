"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

export interface EarningsData {
  today: number;
  week: number;
  month: number;
  total: number;
  todayChange: number;
  weekChange: number;
  monthChange: number;
}

export interface PerformanceMetrics {
  completedJobs: number;
  totalReviews: number;
  averageRating: number;
  responseTime: number;
  positiveReviews: number;
}

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
}

export interface ChartData {
  date: string;
  earnings: number;
  jobs: number;
}

interface TransactionWithBooking {
  id: string;
  amount: string;
  net_amount: string;
  platform_fee: string | null;
  transaction_type: TransactionType;
  payment_status: PaymentStatus;
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

export async function getEarningsData(userId: string): Promise<EarningsData> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const supabase = await createClient();

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
          .eq("payee_id", userId)
          .eq("payment_status", "paid")
          .gte("created_at", startOfToday.toISOString()),

        supabase
          .from("transactions")
          .select("net_amount")
          .eq("payee_id", userId)
          .eq("payment_status", "paid")
          .gte("created_at", startOfWeek.toISOString()),

        supabase
          .from("transactions")
          .select("net_amount")
          .eq("payee_id", userId)
          .eq("payment_status", "paid")
          .gte("created_at", startOfMonth.toISOString()),

        supabase
          .from("transactions")
          .select("net_amount")
          .eq("payee_id", userId)
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
          .eq("payee_id", userId)
          .eq("payment_status", "paid")
          .gte("created_at", yesterday.toISOString())
          .lt("created_at", startOfToday.toISOString()),

        supabase
          .from("transactions")
          .select("net_amount")
          .eq("payee_id", userId)
          .eq("payment_status", "paid")
          .gte("created_at", startOfLastWeek.toISOString())
          .lt("created_at", startOfWeek.toISOString()),

        supabase
          .from("transactions")
          .select("net_amount")
          .eq("payee_id", userId)
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
    };
  }
}

export async function getPerformanceMetrics(
  userId: string
): Promise<PerformanceMetrics> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const supabase = await createClient();

  try {
    const [reviewsResult, bookingsResult] = await Promise.all([
      supabase
        .from("reviews")
        .select("overall_rating")
        .eq("reviewee_id", userId),

      supabase
        .from("service_bookings")
        .select("status, created_at, accepted_at")
        .eq("tasker_id", userId),
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
    };
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return {
      completedJobs: 0,
      totalReviews: 0,
      averageRating: 0,
      responseTime: 0,
      positiveReviews: 0,
    };
  }
}

export async function getTransactionHistory(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Transaction[]> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (limit < 1 || limit > 100) {
    throw new Error("Limit must be between 1 and 100");
  }

  if (offset < 0) {
    throw new Error("Offset must be non-negative");
  }

  const supabase = await createClient();

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
      .eq("payee_id", userId)
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
      createdAt: transaction.created_at,
      processedAt: transaction.processed_at,
      bookingId: transaction.booking_id,
      serviceTitle:
        transaction.service_bookings?.[0]?.tasker_services?.[0]?.title || null,
      bookingStatus: transaction.service_bookings?.[0]?.status || null,
    }));
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return [];
  }
}

export async function getChartData(
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
      .eq("payee_id", userId)
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

export async function refreshFinanceData() {
  revalidatePath("/tasker/finance");
  return { success: true };
}
