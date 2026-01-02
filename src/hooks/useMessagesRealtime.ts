"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/supabase/client";
import type { MessageWithDetails } from "@/actions/messages";

interface UseMessagesRealtimeOptions {
  conversationId: string | null;
  enabled?: boolean;
  onNewMessage?: (message: MessageWithDetails) => void;
  onMessageUpdate?: (message: MessageWithDetails) => void;
}

interface UseMessagesRealtimeReturn {
  isConnected: boolean;
}

/**
 * Hook to manage realtime subscriptions for messages in a conversation
 */
export function useMessagesRealtime(
  options: UseMessagesRealtimeOptions
): UseMessagesRealtimeReturn {
  const { conversationId, enabled = true, onNewMessage, onMessageUpdate } = options;
  const [isConnected, setIsConnected] = useState(false);

  // Store callbacks in refs to avoid reconnection loops
  const onNewMessageRef = useRef(onNewMessage);
  const onMessageUpdateRef = useRef(onMessageUpdate);

  // Update refs when callbacks change
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onMessageUpdateRef.current = onMessageUpdate;
  }, [onNewMessage, onMessageUpdate]);

  useEffect(() => {
    if (!conversationId || !enabled) {
      setIsConnected(false);
      return;
    }

    const supabase = createClient();
    const channelName = `messages:${conversationId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          console.log("New message received:", newMessage);
          
          if (onNewMessageRef.current) {
            // Transform to MessageWithDetails format
            const message: MessageWithDetails = {
              id: String(newMessage.id),
              conversation_id: String(newMessage.conversation_id),
              sender_id: String(newMessage.sender_id),
              content: String(newMessage.content),
              attachment_url: newMessage.attachment_url ? String(newMessage.attachment_url) : undefined,
              is_read: Boolean(newMessage.is_read),
              created_at: newMessage.created_at ? new Date(newMessage.created_at).toISOString() : new Date().toISOString(),
            };
            onNewMessageRef.current(message);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as any;
          console.log("Message updated:", updatedMessage);
          
          if (onMessageUpdateRef.current) {
            const message: MessageWithDetails = {
              id: String(updatedMessage.id),
              conversation_id: String(updatedMessage.conversation_id),
              sender_id: String(updatedMessage.sender_id),
              content: String(updatedMessage.content),
              attachment_url: updatedMessage.attachment_url ? String(updatedMessage.attachment_url) : undefined,
              is_read: Boolean(updatedMessage.is_read),
              created_at: updatedMessage.created_at ? new Date(updatedMessage.created_at).toISOString() : new Date().toISOString(),
            };
            onMessageUpdateRef.current(message);
          }
        }
      )
      .subscribe((status) => {
        console.log("Messages channel status:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      console.log("Cleaning up messages channel:", channelName);
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [conversationId, enabled]); // Removed callbacks from dependencies to prevent reconnection loops

  return {
    isConnected,
  };
}

