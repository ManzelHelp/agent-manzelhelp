"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/ui/BackButton";
import {
  Send,
  ArrowDown,
  User,
  Phone,
  Info,
  Paperclip,
  Smile,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageCircle,
  RefreshCw,
} from "lucide-react";

import {
  getMessagesAction,
  sendMessageAction,
  markMessagesAsReadAction,
  type MessageWithDetails,
  type ConversationWithDetails,
} from "@/actions/messages";
import { useUserStore } from "@/stores/userStore";
import { usePathname } from "next/navigation";
import { formatDateShort } from "@/lib/date-utils";
import { useMessagesRealtime } from "@/hooks/useMessagesRealtime";

export default function ChatPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations("chat");
  const chatId = params["chat-id"] as string;
  const { user } = useUserStore();

  const [messages, setMessages] = useState<MessageWithDetails[]>([]);
  const [conversation, setConversation] =
    useState<ConversationWithDetails | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch messages and conversation details with pagination (10 per page)
  const fetchMessages = useCallback(
    async (isRefresh = false, append = false) => {
      if (!chatId) return;

      try {
        if (append) {
          setIsLoadingMore(true);
        } else if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const offset = append ? currentOffset : 0;
        const {
          messages: fetchedMessages,
          conversation: fetchedConversation,
          errorMessage,
          hasMore: moreAvailable,
          total,
        } = await getMessagesAction(chatId, 10, offset);

        if (errorMessage) {
          setError(errorMessage);
        } else {
          if (append) {
            // Prepend older messages (they come in reverse order)
            setMessages((prev) => [...fetchedMessages, ...prev]);
            setCurrentOffset((prev) => prev + fetchedMessages.length);
          } else {
            setMessages(fetchedMessages);
            setCurrentOffset(fetchedMessages.length);
          }
          setConversation(fetchedConversation);
          setHasMore(moreAvailable || false);

          // Mark messages as read (only messages from other participants)
          if (fetchedMessages.length > 0 && user?.id) {
            console.log("Marking messages as read for conversation:", chatId, "User:", user.id);
            const { success, errorMessage } = await markMessagesAsReadAction(chatId);
            console.log("Mark as read result:", { success, errorMessage });
            if (success) {
              // Small delay to ensure database update is complete
              await new Promise(resolve => setTimeout(resolve, 200));
              // Refetch messages to get updated read status from database
              const { messages: refreshedMessages } = await getMessagesAction(chatId, 10, 0);
              if (refreshedMessages) {
                setMessages(refreshedMessages);
                setCurrentOffset(refreshedMessages.length);
              } else {
                // Fallback: Update local state if refetch fails
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.sender_id !== user.id ? { ...msg, is_read: true } : msg
                  )
                );
              }
              // Dispatch event to refresh conversations list immediately
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('messagesMarkedAsRead', { 
                  detail: { conversationId: chatId } 
                }));
              }
              // Force refresh of the router to update the conversation list
              router.refresh();
            } else {
              console.error("Failed to mark messages as read:", errorMessage);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else if (isRefresh) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [chatId, currentOffset, user?.id]
  );

  // Load older messages (scroll up)
  const loadOlderMessages = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading && chatId) {
      fetchMessages(false, true);
    }
  }, [isLoadingMore, hasMore, isLoading, chatId, fetchMessages]);

  // Use realtime hook for messages
  useMessagesRealtime({
    conversationId: chatId,
    enabled: !!chatId,
    onNewMessage: (message) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
      scrollToBottom();
    },
    onMessageUpdate: (message) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? message : m))
      );
    },
  });

  // Send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || !chatId) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      const { message, errorMessage } = await sendMessageAction(
        chatId,
        messageContent
      );

      if (errorMessage) {
        setError(errorMessage);
        setNewMessage(messageContent); // Restore message on error
      } else if (message) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Check if message is from current user
  const isOwnMessage = (message: MessageWithDetails) => {
    if (!user?.id) return false;
    return message.sender_id === user.id;
  };

  // Format time for messages
  // HYDRATION-SAFE: Use explicit locale to prevent hydration mismatches
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    // Use stable "now" from component mount to prevent hydration issues
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return t("time.justNow");
    if (diffInMinutes < 60)
      return t("time.minutesAgo", { minutes: diffInMinutes });

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t("time.hoursAgo", { hours: diffInHours });

    // Use explicit locale to ensure consistent formatting between server and client
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format date for message groups
  // HYDRATION-SAFE: Use explicit locale and stable date comparisons
  const formatMessageDate = (timestamp: string | undefined) => {
    if (!timestamp) return t("time.today");

    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t("time.today");
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t("time.yesterday");
    } else {
      // Use short date format DD.MM.YYYY
      return formatDateShort(date);
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: MessageWithDetails[]) => {
    const groups: { [key: string]: MessageWithDetails[] } = {};

    messages.forEach((message) => {
      if (message.created_at) {
        const date = new Date(message.created_at).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
      }
    });

    return groups;
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input on mount
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
          <h3 className="font-semibold mb-2 text-[var(--color-text-primary)] mobile-text-lg">
            {t("loading.title")}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mobile-leading">
            {t("loading.description")}
          </p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="font-semibold mb-2 text-[var(--color-text-primary)] mobile-text-lg">
            {t("errors.loadFailed")}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mobile-leading mb-6">
            {error || t("errors.conversationNotFound")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <BackButton variant="outline" />
            <Button
              onClick={() => fetchMessages(true)}
              className="touch-target"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {t("actions.tryAgain")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.other_participant;
  const participantName = otherParticipant
    ? `${otherParticipant.first_name || ""} ${
        otherParticipant.last_name || ""
      }`.trim() || t("common.unknown")
    : t("common.unknown");

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <BackButton />

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center border-2 border-[var(--color-primary)]/20">
                {otherParticipant?.avatar_url ? (
                  <Image
                    src={otherParticipant.avatar_url}
                    alt={participantName}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <User className="h-5 w-5 text-[var(--color-primary)]" />
                )}
              </div>

              <div>
                <h1 className="font-semibold text-[var(--color-text-primary)] mobile-text-base">
                  {participantName}
                </h1>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {conversation.service_title ||
                    conversation.job_title ||
                    conversation.booking_title}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchMessages(true)}
              disabled={isRefreshing}
              className="touch-target p-2"
              title={
                isRefreshing ? t("actions.refreshing") : t("actions.refresh")
              }
            >
              <RefreshCw
                className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="touch-target p-2"
              title={t("actions.info")}
            >
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto smooth-scroll">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Load Older Messages Button */}
          {hasMore && (
            <div className="flex justify-center py-4">
              <Button
                onClick={loadOlderMessages}
                disabled={isLoadingMore}
                variant="outline"
                size="sm"
                className="mobile-button"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t("actions.loading")}
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4 mr-2 rotate-180" />
                    {t("actions.loadOlder")}
                  </>
                )}
              </Button>
            </div>
          )}
          
          {Object.keys(messageGroups).length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-[var(--color-text-secondary)] mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-[var(--color-text-primary)] mobile-text-lg">
                {t("empty.title")}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mobile-leading">
                {t("empty.description")}
              </p>
            </div>
          ) : (
            Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date} className="space-y-4">
                {/* Date separator */}
                <div className="flex items-center justify-center">
                  <div className="bg-[var(--color-surface)] px-4 py-2 rounded-full border border-[var(--color-border)]">
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                      {formatMessageDate(dateMessages[0].created_at)}
                    </span>
                  </div>
                </div>

                {/* Messages for this date */}
                <div className="space-y-1">
                  {dateMessages.map((message, index) => {
                    const isOwn = isOwnMessage(message);
                    const showAvatar =
                      index === 0 ||
                      dateMessages[index - 1].sender_id !== message.sender_id;

                    return (
                      <div
                        key={`${date}-${message.id}-${index}`}
                        className={`flex gap-3 mb-4 ${
                          isOwn ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isOwn && (
                          <div className="flex-shrink-0">
                            {showAvatar ? (
                              <div className="h-8 w-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center border border-[var(--color-primary)]/20">
                                {message.sender?.avatar_url ? (
                                  <Image
                                    src={message.sender.avatar_url}
                                    alt={message.sender.first_name || "User"}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 rounded-full object-cover"
                                    unoptimized
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <User className="h-4 w-4 text-[var(--color-primary)]" />
                                )}
                              </div>
                            ) : (
                              <div className="w-8" />
                            )}
                          </div>
                        )}

                        <div
                          className={`flex flex-col max-w-[70%] ${
                            isOwn ? "items-end" : "items-start"
                          }`}
                        >
                          {!isOwn && showAvatar && (
                            <span className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                              {message.sender?.first_name ||
                                t("common.unknown")}
                            </span>
                          )}

                          <div
                            className={`px-4 py-3 rounded-2xl mobile-leading shadow-sm ${
                              isOwn
                                ? "bg-[var(--color-primary)] text-white rounded-br-sm"
                                : "bg-gray-100 dark:bg-gray-800 text-[var(--color-text-primary)] border border-gray-200 dark:border-gray-700 rounded-bl-sm"
                            }`}
                          >
                            <p className={`text-sm mobile-leading ${
                              isOwn ? "text-white" : "text-[var(--color-text-primary)]"
                            }`}>
                              {message.content}
                            </p>
                          </div>

                          <div
                            className={`flex items-center gap-1.5 mt-1.5 ${
                              isOwn ? "flex-row-reverse" : ""
                            }`}
                          >
                            <span className={`text-xs ${
                              isOwn 
                                ? "text-white/70" 
                                : "text-[var(--color-text-secondary)]"
                            }`}>
                              {formatMessageTime(message.created_at || "")}
                            </span>
                            {isOwn && (
                              <div className="flex items-center">
                                {message.is_read ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-white/80" />
                                ) : (
                                  <Clock className="h-3.5 w-3.5 text-white/60" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {isOwn && (
                          <div className="flex-shrink-0">
                            <div className="w-8" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="touch-target p-2 flex-shrink-0"
              title={t("actions.attach")}
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t("input.placeholder")}
                disabled={isSending}
                className="pr-12 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] mobile-focus touch-target rounded-2xl"
                maxLength={500}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 touch-target p-1"
                title={t("actions.emoji")}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              className="touch-target bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-2xl px-4"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {newMessage.length > 0 && (
            <div className="flex justify-between items-center mt-2 text-xs text-[var(--color-text-secondary)]">
              <span>
                {t("input.charactersCount", {
                  count: newMessage.length,
                  max: 500,
                })}
              </span>
              <span>{t("input.pressEnter")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
