"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Send,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Paperclip,
  Image as ImageIcon,
  Smile,
  MoreVertical,
  Check,
  CheckCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import {
  getMessagesAction,
  sendMessageAction,
  markMessagesAsReadAction,
  type MessageWithDetails,
  type ConversationWithDetails,
} from "@/actions/messages";

interface CustomerInfo {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
  location?: string;
  service?: string;
  booking_date?: string;
  price?: number;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUserStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithDetails[]>([]);
  const [conversation, setConversation] =
    useState<ConversationWithDetails | null>(null);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  const conversationId = params["chat-id"] as string;

  // Optimized data fetching function
  const fetchData = useCallback(
    async (showLoading = true) => {
      if (!user || !conversationId) {
        setIsLoading(false);
        return;
      }

      try {
        if (showLoading) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }
        setError(null);

        const {
          messages: fetchedMessages,
          conversation: fetchedConversation,
          errorMessage,
        } = await getMessagesAction(conversationId);

        if (errorMessage) {
          setError(errorMessage);
        } else {
          setMessages(fetchedMessages);
          setConversation(fetchedConversation);

          // Update last message ID for tracking
          if (fetchedMessages.length > 0) {
            const lastMsg = fetchedMessages[fetchedMessages.length - 1];
            setLastMessageId(lastMsg.id);
          }

          // Mark messages as read
          await markMessagesAsReadAction(conversationId);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load conversation");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user, conversationId]
  );

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh messages every 30 seconds
  useEffect(() => {
    if (!conversationId) return;

    const interval = setInterval(async () => {
      try {
        const { messages: fetchedMessages, errorMessage } =
          await getMessagesAction(conversationId);

        if (!errorMessage && fetchedMessages.length > 0) {
          const latestMessage = fetchedMessages[fetchedMessages.length - 1];

          // Only update if there are new messages
          if (latestMessage.id !== lastMessageId) {
            setMessages(fetchedMessages);
            setLastMessageId(latestMessage.id);

            // Mark new messages as read
            await markMessagesAsReadAction(conversationId);
          }
        }
      } catch (err) {
        console.error("Error refreshing messages:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [conversationId, lastMessageId]);

  // Memoized utility functions
  const isCustomer = useCallback(
    (senderId: string) => senderId !== user?.id,
    [user?.id]
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  const formatDate = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !conversationId || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX

    try {
      setIsSending(true);
      setError(null);

      const { message: newMsg, errorMessage } = await sendMessageAction(
        conversationId,
        messageContent
      );

      if (errorMessage) {
        setError(errorMessage);
        setNewMessage(messageContent); // Restore message on error
      } else if (newMsg) {
        setMessages((prev) => [...prev, newMsg]);
        setLastMessageId(newMsg.id);
        scrollToBottom();
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setIsSending(false);
    }
  }, [newMessage, conversationId, isSending, scrollToBottom]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleRefresh = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  // Memoized grouped messages calculation
  const groupedMessages = useMemo(() => {
    return messages.reduce((groups, message) => {
      const date = formatDate(message.created_at || "");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {} as Record<string, MessageWithDetails[]>);
  }, [messages, formatDate]);

  // Memoized customer info
  const customerInfo: CustomerInfo = useMemo(() => {
    return conversation
      ? {
          id:
            conversation.participant1_id === user?.id
              ? conversation.participant2_id
              : conversation.participant1_id,
          name: conversation.other_participant
            ? `${conversation.other_participant.first_name || ""} ${
                conversation.other_participant.last_name || ""
              }`.trim() || "Unknown"
            : "Unknown",
          avatar: conversation.other_participant?.avatar_url,
          service:
            conversation.service_title ||
            conversation.job_title ||
            conversation.booking_title,
        }
      : {
          id: "",
          name: "Unknown",
        };
  }, [conversation, user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)] mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--color-bg)] flex flex-col">
      <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2 hover:bg-[var(--color-accent-light)] touch-target"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-[var(--color-text-primary)]" />
            </Button>

            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center border-2 border-[var(--color-primary)]/20">
                {customerInfo.avatar ? (
                  <Image
                    src={customerInfo.avatar}
                    alt={customerInfo.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-[var(--color-primary)]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-[var(--color-text-primary)] truncate">
                    {customerInfo.name}
                  </h2>
                  {isRefreshing && (
                    <RefreshCw className="h-3 w-3 text-[var(--color-primary)] animate-spin" />
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] truncate">
                  {customerInfo.service}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-[var(--color-accent-light)] touch-target"
                aria-label="Refresh messages"
              >
                <RefreshCw
                  className={`h-4 w-4 text-[var(--color-text-primary)] ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-[var(--color-accent-light)] touch-target"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5 text-[var(--color-text-primary)]" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sticky Customer Info Card */}
        <div className="sticky top-[73px] z-10 px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <Card className="border-[var(--color-border)] bg-[var(--color-accent-light)]/30">
            <CardContent className="p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    {customerInfo.booking_date
                      ? new Date(customerInfo.booking_date).toLocaleDateString()
                      : "Not scheduled"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    ${customerInfo.price}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-[var(--color-text-secondary)] truncate">
                    {customerInfo.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-[var(--color-text-secondary)] truncate">
                    {customerInfo.phone}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scrollable Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setError(null)}
                  className="ml-auto text-red-700 border-red-300 hover:bg-red-50"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {Object.keys(groupedMessages).length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="bg-[var(--color-primary)]/10 rounded-full p-4 mb-4">
                <MessageCircle className="h-8 w-8 text-[var(--color-primary)]" />
              </div>
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
                No messages yet
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
                Start the conversation by sending your first message to{" "}
                {customerInfo.name}.
              </p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="flex justify-center mb-4">
                  <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] px-3 py-1 rounded-full border border-[var(--color-border)]">
                    {date}
                  </span>
                </div>

                <div className="space-y-3">
                  {dateMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        isCustomer(message.sender_id)
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] md:max-w-[60%] ${
                          isCustomer(message.sender_id)
                            ? "bg-[var(--color-surface)] border border-[var(--color-border)]"
                            : "bg-[var(--color-primary)] text-white"
                        } rounded-2xl px-4 py-2 shadow-sm transition-all duration-200 hover:shadow-md`}
                      >
                        <p className="text-sm leading-relaxed break-words">
                          {message.content}
                        </p>

                        <div
                          className={`flex items-center justify-end gap-1 mt-2 text-xs ${
                            isCustomer(message.sender_id)
                              ? "text-[var(--color-text-secondary)]"
                              : "text-white/70"
                          }`}
                        >
                          <span>{formatTime(message.created_at || "")}</span>
                          {!isCustomer(message.sender_id) && (
                            <span
                              className="flex items-center"
                              title={message.is_read ? "Read" : "Sent"}
                            >
                              {message.is_read ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sticky Message Input */}
        <div className="sticky bottom-0 z-10 bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full pr-12 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] resize-none rounded-md px-3 py-2 text-sm min-h-[40px] max-h-[120px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                rows={1}
                aria-label="Message input"
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 hover:bg-[var(--color-accent-light)] touch-target"
                  aria-label="Attach file"
                >
                  <Paperclip className="h-4 w-4 text-[var(--color-text-secondary)]" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 hover:bg-[var(--color-accent-light)] touch-target"
                  aria-label="Attach image"
                >
                  <ImageIcon className="h-4 w-4 text-[var(--color-text-secondary)]" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 hover:bg-[var(--color-accent-light)] touch-target"
                  aria-label="Add emoji"
                >
                  <Smile className="h-4 w-4 text-[var(--color-text-secondary)]" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed touch-target"
              aria-label={isSending ? "Sending message..." : "Send message"}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-[var(--color-text-secondary)]">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>
              {newMessage.length > 0 && `${newMessage.length} characters`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
