"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/supabase/client";

interface UseBookingsRealtimeOptions {
  userId: string | null;
  enabled?: boolean;
  onBookingUpdate?: (bookingId: string, updates: any) => void;
  onNewBooking?: (booking: any) => void;
}

interface UseBookingsRealtimeReturn {
  isConnected: boolean;
}

/**
 * Hook to manage realtime subscriptions for service bookings
 * Listens to status changes and updates
 */
export function useBookingsRealtime(
  options: UseBookingsRealtimeOptions
): UseBookingsRealtimeReturn {
  const { userId, enabled = true, onBookingUpdate, onNewBooking } = options;
  const [isConnected, setIsConnected] = useState(false);

  // Store callbacks in refs to avoid reconnection loops
  const onBookingUpdateRef = useRef(onBookingUpdate);
  const onNewBookingRef = useRef(onNewBooking);

  // Update refs when callbacks change
  useEffect(() => {
    onBookingUpdateRef.current = onBookingUpdate;
    onNewBookingRef.current = onNewBooking;
  }, [onBookingUpdate, onNewBooking]);

  useEffect(() => {
    if (!userId || !enabled) {
      setIsConnected(false);
      return;
    }

    const supabase = createClient();
    const channelName = `bookings:${userId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "service_bookings",
          filter: `customer_id=eq.${userId}`,
        },
        (payload) => {
          console.log("New booking created (customer):", payload.new);
          if (onNewBookingRef.current) {
            onNewBookingRef.current(payload.new);
          }
          window.dispatchEvent(new CustomEvent('bookingCreated', { detail: payload.new }));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "service_bookings",
          filter: `tasker_id=eq.${userId}`,
        },
        (payload) => {
          console.log("New booking created (tasker):", payload.new);
          if (onNewBookingRef.current) {
            onNewBookingRef.current(payload.new);
          }
          window.dispatchEvent(new CustomEvent('bookingCreated', { detail: payload.new }));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "service_bookings",
          filter: `customer_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Booking updated (customer):", payload.new);
          if (onBookingUpdateRef.current) {
            onBookingUpdateRef.current(String(payload.new.id), payload.new);
          }
          window.dispatchEvent(new CustomEvent('bookingUpdated', { detail: payload.new }));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "service_bookings",
          filter: `tasker_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Booking updated (tasker):", payload.new);
          if (onBookingUpdateRef.current) {
            onBookingUpdateRef.current(String(payload.new.id), payload.new);
          }
          window.dispatchEvent(new CustomEvent('bookingUpdated', { detail: payload.new }));
        }
      )
      .subscribe((status) => {
        console.log("Bookings channel status:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      console.log("Cleaning up bookings channel:", channelName);
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [userId, enabled]); // Removed callbacks from dependencies to prevent reconnection loops

  return {
    isConnected,
  };
}

