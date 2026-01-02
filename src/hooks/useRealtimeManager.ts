"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/supabase/client";

interface ChannelSubscription {
  channelName: string;
  channel: ReturnType<typeof createClient>["channel"];
  subscribers: Set<string>;
}

/**
 * Centralized realtime manager to avoid duplicate subscriptions
 * Manages all Supabase realtime channels in one place
 */
class RealtimeManager {
  private static instance: RealtimeManager;
  private channels: Map<string, ChannelSubscription> = new Map();
  private supabase = createClient();

  private constructor() {}

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  /**
   * Subscribe to a channel with a unique subscriber ID
   * Returns cleanup function
   */
  subscribe(
    channelName: string,
    subscriberId: string,
    config: {
      table: string;
      filter?: string;
      events?: ("INSERT" | "UPDATE" | "DELETE")[];
      callback: (payload: any) => void;
    }
  ): () => void {
    let channelSub = this.channels.get(channelName);

    if (!channelSub) {
      // Create new channel
      const channel = this.supabase.channel(channelName);

      // Set up postgres_changes listeners
      const events = config.events || ["INSERT", "UPDATE", "DELETE"];
      events.forEach((event) => {
        channel.on(
          "postgres_changes",
          {
            event,
            schema: "public",
            table: config.table,
            filter: config.filter,
          },
          (payload) => {
            // Notify all subscribers
            channelSub?.subscribers.forEach((subId) => {
              // Each subscriber will handle the callback
              config.callback(payload);
            });
          }
        );
      });

      channel.subscribe();
      channelSub = {
        channelName,
        channel,
        subscribers: new Set(),
      };
      this.channels.set(channelName, channelSub);
    }

    // Add subscriber
    channelSub.subscribers.add(subscriberId);

    // Return cleanup function
    return () => {
      const sub = this.channels.get(channelName);
      if (sub) {
        sub.subscribers.delete(subscriberId);
        // If no more subscribers, remove channel
        if (sub.subscribers.size === 0) {
          this.supabase.removeChannel(sub.channel);
          this.channels.delete(channelName);
        }
      }
    };
  }

  /**
   * Get active channels count (for debugging)
   */
  getActiveChannelsCount(): number {
    return this.channels.size;
  }
}

/**
 * Hook to use the centralized realtime manager
 * This ensures we don't create duplicate subscriptions
 */
export function useRealtimeManager() {
  const managerRef = useRef(RealtimeManager.getInstance());

  useEffect(() => {
    return () => {
      // Cleanup is handled by individual subscriptions
    };
  }, []);

  return managerRef.current;
}

