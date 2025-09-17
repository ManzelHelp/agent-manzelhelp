"use server";

import { createClient } from "@/supabase/server";
import { handleError } from "@/lib/utils";
import type { Conversation, Message } from "@/types/supabase";
import { revalidatePath } from "next/cache";

export interface MessageWithDetails extends Message {
  sender?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  conversation?: {
    participant1_id: string;
    participant2_id: string;
    job_id?: string;
    service_id?: string;
    booking_id?: string;
  };
  other_participant?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  service_title?: string;
  job_title?: string;
  booking_title?: string;
}

export interface ConversationWithDetails extends Conversation {
  other_participant?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  last_message?: MessageWithDetails;
  unread_count?: number;
  service_title?: string;
  job_title?: string;
  booking_title?: string;
}

// Get all conversations for a user with details
export const getConversationsAction = async (): Promise<{
  conversations: ConversationWithDetails[];
  errorMessage: string | null;
}> => {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Get conversations where user is a participant
    const { data: conversations, error: conversationsError } = await supabase
      .from("conversations")
      .select(
        `
        *,
        participant1:users!conversations_participant1_id_fkey(
          first_name,
          last_name,
          avatar_url
        ),
        participant2:users!conversations_participant2_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (conversationsError) {
      throw conversationsError;
    }

    if (!conversations || conversations.length === 0) {
      return { conversations: [], errorMessage: null };
    }

    // Get the last message and unread count for each conversation
    const conversationIds = conversations.map((c) => c.id);

    // Get last messages
    const { data: lastMessages, error: lastMessagesError } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    if (lastMessagesError) {
      throw lastMessagesError;
    }

    // Get unread counts
    const { data: unreadCounts, error: unreadCountsError } = await supabase
      .from("messages")
      .select("conversation_id")
      .in("conversation_id", conversationIds)
      .eq("is_read", false)
      .neq("sender_id", user.id);

    if (unreadCountsError) {
      throw unreadCountsError;
    }

    // Process conversations with additional details
    const processedConversations: ConversationWithDetails[] = conversations.map(
      (conv) => {
        const otherParticipant =
          conv.participant1_id === user.id
            ? conv.participant2
            : conv.participant1;

        const lastMessage = lastMessages?.find(
          (msg) => msg.conversation_id === conv.id
        );
        const unreadCount =
          unreadCounts?.filter((count) => count.conversation_id === conv.id)
            .length || 0;

        return {
          ...conv,
          other_participant: otherParticipant,
          last_message: lastMessage,
          unread_count: unreadCount,
        };
      }
    );

    return { conversations: processedConversations, errorMessage: null };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { conversations: [], ...handleError(error) };
  }
};

// Get messages for a specific conversation
export const getMessagesAction = async (
  conversationId: string
): Promise<{
  messages: MessageWithDetails[];
  conversation: ConversationWithDetails | null;
  errorMessage: string | null;
}> => {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Get conversation details
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select(
        `
        *,
        participant1:users!conversations_participant1_id_fkey(
          first_name,
          last_name,
          avatar_url
        ),
        participant2:users!conversations_participant2_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("id", conversationId)
      .single();

    if (conversationError) {
      throw conversationError;
    }

    // Verify user is a participant
    if (
      conversation.participant1_id !== user.id &&
      conversation.participant2_id !== user.id
    ) {
      throw new Error("Unauthorized access to conversation");
    }

    // Get messages for the conversation
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    // Process conversation with other participant details
    const otherParticipant =
      conversation.participant1_id === user.id
        ? conversation.participant2
        : conversation.participant1;

    const processedConversation: ConversationWithDetails = {
      ...conversation,
      other_participant: otherParticipant,
    };

    return {
      messages: messages || [],
      conversation: processedConversation,
      errorMessage: null,
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { messages: [], conversation: null, ...handleError(error) };
  }
};

// Send a new message
export const sendMessageAction = async (
  conversationId: string,
  content: string,
  attachmentUrl?: string
): Promise<{
  message: MessageWithDetails | null;
  errorMessage: string | null;
}> => {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Verify user is a participant in the conversation
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("participant1_id, participant2_id")
      .eq("id", conversationId)
      .single();

    if (conversationError) {
      throw conversationError;
    }

    if (
      conversation.participant1_id !== user.id &&
      conversation.participant2_id !== user.id
    ) {
      throw new Error("Unauthorized access to conversation");
    }

    // Insert the new message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        attachment_url: attachmentUrl,
        is_read: false,
      })
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .single();

    if (messageError) {
      throw messageError;
    }

    // Update conversation's last_message_at
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    return { message, errorMessage: null };
  } catch (error) {
    console.error("Error sending message:", error);
    return { message: null, ...handleError(error) };
  }
};

// Mark messages as read
export const markMessagesAsReadAction = async (
  conversationId: string
): Promise<{
  success: boolean;
  errorMessage: string | null;
}> => {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Mark all messages in the conversation as read (except those sent by the user)
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id);

    if (error) {
      throw error;
    }

    return { success: true, errorMessage: null };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { success: false, ...handleError(error) };
  }
};

// Enhanced conversation creation with initial message support
export const createConversationAction = async (
  otherParticipantId: string,
  jobId?: string,
  serviceId?: string,
  bookingId?: string,
  initialMessage?: string
): Promise<{
  conversation: ConversationWithDetails | null;
  errorMessage: string | null;
}> => {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Validate input parameters
    if (!otherParticipantId) {
      return {
        conversation: null,
        errorMessage: "Recipient is required",
      };
    }

    // Prevent self-messaging
    if (otherParticipantId === user.id) {
      return {
        conversation: null,
        errorMessage: "You cannot message yourself",
      };
    }

    // Validate initial message if provided
    if (initialMessage) {
      const trimmedMessage = initialMessage.trim();
      if (trimmedMessage.length < 10) {
        return {
          conversation: null,
          errorMessage: "Initial message must be at least 10 characters long",
        };
      }
      if (trimmedMessage.length > 500) {
        return {
          conversation: null,
          errorMessage: "Initial message must be less than 500 characters",
        };
      }
    }

    // Check if the other participant exists and is active
    const { data: otherUser, error: otherUserError } = await supabase
      .from("users")
      .select("id, first_name, last_name, avatar_url, is_active")
      .eq("id", otherParticipantId)
      .single();

    if (otherUserError || !otherUser) {
      return {
        conversation: null,
        errorMessage: "Recipient not found",
      };
    }

    if (!otherUser.is_active) {
      return {
        conversation: null,
        errorMessage: "Recipient is not available for messaging",
      };
    }

    // Check if conversation already exists (service-specific if serviceId provided)
    let existingConversationQuery = supabase
      .from("conversations")
      .select("*")
      .or(
        `and(participant1_id.eq.${user.id},participant2_id.eq.${otherParticipantId}),and(participant1_id.eq.${otherParticipantId},participant2_id.eq.${user.id})`
      );

    // If serviceId is provided, check for service-specific conversation
    if (serviceId) {
      existingConversationQuery = existingConversationQuery.eq(
        "service_id",
        serviceId
      );
    }

    const { data: existingConversation, error: checkError } =
      await existingConversationQuery.single();

    if (existingConversation && !checkError) {
      // If initial message is provided and conversation exists, send the message
      if (initialMessage && initialMessage.trim()) {
        const { error: messageError } = await supabase.from("messages").insert({
          conversation_id: existingConversation.id,
          sender_id: user.id,
          content: initialMessage.trim(),
          is_read: false,
          created_at: new Date().toISOString(),
        });

        if (messageError) {
          console.error("Error sending initial message:", messageError);
        }
      }

      // Return existing conversation with updated participant info
      return {
        conversation: {
          ...existingConversation,
          other_participant: otherUser,
        },
        errorMessage: null,
      };
    }

    // Create new conversation
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        participant1_id: user.id,
        participant2_id: otherParticipantId,
        job_id: jobId,
        service_id: serviceId,
        booking_id: bookingId,
        last_message_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        participant1:users!conversations_participant1_id_fkey(
          first_name,
          last_name,
          avatar_url
        ),
        participant2:users!conversations_participant2_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .single();

    if (conversationError) {
      console.error("Error creating conversation:", conversationError);
      return {
        conversation: null,
        errorMessage: `Failed to create conversation: ${conversationError.message}`,
      };
    }

    // Send initial message if provided
    if (initialMessage && initialMessage.trim()) {
      const { error: messageError } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content: initialMessage.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
      });

      if (messageError) {
        console.error("Error sending initial message:", messageError);
        // Don't fail the conversation creation if message sending fails
      }
    }

    const otherParticipant =
      conversation.participant1_id === user.id
        ? conversation.participant2
        : conversation.participant1;

    // Revalidate relevant paths
    revalidatePath("/customer/messages");
    revalidatePath("/tasker/messages");
    revalidatePath("/customer/dashboard");
    revalidatePath("/tasker/dashboard");

    return {
      conversation: {
        ...conversation,
        other_participant: otherParticipant,
      },
      errorMessage: null,
    };
  } catch (error) {
    console.error("Error creating conversation:", error);
    return {
      conversation: null,
      errorMessage:
        error instanceof Error
          ? error.message
          : "Failed to create conversation",
    };
  }
};

// Get unread message count for a user
export const getUnreadMessageCountAction = async (): Promise<{
  count: number;
  errorMessage: string | null;
}> => {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Get conversations where user is a participant
    const { data: conversations, error: conversationsError } = await supabase
      .from("conversations")
      .select("id")
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`);

    if (conversationsError) {
      throw conversationsError;
    }

    if (!conversations || conversations.length === 0) {
      return { count: 0, errorMessage: null };
    }

    const conversationIds = conversations.map((c) => c.id);

    // Count unread messages
    const { count, error: countError } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", conversationIds)
      .eq("is_read", false)
      .neq("sender_id", user.id);

    if (countError) {
      throw countError;
    }

    return { count: count || 0, errorMessage: null };
  } catch (error) {
    console.error("Error getting unread message count:", error);
    return { count: 0, ...handleError(error) };
  }
};
