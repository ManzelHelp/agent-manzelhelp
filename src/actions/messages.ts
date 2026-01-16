"use server";

import { createClient } from "@/supabase/server";
import { handleError } from "@/lib/utils";
import type { Conversation, Message } from "@/types/supabase";
import { revalidatePath } from "next/cache";
import { getNotificationTranslationsForUser } from "@/lib/notifications";
import { getErrorTranslationForUser } from "@/lib/errors";

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

// Get conversations for a user with details (paginated, 10 per page)
export const getConversationsAction = async (
  limit: number = 10,
  offset: number = 0
): Promise<{
  conversations: ConversationWithDetails[];
  errorMessage: string | null;
  hasMore?: boolean;
  total?: number;
}> => {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "messages",
        "notAuthenticated"
      );
      throw new Error(errorMessage);
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`);

    // Get conversations where user is a participant (paginated)
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
      .order("last_message_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (conversationsError) {
      throw conversationsError;
    }

    if (!conversations || conversations.length === 0) {
      return { 
        conversations: [], 
        errorMessage: null,
        hasMore: false,
        total: 0,
      };
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

        // Explicitly serialize conversation to avoid non-serializable objects
        return {
          id: String(conv.id),
          participant1_id: String(conv.participant1_id),
          participant2_id: String(conv.participant2_id),
          job_id: conv.job_id ? String(conv.job_id) : undefined,
          service_id: conv.service_id ? String(conv.service_id) : undefined,
          booking_id: conv.booking_id ? String(conv.booking_id) : undefined,
          last_message_at: conv.last_message_at ? new Date(conv.last_message_at).toISOString() : undefined,
          created_at: conv.created_at ? new Date(conv.created_at).toISOString() : new Date().toISOString(),
          other_participant: otherParticipant ? {
            first_name: otherParticipant.first_name ? String(otherParticipant.first_name) : undefined,
            last_name: otherParticipant.last_name ? String(otherParticipant.last_name) : undefined,
            avatar_url: otherParticipant.avatar_url ? String(otherParticipant.avatar_url) : undefined,
          } : undefined,
          last_message: lastMessage ? {
            id: String(lastMessage.id),
            conversation_id: String(lastMessage.conversation_id),
            sender_id: String(lastMessage.sender_id),
            content: String(lastMessage.content),
            attachment_url: lastMessage.attachment_url ? String(lastMessage.attachment_url) : undefined,
            is_read: Boolean(lastMessage.is_read),
            created_at: lastMessage.created_at ? new Date(lastMessage.created_at).toISOString() : new Date().toISOString(),
            sender: lastMessage.sender ? {
              first_name: lastMessage.sender.first_name ? String(lastMessage.sender.first_name) : undefined,
              last_name: lastMessage.sender.last_name ? String(lastMessage.sender.last_name) : undefined,
              avatar_url: lastMessage.sender.avatar_url ? String(lastMessage.sender.avatar_url) : undefined,
            } : undefined,
          } : undefined,
          unread_count: unreadCount,
        };
      }
    );

    const total = Number(totalCount) || 0;
    const hasMore = (offset + limit) < total;

    return { 
      conversations: processedConversations, 
      errorMessage: null,
      hasMore,
      total,
    };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { 
      conversations: [], 
      hasMore: false,
      total: 0,
      ...handleError(error) 
    };
  }
};

// Get messages for a specific conversation (paginated, 10 per page)
export const getMessagesAction = async (
  conversationId: string,
  limit: number = 10,
  offset: number = 0
): Promise<{
  messages: MessageWithDetails[];
  conversation: ConversationWithDetails | null;
  errorMessage: string | null;
  hasMore?: boolean;
  total?: number;
}> => {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "messages",
        "notAuthenticated"
      );
      throw new Error(errorMessage);
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
      console.error("Error fetching conversation in getMessagesAction:", {
        error: conversationError,
        code: conversationError.code,
        message: conversationError.message,
        details: conversationError.details,
        hint: conversationError.hint,
        conversationId,
        userId: user.id,
      });
      throw conversationError;
    }

    // Verify user is a participant
    if (
      conversation.participant1_id !== user.id &&
      conversation.participant2_id !== user.id
    ) {
      const errorMessage = await getErrorTranslationForUser(
        user.id,
        "messages",
        "unauthorized"
      );
      throw new Error(errorMessage);
    }

    // Get total count of messages
    const { count: totalCount } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversationId);

    // Get messages for the conversation (paginated, most recent first, then reverse for display)
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
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (messagesError) {
      console.error("Error fetching messages:", {
        error: messagesError,
        code: messagesError.code,
        message: messagesError.message,
        details: messagesError.details,
        hint: messagesError.hint,
        conversationId,
        userId: user.id,
      });
      throw messagesError;
    }

    // Process conversation with other participant details
    const otherParticipant =
      conversation.participant1_id === user.id
        ? conversation.participant2
        : conversation.participant1;

    // Explicitly serialize the conversation data to avoid non-serializable objects
    const processedConversation: ConversationWithDetails = {
      id: String(conversation.id),
      participant1_id: String(conversation.participant1_id),
      participant2_id: String(conversation.participant2_id),
      job_id: conversation.job_id ? String(conversation.job_id) : undefined,
      service_id: conversation.service_id ? String(conversation.service_id) : undefined,
      booking_id: conversation.booking_id ? String(conversation.booking_id) : undefined,
      last_message_at: conversation.last_message_at ? new Date(conversation.last_message_at).toISOString() : undefined,
      created_at: conversation.created_at ? new Date(conversation.created_at).toISOString() : new Date().toISOString(),
      other_participant: otherParticipant ? {
        first_name: otherParticipant.first_name ? String(otherParticipant.first_name) : undefined,
        last_name: otherParticipant.last_name ? String(otherParticipant.last_name) : undefined,
        avatar_url: otherParticipant.avatar_url ? String(otherParticipant.avatar_url) : undefined,
      } : undefined,
    };

    // Explicitly serialize messages to avoid non-serializable objects
    // Convert all types to ensure JSON serialization
    // Reverse order for display (oldest first)
    const serializedMessages: MessageWithDetails[] = (messages || [])
      .reverse()
      .map((msg: any) => ({
        id: String(msg.id),
        conversation_id: String(msg.conversation_id),
        sender_id: String(msg.sender_id),
        content: String(msg.content),
        attachment_url: msg.attachment_url ? String(msg.attachment_url) : undefined,
        is_read: Boolean(msg.is_read),
        created_at: msg.created_at ? new Date(msg.created_at).toISOString() : new Date().toISOString(),
        sender: msg.sender ? {
          first_name: msg.sender.first_name ? String(msg.sender.first_name) : undefined,
          last_name: msg.sender.last_name ? String(msg.sender.last_name) : undefined,
          avatar_url: msg.sender.avatar_url ? String(msg.sender.avatar_url) : undefined,
        } : undefined,
      }));

    const total = Number(totalCount) || 0;
    const hasMore = (offset + limit) < total;

    return {
      messages: serializedMessages,
      conversation: processedConversation,
      errorMessage: null,
      hasMore,
      total,
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { 
      messages: [], 
      conversation: null, 
      hasMore: false,
      total: 0,
      ...handleError(error) 
    };
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
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "messages",
        "notAuthenticated"
      );
      throw new Error(errorMessage);
    }

    // Verify user is a participant in the conversation
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("participant1_id, participant2_id, job_id, service_id, booking_id")
      .eq("id", conversationId)
      .single();

    if (conversationError) {
      console.error("Error fetching conversation:", {
        error: conversationError,
        code: conversationError.code,
        message: conversationError.message,
        details: conversationError.details,
        hint: conversationError.hint,
        conversationId,
        userId: user.id,
      });
      throw conversationError;
    }

    if (!conversation) {
      console.error("Conversation not found:", conversationId);
      throw new Error("Conversation not found");
    }

    if (
      conversation.participant1_id !== user.id &&
      conversation.participant2_id !== user.id
    ) {
      console.error("Unauthorized access to conversation:", {
        conversationId,
        userId: user.id,
        participant1: conversation.participant1_id,
        participant2: conversation.participant2_id,
      });
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
      console.error("Error inserting message:", {
        error: messageError,
        code: messageError.code,
        message: messageError.message,
        details: messageError.details,
        hint: messageError.hint,
        conversationId,
        senderId: user.id,
      });
      throw messageError;
    }

    if (!message) {
      console.error("Message insertion returned no data");
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "messages",
        "failedToSend"
      );
      throw new Error(errorMessage);
    }

    // Update conversation's last_message_at
    const { error: updateError } = await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    if (updateError) {
      console.error("Error updating conversation last_message_at:", updateError);
      // Don't throw, the message was inserted successfully
    }

    // Create notification for the receiver
    const receiverId =
      conversation.participant1_id === user.id
        ? conversation.participant2_id
        : conversation.participant1_id;

    if (receiverId) {
      const notificationTranslations = await getNotificationTranslationsForUser(
        receiverId,
        "message_received",
        { context: conversation.job_id ? " about a job" : "" }
      );
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: receiverId,
          type: "message_received",
          title: notificationTranslations.title,
          message: notificationTranslations.message,
          related_job_id: conversation.job_id || undefined,
          is_read: false,
        });

      if (notificationError) {
        console.error("Error creating notification (message_received):", {
          message: notificationError.message,
          code: notificationError.code,
          details: notificationError.details,
          hint: notificationError.hint,
          receiverId,
          conversationId,
        });
        // Don't fail the operation for this
      } else {
        console.log("Notification created successfully (message_received):", {
          receiverId,
          conversationId,
        });
      }
    }

    // Explicitly serialize the message to avoid non-serializable objects
    // Convert id to string if it's a number (PostgreSQL integer)
    const serializedMessage: MessageWithDetails = {
      id: String(message.id),
      conversation_id: String(message.conversation_id),
      sender_id: String(message.sender_id),
      content: String(message.content),
      attachment_url: message.attachment_url ? String(message.attachment_url) : undefined,
      is_read: Boolean(message.is_read),
      created_at: message.created_at ? new Date(message.created_at).toISOString() : new Date().toISOString(),
      sender: message.sender ? {
        first_name: message.sender.first_name ? String(message.sender.first_name) : undefined,
        last_name: message.sender.last_name ? String(message.sender.last_name) : undefined,
        avatar_url: message.sender.avatar_url ? String(message.sender.avatar_url) : undefined,
      } : undefined,
    };

    return { message: serializedMessage, errorMessage: null };
  } catch (error: any) {
    console.error("Error sending message:", {
      error,
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
    });
    return { message: null, ...handleError(error) };
  }
};

// Mark messages as read
export const markMessagesAsReadAction = async (
  conversationId: string
): Promise<{
  success: boolean;
  errorMessage: string | null;
  updatedCount: number;
}> => {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "messages",
        "notAuthenticated"
      );
      throw new Error(errorMessage);
    }

    // Mark all messages in the conversation as read (except those sent by the user)
    // Only mark messages that are currently unread
    const { data: updatedMessages, error, count } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("is_read", false)
      .select("id, sender_id, is_read");

    if (error) {
      console.error("Error marking messages as read:", {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        conversationId,
        userId: user.id,
      });
      throw error;
    }

    if (error) {
      const supabaseError = error as any;
      console.error("Error marking messages as read:", {
        error,
        code: supabaseError.code,
        message: supabaseError.message,
        details: supabaseError.details,
        hint: supabaseError.hint,
        conversationId,
        userId: user.id,
      });
      throw error;
    }

    console.log("Messages marked as read:", {
      conversationId,
      userId: user.id,
      updatedCount: updatedMessages?.length || 0,
      updatedMessageIds: updatedMessages?.map(m => m.id) || [],
    });

    // Check if any messages were actually updated
    if (updatedMessages && updatedMessages.length === 0) {
      console.warn("No messages were updated. This might be due to RLS policies or all messages are already read.");
    }

    // Revalidate conversation list pages to update unread counts
    revalidatePath("/tasker/messages");
    revalidatePath("/customer/messages");

    return { 
      success: true, 
      errorMessage: null, 
      updatedCount: updatedMessages?.length || 0 
    };
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
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "messages",
        "notAuthenticated"
      );
      throw new Error(errorMessage);
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

    // Check if the current user exists in the users table (by ID first, then by email)
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    // If not found by ID, check by email (in case of ID mismatch)
    let currentUserByEmail = null;
    if ((currentUserError || !currentUser) && user.email) {
      const { data: emailUser } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", user.email)
        .maybeSingle();
      currentUserByEmail = emailUser;
      
      if (emailUser && emailUser.id !== user.id) {
        console.warn("ID mismatch detected in createConversation:", {
          authId: user.id,
          dbId: emailUser.id,
          email: user.email,
        });
      }
    }

    if (currentUserError || (!currentUser && !currentUserByEmail)) {
      // User doesn't exist in users table, create it
      console.log("User not found in users table, creating...", {
        userId: user.id,
        email: user.email,
        role: user.user_metadata?.role,
      });
      
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            id: user.id,
            email: user.email || "",
            role: (user.user_metadata?.role as "customer" | "tasker") || "customer",
            email_verified: user.email_confirmed_at ? true : false,
            is_active: true,
            preferred_language: "en",
            verification_status: "pending",
            wallet_balance: 0,
          },
        ])
        .select("id")
        .single();

      if (createError) {
        console.error("Failed to create user in users table:", {
          error: createError,
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint,
        });
        
        // If it's a duplicate key error (email or ID), try to fetch by email
        if (createError.code === "23505" && user.email) {
          console.log("User already exists (duplicate), fetching by email...");
          const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", user.email)
            .maybeSingle();
          
          if (existingUser) {
            console.log("Found existing user by email, continuing...");
            // User exists with different ID, continue with existing user
          } else {
            return {
              conversation: null,
              errorMessage: `Your account is not properly set up: ${createError.message}. Please contact support.`,
            };
          }
        } else {
          return {
            conversation: null,
            errorMessage: `Your account is not properly set up: ${createError.message}. Please contact support.`,
          };
        }
      } else if (!newUser) {
        console.error("User creation returned no data");
        return {
          conversation: null,
          errorMessage: "Your account is not properly set up. Please contact support.",
        };
      } else {
        console.log("User created successfully in users table");
      }
    } else if (currentUserByEmail && currentUserByEmail.id !== user.id) {
      // User exists but with different ID - log warning but continue
      console.warn("User exists with different ID, using existing user:", {
        authId: user.id,
        dbId: currentUserByEmail.id,
        email: user.email,
      });
    }

    // Check if the other participant exists and is active
    const { data: otherUser, error: otherUserError } = await supabase
      .from("users")
      .select("id, first_name, last_name, avatar_url, is_active")
      .eq("id", otherParticipantId)
      .maybeSingle();

    if (otherUserError) {
      console.error("Error checking other participant:", {
        error: otherUserError,
        otherParticipantId,
      });
      return {
        conversation: null,
        errorMessage: `Error checking recipient: ${otherUserError.message}`,
      };
    }

    if (!otherUser) {
      console.error("Other participant not found in users table:", {
        otherParticipantId,
      });
      return {
        conversation: null,
        errorMessage: "Recipient not found. The recipient's account may not be properly set up.",
      };
    }

    if (!otherUser.is_active) {
      return {
        conversation: null,
        errorMessage: "Recipient is not available for messaging",
      };
    }

    // Check if conversation already exists
    // We use maybeSingle() to avoid errors when no conversation is found
    // The idx_conversations_unique_pair constraint usually prevents multiple rows for the same pair
    let existingConversationQuery = supabase
      .from("conversations")
      .select("*")
      .or(
        `and(participant1_id.eq.${user.id},participant2_id.eq.${otherParticipantId}),and(participant1_id.eq.${otherParticipantId},participant2_id.eq.${user.id})`
      );

    // Try to find a specific match first if serviceId or bookingId is provided
    let existingConversation = null;
    
    if (serviceId || bookingId) {
      let specificQuery = supabase
        .from("conversations")
        .select("*")
        .or(
          `and(participant1_id.eq.${user.id},participant2_id.eq.${otherParticipantId}),and(participant1_id.eq.${otherParticipantId},participant2_id.eq.${user.id})`
        );

      if (serviceId) {
        specificQuery = specificQuery.eq("service_id", serviceId);
      }
      if (bookingId) {
        specificQuery = specificQuery.eq("booking_id", bookingId);
      }

      const { data: specificMatch } = await specificQuery.maybeSingle();
      if (specificMatch) {
        existingConversation = specificMatch;
      }
    }

    // If no specific match, try finding ANY conversation between these two participants
    if (!existingConversation) {
      const { data: generalMatch } = await existingConversationQuery.maybeSingle();
      if (generalMatch) {
        existingConversation = generalMatch;
        
        // Update the conversation to link it to the current booking/service if it's not linked yet
        // This provides context for the chat without creating a duplicate row
        if (bookingId && !existingConversation.booking_id) {
          await supabase
            .from("conversations")
            .update({ booking_id: bookingId, last_message_at: new Date().toISOString() })
            .eq("id", existingConversation.id);
          existingConversation.booking_id = bookingId;
        } else if (serviceId && !existingConversation.service_id) {
          await supabase
            .from("conversations")
            .update({ service_id: serviceId, last_message_at: new Date().toISOString() })
            .eq("id", existingConversation.id);
          existingConversation.service_id = serviceId;
        }
      }
    }

    if (existingConversation) {
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
        
        // Update last_message_at
        await supabase
          .from("conversations")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", existingConversation.id);
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

    // Final verification: ensure both participants exist in users table before creating conversation
    const { data: currentUserFinal, error: currentUserFinalError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", user.id)
      .maybeSingle();

    if (currentUserFinalError) {
      console.error("Error checking current user before conversation creation:", {
        userId: user.id,
        error: currentUserFinalError,
      });
      return {
        conversation: null,
        errorMessage: `Error verifying your account: ${currentUserFinalError.message}. Please contact support.`,
      };
    }

    if (!currentUserFinal) {
      console.error("Current user does not exist in users table before conversation creation:", {
        userId: user.id,
        email: user.email,
        authUserExists: !!user,
      });
      return {
        conversation: null,
        errorMessage: "Your account is not properly set up. Please contact support.",
      };
    }

    console.log("Creating conversation with:", {
      participant1_id: user.id,
      participant2_id: otherParticipantId,
      currentUserExists: !!currentUserFinal,
      otherUserExists: !!otherUser,
    });

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
      console.error("Error creating conversation:", {
        error: conversationError,
        code: conversationError.code,
        message: conversationError.message,
        details: conversationError.details,
        hint: conversationError.hint,
        participant1_id: user.id,
        participant2_id: otherParticipantId,
        currentUserExists: !!currentUserFinal,
        otherUserExists: !!otherUser,
      });
      
      // Check if it's a unique constraint violation (conversation already exists)
      if (conversationError.code === "23505") {
        const { data: existingOne } = await supabase
          .from("conversations")
          .select(`
            *,
            participant1:users!conversations_participant1_id_fkey(first_name, last_name, avatar_url),
            participant2:users!conversations_participant2_id_fkey(first_name, last_name, avatar_url)
          `)
          .or(
            `and(participant1_id.eq.${user.id},participant2_id.eq.${otherParticipantId}),and(participant1_id.eq.${otherParticipantId},participant2_id.eq.${user.id})`
          )
          .maybeSingle();

        if (existingOne) {
          const otherParticipant = existingOne.participant1_id === user.id ? existingOne.participant2 : existingOne.participant1;
          return {
            conversation: { ...existingOne, other_participant: otherParticipant },
            errorMessage: null
          };
        }
      }

      // Check if it's a foreign key constraint error
      if (conversationError.code === "23503") {
        if (conversationError.message.includes("participant1_id")) {
          return {
            conversation: null,
            errorMessage: "Your account is not properly set up. Please contact support.",
          };
        } else if (conversationError.message.includes("participant2_id")) {
          return {
            conversation: null,
            errorMessage: "The recipient's account is not properly set up.",
          };
        }
      }
      
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "messages",
        "failedToCreateConversation"
      );
      return {
        conversation: null,
        errorMessage: `${errorMessage}: ${conversationError.message}`,
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
    const defaultErrorMessage = await getErrorTranslationForUser(
      undefined,
      "messages",
      "failedToCreateConversation"
    );
    return {
      conversation: null,
      errorMessage:
        error instanceof Error
          ? error.message
          : defaultErrorMessage,
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
      const errorMessage = await getErrorTranslationForUser(
        undefined,
        "messages",
        "notAuthenticated"
      );
      throw new Error(errorMessage);
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
