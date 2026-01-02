"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/supabase/client";
import type { ConversationWithDetails } from "@/actions/messages";

interface UseConversationsRealtimeOptions {
  userId: string | null;
  enabled?: boolean;
  onNewConversation?: (conversation: ConversationWithDetails) => void;
  onConversationUpdate?: (conversation: ConversationWithDetails) => void;
  onNewMessage?: (conversationId: string) => void;
}

interface UseConversationsRealtimeReturn {
  isConnected: boolean;
}

/**
 * Hook to manage realtime subscriptions for conversations
 * Listens to conversations and messages tables to update conversation list
 */
export function useConversationsRealtime(
  options: UseConversationsRealtimeOptions
): UseConversationsRealtimeReturn {
  const { userId, enabled = true, onNewConversation, onConversationUpdate, onNewMessage } = options;
  const [isConnected, setIsConnected] = useState(false);

  // Store callbacks in refs to avoid reconnection loops
  const onNewConversationRef = useRef(onNewConversation);
  const onConversationUpdateRef = useRef(onConversationUpdate);
  const onNewMessageRef = useRef(onNewMessage);

  // Update refs when callbacks change
  useEffect(() => {
    onNewConversationRef.current = onNewConversation;
    onConversationUpdateRef.current = onConversationUpdate;
    onNewMessageRef.current = onNewMessage;
  }, [onNewConversation, onConversationUpdate, onNewMessage]);

  useEffect(() => {
    if (!userId || !enabled) {
      setIsConnected(false);
      return;
    }

    const supabase = createClient();
    const channelName = `conversations:${userId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
          filter: `participant1_id=eq.${userId}`,
        },
        (payload) => {
          console.log("New conversation (as participant1):", payload.new);
          // Trigger refresh of conversations list
          if (onNewConversationRef.current) {
            window.dispatchEvent(new CustomEvent('conversationCreated'));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
          filter: `participant2_id=eq.${userId}`,
        },
        (payload) => {
          console.log("New conversation (as participant2):", payload.new);
          if (onNewConversationRef.current) {
            window.dispatchEvent(new CustomEvent('conversationCreated'));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `participant1_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Conversation updated (as participant1):", payload.new);
          if (onConversationUpdateRef.current) {
            window.dispatchEvent(new CustomEvent('conversationUpdated', { detail: payload.new }));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `participant2_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Conversation updated (as participant2):", payload.new);
          if (onConversationUpdateRef.current) {
            window.dispatchEvent(new CustomEvent('conversationUpdated', { detail: payload.new }));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const message = payload.new as any;
          // Check if this message belongs to a conversation where user is a participant
          // This will trigger last_message_at update in conversations table
          if (onNewMessageRef.current && message.conversation_id) {
            window.dispatchEvent(new CustomEvent('newMessageInConversation', { 
              detail: { conversationId: message.conversation_id } 
            }));
          }
        }
      )
      .subscribe((status) => {
        console.log("Conversations channel status:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      console.log("Cleaning up conversations channel:", channelName);
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [userId, enabled]); // Removed callbacks from dependencies to prevent reconnection loops

  return {
    isConnected,
  };
}

