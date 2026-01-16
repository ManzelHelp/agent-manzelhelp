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
  X,
  File,
  Image as ImageIcon,
} from "lucide-react";

import {
  getMessagesAction,
  sendMessageAction,
  markMessagesAsReadAction,
  type MessageWithDetails,
  type ConversationWithDetails,
} from "@/actions/messages";
import { createClient } from "@/supabase/client";
import { useUserStore } from "@/stores/userStore";
import { usePathname } from "next/navigation";
import { formatDateShort } from "@/lib/date-utils";
import { useMessagesRealtime } from "@/hooks/useMessagesRealtime";
import { useToast } from "@/hooks/use-toast";

export default function ChatPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations("chat");
  const chatId = params["chat-id"] as string;
  const { user } = useUserStore();
  const { toast } = useToast();

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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          const hasUnreadFromOther = fetchedMessages.some(m => !m.is_read && m.sender_id !== user?.id);

          if (hasUnreadFromOther && user?.id) {
            console.log("Marking messages as read for conversation:", chatId, "User:", user.id);
            const { success, updatedCount, errorMessage } = await markMessagesAsReadAction(chatId);
            console.log("Mark as read result:", { success, updatedCount, errorMessage });
            
            if (success && updatedCount > 0) {
              // Update local state immediately to show messages as read
              setMessages(prev => prev.map(m => 
                m.sender_id !== user.id ? { ...m, is_read: true } : m
              ));

              // Dispatch event to refresh conversations list immediately
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('messagesMarkedAsRead', { 
                  detail: { conversationId: chatId } 
                }));
              }
              // Force refresh of the router to update the conversation list
              router.refresh();
            } else if (!success) {
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
        // Avoid duplicates by ID
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        // Avoid duplicates by content, sender, and timestamp (within 2 seconds)
        const isDuplicate = prev.some((m) => {
          if (m.content === message.content &&
              m.sender_id === message.sender_id &&
              m.conversation_id === message.conversation_id) {
            const timeDiff = Math.abs(
              new Date(m.created_at || 0).getTime() -
              new Date(message.created_at || 0).getTime()
            );
            if (timeDiff < 2000) {
              return true;
            }
          }
          return false;
        });
        if (isDuplicate) {
          return prev;
        }
        // Add message (whether from current user or not)
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

  // Send a new message (with optional file)
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || isSending || isUploading || !chatId) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    const fileToSend = selectedFile;
    
    // Clear inputs immediately for better UX
    setNewMessage("");
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      let attachmentUrl: string | undefined = undefined;

      // Upload file if one is selected
      if (fileToSend) {
        setIsUploading(true);
        try {
          const supabase = createClient();
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !user) {
            throw new Error(t("errors.notAuthenticated", { default: "You must be logged in" }));
          }

          // Generate unique filename
          const fileExt = fileToSend.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${user.id}/${chatId}/${fileName}`;

          // Try to upload to message-attachments bucket, fallback to avatars if it doesn't exist
          let uploadError = null;
          let bucketName = "message-attachments";

          const uploadResult = await supabase.storage
            .from("message-attachments")
            .upload(filePath, fileToSend, {
              cacheControl: "3600",
              upsert: false,
            });

          uploadError = uploadResult.error;

          // If bucket doesn't exist, try avatars bucket as fallback
          if (uploadError && (uploadError.message?.includes("Bucket not found") || uploadError.message?.includes("does not exist"))) {
            bucketName = "avatars";
            const fallbackResult = await supabase.storage
              .from("avatars")
              .upload(filePath, fileToSend, {
                cacheControl: "3600",
                upsert: false,
              });
            uploadError = fallbackResult.error;
          }

          if (uploadError) {
            throw new Error(t("errors.uploadFailed", { default: `Failed to upload file: ${uploadError.message}` }));
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

          attachmentUrl = urlData?.publicUrl;

          if (!attachmentUrl) {
            throw new Error(t("errors.urlGenerationFailed", { default: "Failed to generate file URL" }));
          }
        } catch (fileError: any) {
          toast({
            variant: "destructive",
            title: t("errors.title", { default: "Error" }),
            description: fileError.message || t("errors.uploadFailed", { default: "Failed to upload file" }),
          });
          setNewMessage(messageContent); // Restore message on error
          setSelectedFile(fileToSend); // Restore file on error
          if (fileToSend.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
              setFilePreview(e.target?.result as string);
            };
            reader.readAsDataURL(fileToSend);
          }
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Send message (with or without attachment)
      const contentToSend = messageContent || (fileToSend ? `📎 ${fileToSend.name}` : "");
      const { message, errorMessage } = await sendMessageAction(
        chatId,
        contentToSend,
        attachmentUrl
      );

      if (errorMessage) {
        toast({
          variant: "destructive",
          title: t("errors.title", { default: "Error" }),
          description: errorMessage,
        });
        setNewMessage(messageContent); // Restore message on error
        if (fileToSend) setSelectedFile(fileToSend); // Restore file on error
      } else if (message) {
        toast({
          variant: "success",
          title: t("success.title", { default: "Success" }),
          description: fileToSend 
            ? t("success.fileSent", { default: "File sent successfully" })
            : t("success.messageSent", { default: "Message sent successfully" }),
        });
        // Message will be added via realtime
        scrollToBottom();
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast({
        variant: "destructive",
        title: t("errors.title", { default: "Error" }),
        description: err?.message || t("errors.sendFailed", { default: "Failed to send message" }),
      });
      setNewMessage(messageContent); // Restore message on error
      if (fileToSend) setSelectedFile(fileToSend); // Restore file on error
    } finally {
      setIsSending(false);
    }
  };

  // Handle file selection (just store the file, don't upload yet)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: t("errors.title", { default: "Error" }),
        description: t("errors.fileTooLarge", { default: "File size must be less than 5MB" }),
      });
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]); // Only refetch when conversation ID changes

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
    <div className="h-screen bg-[var(--color-bg)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] flex-shrink-0 z-10">
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
                            {message.attachment_url && (
                              <div className="mb-2">
                                {message.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                  <a
                                    href={message.attachment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded-lg overflow-hidden max-w-xs"
                                  >
                                    <Image
                                      src={message.attachment_url}
                                      alt={message.content?.replace("📎 ", "") || "Attachment"}
                                      width={300}
                                      height={200}
                                      className="w-full h-auto object-cover"
                                      unoptimized
                                    />
                                  </a>
                                ) : (
                                  <a
                                    href={message.attachment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 p-2 rounded-lg ${
                                      isOwn 
                                        ? "bg-white/20 hover:bg-white/30" 
                                        : "bg-[var(--color-surface)] hover:bg-[var(--color-surface)]/80"
                                    } transition-colors`}
                                  >
                                    <File className={`h-5 w-5 ${isOwn ? "text-white" : "text-[var(--color-primary)]"}`} />
                                    <span className={`text-sm font-medium ${isOwn ? "text-white" : "text-[var(--color-text-primary)]"}`}>
                                      {message.content?.replace("📎 ", "") || "File attachment"}
                                    </span>
                                  </a>
                                )}
                              </div>
                            )}
                            {message.content && !message.attachment_url && (
                              <p className={`text-sm mobile-leading ${
                                isOwn ? "text-white" : "text-[var(--color-text-primary)]"
                              }`}>
                                {message.content}
                              </p>
                            )}
                            {message.content && message.attachment_url && !message.content.startsWith("📎") && (
                              <p className={`text-sm mobile-leading mt-2 ${
                                isOwn ? "text-white" : "text-[var(--color-text-primary)]"
                              }`}>
                                {message.content}
                              </p>
                            )}
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
      <div className="bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFileSelect}
              disabled={isUploading || isSending}
            />
            <Button
              variant="ghost"
              size="sm"
              className="touch-target p-2 flex-shrink-0"
              title={t("actions.attach")}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isSending}
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Paperclip className="h-5 w-5" />
              )}
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
              disabled={(!newMessage.trim() && !selectedFile) || isSending || isUploading}
              className="touch-target bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-2xl px-4"
            >
              {isSending || isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="mt-3 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg flex items-center gap-3">
              {filePreview ? (
                <div className="relative">
                  <Image
                    src={filePreview}
                    alt={selectedFile.name}
                    width={60}
                    height={60}
                    className="w-15 h-15 object-cover rounded-lg"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-15 h-15 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center">
                  <File className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="h-8 w-8 p-0"
                disabled={isSending || isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

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
