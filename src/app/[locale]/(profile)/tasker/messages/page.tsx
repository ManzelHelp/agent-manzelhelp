"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  User,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  getConversationsAction,
  type ConversationWithDetails,
} from "@/actions/messages";
import { useUserStore } from "@/stores/userStore";
import { useConversationsRealtime } from "@/hooks/useConversationsRealtime";
import { formatDateShort } from "@/lib/date-utils";

type MessageStatus = "all" | "unread" | "read";

export default function MessagesPage() {
  const router = useRouter();
  const t = useTranslations("notifications.actions");
  const { user } = useUserStore();
  const [messageFilter, setMessageFilter] = useState<MessageStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationWithDetails[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations from database with pagination (10 per page)
  const fetchConversations = useCallback(async (isRefresh = false, append = false) => {
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
      const { conversations: fetchedConversations, errorMessage, hasMore: moreAvailable, total } =
        await getConversationsAction(10, offset);

      if (errorMessage) {
        setError(errorMessage);
      } else {
        if (append) {
          setConversations((prev) => [...prev, ...fetchedConversations]);
          setCurrentOffset((prev) => prev + fetchedConversations.length);
        } else {
          setConversations(fetchedConversations);
          setCurrentOffset(fetchedConversations.length);
        }
        setHasMore(moreAvailable || false);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
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
  }, [currentOffset]);

  // Load more conversations
  const loadMoreConversations = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      fetchConversations(false, true);
    }
  }, [isLoadingMore, hasMore, isLoading, fetchConversations]);

  // Use realtime hook for conversations
  useConversationsRealtime({
    userId: user?.id || null,
    enabled: !!user?.id,
    onNewConversation: () => {
      fetchConversations(true, false);
    },
    onConversationUpdate: () => {
      fetchConversations(true, false);
    },
    onNewMessage: () => {
      fetchConversations(true, false);
    },
  });

  useEffect(() => {
    fetchConversations();
    
    // Listen for messages marked as read event
    const handleMessagesMarkedAsRead = () => {
      fetchConversations(true, false);
    };
    
    window.addEventListener('messagesMarkedAsRead', handleMessagesMarkedAsRead);
    
    return () => {
      window.removeEventListener('messagesMarkedAsRead', handleMessagesMarkedAsRead);
    };
  }, [fetchConversations]);

  // Helper function to format time
  const formatTime = (timestamp: string | undefined) => {
    if (!timestamp) return "Unknown";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;

    // Use short date format DD.MM.YYYY
    return formatDateShort(timestamp);
  };

  // Filter conversations based on status and search query
  const allFilteredConversations = useMemo(() => {
    return conversations
      .filter((conversation) => {
        const hasUnread = (conversation.unread_count || 0) > 0;
        if (messageFilter === "unread") return hasUnread;
        if (messageFilter === "read") return !hasUnread;
        return true;
      })
      .filter((conversation) => {
        if (searchQuery === "") return true;

        const otherParticipant = conversation.other_participant;
        const participantName = otherParticipant
          ? `${otherParticipant.first_name || ""} ${
              otherParticipant.last_name || ""
            }`.trim()
          : "";

        const lastMessage = conversation.last_message?.content || "";
        const serviceTitle =
          conversation.service_title ||
          conversation.job_title ||
          conversation.booking_title ||
          "";

        return (
          participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
          serviceTitle.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
  }, [conversations, messageFilter, searchQuery]);

  const unreadCount = useMemo(() => {
    return conversations.reduce(
      (total, conv) => total + (conv.unread_count || 0),
      0
    );
  }, [conversations]);

  const FilterButton = ({
    status,
    count,
  }: {
    status: MessageStatus;
    count?: number;
  }) => (
    <button
      onClick={() => setMessageFilter(status)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 touch-target mobile-focus ${
        messageFilter === status
          ? "bg-[var(--color-primary)] text-white shadow-md"
          : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-light)] border border-[var(--color-border)]"
      }`}
    >
      {status === "unread" ? (
        <Mail className="h-4 w-4" />
      ) : status === "read" ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <span className="capitalize font-medium mobile-text-sm">{status}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`text-xs rounded-full px-2 py-0.5 font-semibold ${
            messageFilter === status
              ? "bg-white/20 text-white"
              : "bg-[var(--color-primary)] text-white"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="mobile-spacing">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mobile-leading">
            Messages
          </h1>
          <p className="text-[var(--color-text-secondary)] mobile-leading mt-2">
            Manage your communications with clients
          </p>
        </div>

        <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <CardHeader className="mobile-spacing">
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle className="text-[var(--color-text-primary)] mobile-text-lg">
                  Inbox
                </CardTitle>
                <CardDescription className="text-[var(--color-text-secondary)] mobile-text-sm">
                  {unreadCount} unread message{unreadCount !== 1 && "s"}
                </CardDescription>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] mobile-focus touch-target"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchConversations(true)}
                  disabled={isRefreshing}
                  className="touch-target border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-light)] hover:text-[var(--color-text-primary)] mobile-focus"
                  title={isRefreshing ? t("refreshing") : t("refresh")}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  <span className="sr-only">
                    {isRefreshing ? t("refreshing") : t("refresh")}
                  </span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mobile-spacing space-y-6">
            {/* Message Filters */}
            <div className="flex flex-wrap gap-2">
              <FilterButton status="all" />
              <FilterButton status="unread" count={unreadCount} />
              <FilterButton status="read" />
            </div>

            {/* Messages List */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <Loader2 className="h-12 w-12 text-[var(--color-primary)] animate-spin" />
                  </div>
                  <h3 className="font-semibold mb-2 text-[var(--color-text-primary)] mobile-text-lg">
                    Loading messages...
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mobile-leading">
                    Please wait while we fetch your conversations
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                  </div>
                  <h3 className="font-semibold mb-2 text-[var(--color-text-primary)] mobile-text-lg">
                    Error loading messages
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mobile-leading mb-4">
                    {error}
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="touch-target"
                  >
                    Try Again
                  </Button>
                </div>
              ) : allFilteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <MessageCircle className="h-12 w-12 text-[var(--color-text-secondary)]" />
                  </div>
                  <h3 className="font-semibold mb-2 text-[var(--color-text-primary)] mobile-text-lg">
                    No messages found
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mobile-leading">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : messageFilter === "unread"
                      ? "You have no unread messages"
                      : messageFilter === "read"
                      ? "You have no read messages"
                      : "Your inbox is empty"}
                  </p>
                </div>
              ) : (
                allFilteredConversations.map((conversation) => {
                  const otherParticipant = conversation.other_participant;
                  const participantName = otherParticipant
                    ? `${otherParticipant.first_name || ""} ${
                        otherParticipant.last_name || ""
                      }`.trim() || "Unknown"
                    : "Unknown";

                  const hasUnread = (conversation.unread_count || 0) > 0;
                  const lastMessage = conversation.last_message;
                  const serviceTitle =
                    conversation.service_title ||
                    conversation.job_title ||
                    conversation.booking_title;

                  return (
                    <div
                      key={conversation.id}
                      className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                        hasUnread
                          ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20"
                          : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]/30"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0 border-2 border-[var(--color-primary)]/20">
                          {otherParticipant?.avatar_url ? (
                            <Image
                              src={otherParticipant.avatar_url}
                              alt={participantName}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-full object-cover"
                              unoptimized
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <User className="h-6 w-6 text-[var(--color-primary)]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate text-[var(--color-text-primary)] mobile-text-base">
                                  {participantName}
                                </h3>
                                {hasUnread && (
                                  <span className="w-3 h-3 bg-[var(--color-primary)] rounded-full flex-shrink-0 animate-pulse"></span>
                                )}
                                {conversation.unread_count &&
                                  conversation.unread_count > 1 && (
                                    <span className="text-xs bg-[var(--color-primary)] text-white rounded-full px-2 py-0.5 font-semibold">
                                      {conversation.unread_count}
                                    </span>
                                  )}
                              </div>
                              {serviceTitle && (
                                <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                                  Re: {serviceTitle}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <p className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap flex items-center">
                                <Clock className="inline-block h-3 w-3 mr-1" />
                                {formatTime(
                                  lastMessage?.created_at ||
                                    conversation.last_message_at
                                )}
                              </p>
                            </div>
                          </div>
                          {lastMessage && (
                            <p className="text-sm mt-2 line-clamp-2 text-[var(--color-text-secondary)] mobile-leading">
                              {lastMessage.content}
                            </p>
                          )}
                          <div className="flex justify-end mt-4">
                            <Button
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/tasker/messages/${conversation.id}`
                                )
                              }
                              className={`touch-target transition-all duration-200 ${
                                hasUnread
                                  ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
                                  : "bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                              }`}
                            >
                              {hasUnread ? "Reply" : "View"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
