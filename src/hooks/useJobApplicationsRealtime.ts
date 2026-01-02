"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/supabase/client";

interface UseJobApplicationsRealtimeOptions {
  jobId?: string | null;
  taskerId?: string | null;
  enabled?: boolean;
  onNewApplication?: (application: any) => void;
  onApplicationUpdate?: (applicationId: string, updates: any) => void;
}

interface UseJobApplicationsRealtimeReturn {
  isConnected: boolean;
}

/**
 * Hook to manage realtime subscriptions for job applications
 */
export function useJobApplicationsRealtime(
  options: UseJobApplicationsRealtimeOptions
): UseJobApplicationsRealtimeReturn {
  const { jobId, taskerId, enabled = true, onNewApplication, onApplicationUpdate } = options;
  const [isConnected, setIsConnected] = useState(false);

  // Store callbacks in refs to avoid reconnection loops
  const onNewApplicationRef = useRef(onNewApplication);
  const onApplicationUpdateRef = useRef(onApplicationUpdate);

  // Update refs when callbacks change
  useEffect(() => {
    onNewApplicationRef.current = onNewApplication;
    onApplicationUpdateRef.current = onApplicationUpdate;
  }, [onNewApplication, onApplicationUpdate]);

  useEffect(() => {
    if (!enabled || (!jobId && !taskerId)) {
      setIsConnected(false);
      return;
    }

    const supabase = createClient();
    const channelName = `job_applications:${jobId || taskerId}`;

    let channel = supabase.channel(channelName);

    if (jobId) {
      channel = channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "job_applications",
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          console.log("New job application:", payload.new);
          if (onNewApplicationRef.current) {
            onNewApplicationRef.current(payload.new);
          }
          window.dispatchEvent(new CustomEvent('jobApplicationCreated', { detail: payload.new }));
        }
      ).on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "job_applications",
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          console.log("Job application updated:", payload.new);
          if (onApplicationUpdateRef.current) {
            onApplicationUpdateRef.current(String(payload.new.id), payload.new);
          }
          window.dispatchEvent(new CustomEvent('jobApplicationUpdated', { detail: payload.new }));
        }
      );
    }

    if (taskerId) {
      channel = channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "job_applications",
          filter: `tasker_id=eq.${taskerId}`,
        },
        (payload) => {
          console.log("New job application (tasker):", payload.new);
          if (onNewApplicationRef.current) {
            onNewApplicationRef.current(payload.new);
          }
          window.dispatchEvent(new CustomEvent('jobApplicationCreated', { detail: payload.new }));
        }
      ).on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "job_applications",
          filter: `tasker_id=eq.${taskerId}`,
        },
        (payload) => {
          console.log("Job application updated (tasker):", payload.new);
          if (onApplicationUpdateRef.current) {
            onApplicationUpdateRef.current(String(payload.new.id), payload.new);
          }
          window.dispatchEvent(new CustomEvent('jobApplicationUpdated', { detail: payload.new }));
        }
      );
    }

    channel.subscribe((status) => {
      console.log("Job applications channel status:", status);
      setIsConnected(status === "SUBSCRIBED");
    });

    return () => {
      console.log("Cleaning up job applications channel:", channelName);
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [jobId, taskerId, enabled]); // Removed callbacks from dependencies to prevent reconnection loops

  return {
    isConnected,
  };
}

