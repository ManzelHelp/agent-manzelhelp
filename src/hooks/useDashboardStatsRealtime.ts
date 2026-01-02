"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/supabase/client";

interface UseDashboardStatsRealtimeOptions {
  userId: string | null;
  enabled?: boolean;
  onStatsUpdate?: () => void;
}

interface UseDashboardStatsRealtimeReturn {
  isConnected: boolean;
}

/**
 * Hook to manage realtime subscriptions for dashboard stats
 * Combines subscriptions for bookings, jobs, transactions, and reviews
 */
export function useDashboardStatsRealtime(
  options: UseDashboardStatsRealtimeOptions
): UseDashboardStatsRealtimeReturn {
  const { userId, enabled = true, onStatsUpdate } = options;
  const [isConnected, setIsConnected] = useState(false);

  // Store callback in ref to avoid reconnection loops
  const onStatsUpdateRef = useRef(onStatsUpdate);

  // Update ref when callback changes
  useEffect(() => {
    onStatsUpdateRef.current = onStatsUpdate;
  }, [onStatsUpdate]);

  useEffect(() => {
    if (!userId || !enabled) {
      setIsConnected(false);
      return;
    }

    const supabase = createClient();
    const channelName = `dashboard_stats:${userId}`;

    const channel = supabase
      .channel(channelName)
      // Listen to bookings changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_bookings",
          filter: `tasker_id=eq.${userId}`,
        },
        () => {
          console.log("Booking changed - triggering stats update");
          if (onStatsUpdateRef.current) {
            onStatsUpdateRef.current();
          }
          window.dispatchEvent(new CustomEvent('dashboardStatsChanged'));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_bookings",
          filter: `customer_id=eq.${userId}`,
        },
        () => {
          console.log("Booking changed (customer) - triggering stats update");
          if (onStatsUpdateRef.current) {
            onStatsUpdateRef.current();
          }
          window.dispatchEvent(new CustomEvent('dashboardStatsChanged'));
        }
      )
      // Listen to jobs changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "jobs",
          filter: `customer_id=eq.${userId}`,
        },
        () => {
          console.log("Job changed - triggering stats update");
          if (onStatsUpdateRef.current) {
            onStatsUpdateRef.current();
          }
          window.dispatchEvent(new CustomEvent('dashboardStatsChanged'));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "jobs",
          filter: `assigned_tasker_id=eq.${userId}`,
        },
        () => {
          console.log("Job changed (tasker) - triggering stats update");
          if (onStatsUpdateRef.current) {
            onStatsUpdateRef.current();
          }
          window.dispatchEvent(new CustomEvent('dashboardStatsChanged'));
        }
      )
      // Listen to transactions changes
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
          filter: `payer_id=eq.${userId}`,
        },
        () => {
          console.log("Transaction created (payer) - triggering stats update");
          if (onStatsUpdateRef.current) {
            onStatsUpdateRef.current();
          }
          window.dispatchEvent(new CustomEvent('dashboardStatsChanged'));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          console.log("Transaction created (recipient) - triggering stats update");
          if (onStatsUpdateRef.current) {
            onStatsUpdateRef.current();
          }
          window.dispatchEvent(new CustomEvent('dashboardStatsChanged'));
        }
      )
      // Listen to wallet balance updates
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new.wallet_balance !== undefined) {
            console.log("Wallet balance updated - triggering stats update");
            if (onStatsUpdateRef.current) {
              onStatsUpdateRef.current();
            }
            window.dispatchEvent(new CustomEvent('dashboardStatsChanged'));
          }
        }
      )
      .subscribe((status) => {
        console.log("Dashboard stats channel status:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      console.log("Cleaning up dashboard stats channel:", channelName);
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [userId, enabled]); // Removed callback from dependencies to prevent reconnection loops

  return {
    isConnected,
  };
}

