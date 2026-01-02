"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/supabase/client";

interface UseJobsRealtimeOptions {
  userId: string | null;
  enabled?: boolean;
  onJobUpdate?: (jobId: string, updates: any) => void;
  onNewJob?: (job: any) => void;
}

interface UseJobsRealtimeReturn {
  isConnected: boolean;
}

/**
 * Hook to manage realtime subscriptions for jobs
 * Listens to status changes and updates
 */
export function useJobsRealtime(
  options: UseJobsRealtimeOptions
): UseJobsRealtimeReturn {
  const { userId, enabled = true, onJobUpdate, onNewJob } = options;
  const [isConnected, setIsConnected] = useState(false);

  // Store callbacks in refs to avoid reconnection loops
  const onJobUpdateRef = useRef(onJobUpdate);
  const onNewJobRef = useRef(onNewJob);

  // Update refs when callbacks change
  useEffect(() => {
    onJobUpdateRef.current = onJobUpdate;
    onNewJobRef.current = onNewJob;
  }, [onJobUpdate, onNewJob]);

  useEffect(() => {
    if (!userId || !enabled) {
      setIsConnected(false);
      return;
    }

    const supabase = createClient();
    const channelName = `jobs:${userId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "jobs",
          filter: `customer_id=eq.${userId}`,
        },
        (payload) => {
          console.log("New job created:", payload.new);
          if (onNewJobRef.current) {
            onNewJobRef.current(payload.new);
          }
          // Trigger refresh
          window.dispatchEvent(new CustomEvent('jobCreated', { detail: payload.new }));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "jobs",
          filter: `customer_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Job updated (customer):", payload.new);
          if (onJobUpdateRef.current) {
            onJobUpdateRef.current(String(payload.new.id), payload.new);
          }
          window.dispatchEvent(new CustomEvent('jobUpdated', { detail: payload.new }));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "jobs",
          filter: `assigned_tasker_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Job updated (tasker):", payload.new);
          if (onJobUpdateRef.current) {
            onJobUpdateRef.current(String(payload.new.id), payload.new);
          }
          window.dispatchEvent(new CustomEvent('jobUpdated', { detail: payload.new }));
        }
      )
      .subscribe((status) => {
        console.log("Jobs channel status:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      console.log("Cleaning up jobs channel:", channelName);
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [userId, enabled]); // Removed callbacks from dependencies to prevent reconnection loops

  return {
    isConnected,
  };
}

