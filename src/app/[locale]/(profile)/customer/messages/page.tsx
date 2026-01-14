"use client";

import { useState, useEffect, useCallback } from "react";
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
  type MessageWithDetails,
} from "@/actions/messages";
import { useUserStore } from "@/stores/userStore";
import { useConversationsRealtime } from "@/hooks/useConversationsRealtime";
import { BackButton } from "@/components/ui/BackButton";
import { formatDateShort } from "@/lib/date-utils";

type MessageStatus = "all" | "unread" | "read";

export default function MessagesPage() {
  const router = useRouter();
  const t = useTranslations("messages"); // Namespace correct
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
      const { conversations: fetchedConversations, errorMessage, hasMore: moreAvailable } =
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
      setError(t("errorLoadingMessages"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [currentOffset, t]);

  useConversationsRealtime({
    userId: user?.id || null,
    enabled: !!user?.id,
    onNewConversation: () => fetchConversations(true, false),
    onConversationUpdate: () => fetchConversations(true, false),
    onNewMessage: () => fetchConversations(true, false),
  });

  useEffect(() => {
    fetchConversations();
    const handleMessagesMarkedAsRead = () => fetchConversations(true, false);
    window.addEventListener('messagesMarkedAsRead', handleMessagesMarkedAsRead);
    return () => window.removeEventListener('messagesMarkedAsRead', handleMessagesMarkedAsRead);
  }, [fetchConversations]);

  // Helper function to format time with translations
  const formatTime = (timestamp: string | undefined) => {
    if (!timestamp) return t("unknown");

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return t("justNow");
    if (diffInHours < 24) return t("hoursAgo", { count: diffInHours });

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return t("daysAgo", { count: diffInDays });

    return formatDateShort(timestamp);
  };

  const filteredConversations = conversations
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
        ? `${otherParticipant.first_name || ""} ${otherParticipant.last_name || ""}`.trim()
        : "";
      const lastMessage = conversation.last_message?.content || "";
      return (
        participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  const groupedByParticipant = filteredConversations.reduce((acc, conversation) => {
    const otherParticipant = conversation.other_participant;
    const participantId = otherParticipant 
      ? (conversation.participant1_id === user?.id ? conversation.participant2_id : conversation.participant1_id)
      : "unknown";
    
    if (!acc[participantId]) {
      acc[participantId] = {
        participantId,
        participantName: otherParticipant ? `${otherParticipant.first_name || ""} ${otherParticipant.last_name || ""}`.trim() || t("unknown") : t("unknown"),
        participantAvatar: otherParticipant?.avatar_url,
        conversations: [],
        totalUnread: 0,
      };
    }

    acc[participantId].conversations.push(conversation);
    acc[participantId].totalUnread += conversation.unread_count || 0;
    
    const conversationLastMessageAt = conversation.last_message?.created_at || conversation.last_message_at;
    if (conversationLastMessageAt) {
      if (!acc[participantId].lastMessageAt || new Date(conversationLastMessageAt) > new Date(acc[participantId].lastMessageAt!)) {
        acc[participantId].lastMessageAt = conversationLastMessageAt;
        acc[participantId].lastMessage = conversation.last_message;
      }
    }
    return acc;
  }, {} as Record<string, any>);

  const groupedConversations = Object.values(groupedByParticipant).sort((a: any, b: any) => {
    const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return timeB - timeA;
  });

  const unreadTotal = conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0);

  const FilterButton = ({ status, count }: { status: MessageStatus; count?: number }) => (
    <button
      onClick={() => setMessageFilter(status)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        messageFilter === status
          ? "bg-[var(--color-primary)] text-white"
          : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
      }`}
    >
      {status === "unread" ? <Mail className="h-4 w-4" /> : status === "read" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      <span className="font-medium">{t(status)}</span>
      {count !== undefined && count > 0 && (
        <span className={`text-xs rounded-full px-2 py-0.5 ${messageFilter === status ? "bg-white/20" : "bg-[var(--color-primary)] text-white"}`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-4"><BackButton /></div>
        
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">{t("messages")}</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">{t("manageCommunications")}</p>
        </div>

        <Card className="border-[var(--color-border)] bg-[var(--color-surface)]">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle>{t("inbox")}</CardTitle>
                <CardDescription>{t("unreadMessages", { count: unreadTotal })}</CardDescription>
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                  <Input
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" onClick={() => fetchConversations(true)} disabled={isRefreshing}>
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <FilterButton status="all" />
              <FilterButton status="unread" count={unreadTotal} />
              <FilterButton status="read" />
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
                  <h3 className="font-semibold">{t("loadingMessages")}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{t("pleaseWait")}</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="font-semibold">{t("errorLoadingMessages")}</h3>
                  <Button onClick={() => fetchConversations()} className="mt-4">{t("tryAgain")}</Button>
                </div>
              ) : groupedConversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
                  <h3 className="font-semibold">{t("noMessagesFound")}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {searchQuery ? t("tryAdjustingSearch") : messageFilter === "unread" ? t("noUnreadMessages") : t("emptyInbox")}
                  </p>
                </div>
              ) : (
                groupedConversations.map((group: any) => (
                  <div
                    key={group.participantId}
                    className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${group.totalUnread > 0 ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20" : "bg-[var(--color-surface)]"}`}
                    onClick={() => router.push(`/customer/messages/${group.conversations[0].id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-[var(--color-primary)]/20">
                        {group.participantAvatar ? (
                          <Image src={group.participantAvatar} alt="" width={48} height={48} className="object-cover" unoptimized />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400"><User /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold truncate">{group.participantName}</h3>
                          <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatTime(group.lastMessageAt)}
                          </span>
                        </div>
                        {group.conversations.length > 1 && (
                          <p className="text-[10px] text-[var(--color-primary)] font-bold uppercase">{t("conversationsCount", { count: group.conversations.length })}</p>
                        )}
                        <p className="text-sm mt-1 line-clamp-2 text-[var(--color-text-secondary)]">
                          {group.lastMessage?.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}