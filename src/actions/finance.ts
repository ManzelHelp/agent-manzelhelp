"use server";

import { createClient } from "@/supabase/server";
import type { Transaction, UserStats } from "@/types/supabase";

export interface FinanceStats {
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  total: number;
}

export interface TransactionWithDetails extends Transaction {
  customer_name?: string;
  service_name?: string;
  booking_title?: string;
}

export interface FinanceData {
  stats: FinanceStats;
  transactions: TransactionWithDetails[];
  userStats: UserStats | null;
}

// Type definitions for database responses
interface JobWithDetails {
  id: string;
  customer_id: string;
  service_id: number;
  assigned_tasker_id: string;
  status: string;
  users?: {
    first_name: string;
    last_name: string;
  };
  services?: {
    name_en: string;
  };
}

interface TransactionWithJob extends Transaction {
  jobs?: JobWithDetails;
}

interface CompletedJob {
  final_price: string | number;
  completed_at?: string;
  created_at?: string;
}

// Utility function to transform transaction data
const transformTransaction = (
  transaction: TransactionWithJob
): TransactionWithDetails => ({
  ...transaction,
  customer_name: transaction.jobs?.users?.first_name
    ? `${transaction.jobs.users.first_name} ${
        transaction.jobs.users.last_name || ""
      }`
    : "Unknown Customer",
  service_name: transaction.jobs?.services?.name_en || "Unknown Service",
  booking_title: `Job #${transaction.jobs?.id?.slice(-8) || "Unknown"}`,
});

// Utility function to calculate date periods
const getDatePeriods = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekStart = new Date(
    today.getTime() - today.getDay() * 24 * 60 * 60 * 1000
  );
  const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  return {
    today,
    yesterday,
    weekStart,
    lastWeekStart,
    monthStart,
    lastMonthStart,
  };
};

export async function getTaskerFinanceData(
  userId: string
): Promise<FinanceData> {
  const supabase = await createClient();

  try {
    // Get user stats
    const { data: userStats, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("id", userId)
      .single();

    if (statsError && statsError.code !== "PGRST116") {
      console.error("Error fetching user stats:", statsError);
    }

    // Get all transactions for the tasker
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select(
        `
        *,
        jobs!inner(
          id,
          customer_id,
          service_id,
          assigned_tasker_id,
          status,
          users!jobs_customer_id_fkey(
            first_name,
            last_name
          ),
          services!inner(name_en)
        )
      `
      )
      .eq("payee_id", userId)
      .order("created_at", { ascending: false });

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError);
      throw new Error("Failed to fetch transactions");
    }

    // Get completed jobs for earnings calculation
    const { data: completedJobs, error: jobsError } = await supabase
      .from("jobs")
      .select("final_price, created_at, completed_at")
      .eq("assigned_tasker_id", userId)
      .eq("status", "completed");

    if (jobsError) {
      console.error("Error fetching completed jobs:", jobsError);
      throw new Error("Failed to fetch completed jobs");
    }

    // Calculate finance stats
    const stats = calculateFinanceStats(completedJobs || []);

    // Transform transactions to include customer and service details
    const transformedTransactions = (transactions || []).map(
      transformTransaction
    );

    return {
      stats,
      transactions: transformedTransactions,
      userStats: userStats,
    };
  } catch (error) {
    console.error("Error in getTaskerFinanceData:", error);
    throw new Error("Failed to fetch finance data");
  }
}

function calculateFinanceStats(completedJobs: CompletedJob[]): FinanceStats {
  const {
    today,
    yesterday,
    weekStart,
    lastWeekStart,
    monthStart,
    lastMonthStart,
  } = getDatePeriods();

  let todayEarnings = 0;
  let yesterdayEarnings = 0;
  let thisWeekEarnings = 0;
  let lastWeekEarnings = 0;
  let thisMonthEarnings = 0;
  let lastMonthEarnings = 0;
  let totalEarnings = 0;

  completedJobs.forEach((job) => {
    const jobDate = new Date(job.completed_at || job.created_at || new Date());
    const amount = parseFloat(String(job.final_price)) || 0;

    totalEarnings += amount;

    if (jobDate >= today) {
      todayEarnings += amount;
    } else if (jobDate >= yesterday && jobDate < today) {
      yesterdayEarnings += amount;
    }

    if (jobDate >= weekStart) {
      thisWeekEarnings += amount;
    } else if (jobDate >= lastWeekStart && jobDate < weekStart) {
      lastWeekEarnings += amount;
    }

    if (jobDate >= monthStart) {
      thisMonthEarnings += amount;
    } else if (jobDate >= lastMonthStart && jobDate < monthStart) {
      lastMonthEarnings += amount;
    }
  });

  return {
    today: todayEarnings,
    yesterday: yesterdayEarnings,
    thisWeek: thisWeekEarnings,
    lastWeek: lastWeekEarnings,
    thisMonth: thisMonthEarnings,
    lastMonth: lastMonthEarnings,
    total: totalEarnings,
  };
}

export async function getTaskerTransactions(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<TransactionWithDetails[]> {
  const supabase = await createClient();

  try {
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        jobs!inner(
          id,
          customer_id,
          service_id,
          assigned_tasker_id,
          status,
          users!jobs_customer_id_fkey(
            first_name,
            last_name
          ),
          services!inner(name_en)
        )
      `
      )
      .eq("payee_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching transactions:", error);
      throw new Error("Failed to fetch transactions");
    }

    return (transactions || []).map(transformTransaction);
  } catch (error) {
    console.error("Error in getTaskerTransactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}

export async function getTaskerEarningsByPeriod(
  userId: string,
  period: "day" | "week" | "month" = "month",
  limit: number = 30
): Promise<{ date: string; earnings: number }[]> {
  const supabase = await createClient();

  try {
    const { data: completedJobs, error } = await supabase
      .from("jobs")
      .select("final_price, completed_at, created_at")
      .eq("assigned_tasker_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(limit * 10); // Get more data to ensure we have enough for grouping

    if (error) {
      console.error("Error fetching earnings data:", error);
      throw new Error("Failed to fetch earnings data");
    }

    const earningsByDate = new Map<string, number>();

    (completedJobs || []).forEach((job: CompletedJob) => {
      const date = new Date(job.completed_at || job.created_at || new Date());
      const dateKey = getDateKey(date, period);

      const currentEarnings = earningsByDate.get(dateKey) || 0;
      earningsByDate.set(
        dateKey,
        currentEarnings + parseFloat(String(job.final_price || 0))
      );
    });

    return Array.from(earningsByDate.entries())
      .map(([date, earnings]) => ({ date, earnings }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-limit);
  } catch (error) {
    console.error("Error in getTaskerEarningsByPeriod:", error);
    throw new Error("Failed to fetch earnings data");
  }
}

// Utility function to generate date keys for different periods
function getDateKey(date: Date, period: "day" | "week" | "month"): string {
  switch (period) {
    case "day":
      return date.toISOString().split("T")[0];
    case "week":
      return `${date.getFullYear()}-W${Math.ceil(
        (date.getDate() +
          new Date(date.getFullYear(), date.getMonth(), 1).getDay()) /
          7
      )}`;
    case "month":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    default:
      return date.toISOString().split("T")[0];
  }
}
