"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
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
} from "lucide-react";

import {
  getMessagesAction,
  sendMessageAction,
  markMessagesAsReadAction,
  type MessageWithDetails,
  type ConversationWithDetails,
} from "@/actions/messages";
import { useUserStore } from "@/stores/userStore";
import { formatDateShort } from "@/lib/date-utils";
import { useMessagesRealtime } from "@/hooks/useMessagesRealtime";
import { useToast } from "@/hooks/use-toast";
import { messageSchema } from "@/lib/schemas/messages";
import { cn } from "@/lib/utils";
import { createClient } from "@/supabase/client";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("chat");
  const chatId = params["chat-id"] as string;
  const { user } = useUserStore();
  const { toast } = useToast();

  const [messages, setMessages] = useState<MessageWithDetails[]>([]);
  const [conversation, setConversation] = useState<ConversationWithDetails | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(
    async (isRefresh = false, append = false) => {
      if (!chatId) return;
      try {
        if (append) setIsLoadingMore(true);
        else if (isRefresh) setIsRefreshing(true);
        else setIsLoading(true);
        
        setError(null);
        const offset = append ? currentOffset : 0;
        const {
          messages: fetchedMessages,
          conversation: fetchedConversation,
          errorMessage,
          hasMore: moreAvailable,
        } = await getMessagesAction(chatId, 10, offset);

        if (errorMessage) {
          setError(errorMessage);
        } else {
          if (append) {
            setMessages((prev) => [...fetchedMessages, ...prev]);
            setCurrentOffset((prev) => prev + fetchedMessages.length);
          } else {
            setMessages(fetchedMessages);
            setCurrentOffset(fetchedMessages.length);
          }
          setConversation(fetchedConversation);
          setHasMore(moreAvailable || false);

          if (fetchedMessages.length > 0 && user?.id) {
            const { success } = await markMessagesAsReadAction(chatId);
            if (success) {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('messagesMarkedAsRead', { 
                  detail: { conversationId: chatId } 
                }));
              }
              router.refresh();
            }
          }
        }
      } catch (err) {
        setError(t("errors.loadFailed"));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [chatId, currentOffset, user?.id, t, router]
  );

  const loadOlderMessages = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading && chatId) {
      fetchMessages(false, true);
    }
  }, [isLoadingMore, hasMore, isLoading, chatId, fetchMessages]);

  useMessagesRealtime({
    conversationId: chatId,
    enabled: !!chatId,
    onNewMessage: (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    },
    onMessageUpdate: (message) => {
      setMessages((prev) => prev.map((m) => (m.id === message.id ? message : m)));
    },
  });

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || isSending || isUploading || !chatId) return;

    if (newMessage.trim()) {
      const validation = messageSchema.safeParse({ content: newMessage });
      if (!validation.success) {
        setMessageError(validation.error.issues[0].message);
        return;
      }
    }

    const messageContent = newMessage.trim();
    const fileToSend = selectedFile;
    setMessageError("");
    setNewMessage("");
    setSelectedFile(null);
    setFilePreview(null);
    
    setIsSending(true);

    try {
      let attachmentUrl: string | undefined = undefined;

      if (fileToSend) {
        setIsUploading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error(t("errors.notAuthenticated"));

        const fileExt = fileToSend.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${chatId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("message-attachments")
          .upload(filePath, fileToSend);

        if (uploadError) throw new Error(t("errors.uploadFailed"));

        const { data: urlData } = supabase.storage.from("message-attachments").getPublicUrl(filePath);
        attachmentUrl = urlData?.publicUrl;
      }

      const contentToSend = messageContent || `📎 ${fileToSend?.name}`;
      const { errorMessage } = await sendMessageAction(chatId, contentToSend, attachmentUrl);

      if (errorMessage) {
        toast({ variant: "destructive", title: t("errors.title"), description: errorMessage });
      } else {
        scrollToBottom();
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: t("errors.title"), description: err.message || t("errors.sendFailed") });
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: t("errors.title"), description: t("errors.fileTooLarge") });
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return t("time.justNow");
    if (diffInMinutes < 60) return t("time.minutesAgo", { minutes: diffInMinutes });
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t("time.hoursAgo", { hours: diffInHours });
    return formatDateShort(date);
  };

  const formatMessageDate = (timestamp: string | undefined) => {
    if (!timestamp) return t("time.today");
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return t("time.today");
    if (date.toDateString() === yesterday.toDateString()) return t("time.yesterday");
    return formatDateShort(date);
  };

  const groupMessagesByDate = (messages: MessageWithDetails[]) => {
    const groups: { [key: string]: MessageWithDetails[] } = {};
    messages.forEach((message) => {
      if (message.created_at) {
        const date = new Date(message.created_at).toDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(message);
      }
    });
    return groups;
  };

  useEffect(() => { fetchMessages(); }, [fetchMessages]);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
          <h3 className="font-semibold text-[var(--color-text-primary)]">{t("loading.title")}</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">{t("loading.description")}</p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-center px-4">
        <div className="max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="font-semibold text-[var(--color-text-primary)]">{t("errors.loadFailed")}</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">{error || t("errors.conversationNotFound")}</p>
          <div className="flex gap-3 justify-center">
            <BackButton variant="outline" />
            <Button onClick={() => fetchMessages(true)}><RefreshCw className="mr-2 h-4 w-4" /> {t("actions.tryAgain")}</Button>
          </div>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.other_participant;
  const participantName = otherParticipant 
    ? `${otherParticipant.first_name || ""} ${otherParticipant.last_name || ""}`.trim() || t("common.unknown")
    : t("common.unknown");

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-screen bg-[var(--color-bg)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] p-4 flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center border-2 border-[var(--color-primary)]/20 overflow-hidden">
                {otherParticipant?.avatar_url ? (
                  <Image src={otherParticipant.avatar_url} alt="" width={40} height={40} className="object-cover" unoptimized />
                ) : (
                  <User className="h-5 w-5 text-[var(--color-primary)]" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="font-semibold text-[var(--color-text-primary)] truncate">{participantName}</h1>
                <p className="text-xs text-[var(--color-text-secondary)] truncate">
                  {conversation.service_title || conversation.job_title || conversation.booking_title}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => fetchMessages(true)} disabled={isRefreshing}>
              <RefreshCw className={cn("h-5 w-5", isRefreshing && "animate-spin")} />
            </Button>
            <Button variant="ghost" size="sm"><Info className="h-5 w-5" /></Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {hasMore && (
          <div className="flex justify-center">
            <Button onClick={loadOlderMessages} disabled={isLoadingMore} variant="outline" size="sm">
              {isLoadingMore ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : <ArrowDown className="rotate-180 mr-2 h-4 w-4" />}
              {isLoadingMore ? t("actions.loading") : t("actions.loadOlder")}
            </Button>
          </div>
        )}

        {Object.keys(messageGroups).length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-[var(--color-text-secondary)] mx-auto mb-4" />
            <h3 className="font-semibold text-[var(--color-text-primary)]">{t("empty.title")}</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">{t("empty.description")}</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date} className="space-y-4">
              <div className="flex justify-center">
                <span className="bg-[var(--color-surface)] px-3 py-1 rounded-full text-[10px] border font-medium text-[var(--color-text-secondary)]">
                  {formatMessageDate(dateMessages[0].created_at)}
                </span>
              </div>
              {dateMessages.map((msg, idx) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={cn("flex gap-3", isOwn ? "justify-end" : "justify-start")}>
                    {!isOwn && (
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
                        {msg.sender?.avatar_url ? <Image src={msg.sender.avatar_url} alt="" width={32} height={32} unoptimized /> : <User className="p-1.5" />}
                      </div>
                    )}
                    <div className={cn("flex flex-col max-w-[75%]", isOwn ? "items-end" : "items-start")}>
                      <div className={cn("px-4 py-2 rounded-2xl shadow-sm", isOwn ? "bg-[var(--color-primary)] text-white rounded-tr-none" : "bg-white dark:bg-slate-800 border rounded-tl-none")}>
                        {msg.attachment_url && (
                          <div className="mb-2">
                            {msg.attachment_url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                              <Image src={msg.attachment_url} alt="Attachment" width={240} height={180} className="rounded-lg object-cover" unoptimized />
                            ) : (
                              <a href={msg.attachment_url} target="_blank" className="flex items-center gap-2 underline text-xs">
                                <File className="h-4 w-4" /> {t("common.fileAttachment")}
                              </a>
                            )}
                          </div>
                        )}
                        <p className="text-sm">{msg.content?.replace("📎 ", "")}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-[var(--color-text-secondary)]">{formatMessageTime(msg.created_at || "")}</span>
                        {isOwn && (msg.is_read ? <CheckCircle2 className="h-3 w-3 text-blue-500" /> : <Clock className="h-3 w-3 text-slate-400" />)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[var(--color-surface)] border-t p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {selectedFile && (
            <div className="flex items-center gap-3 p-2 bg-[var(--color-bg)] border rounded-xl">
              <div className="h-10 w-10 bg-[var(--color-primary)]/10 rounded flex items-center justify-center">
                {filePreview ? <Image src={filePreview} alt="" width={40} height={40} className="rounded object-cover" unoptimized /> : <File className="h-5 w-5 text-[var(--color-primary)]" />}
              </div>
              <span className="text-xs flex-1 truncate">{selectedFile.name}</span>
              <Button variant="ghost" size="sm" onClick={() => {setSelectedFile(null); setFilePreview(null);}}><X className="h-4 w-4" /></Button>
            </div>
          )}
          
          <div className="flex items-end gap-2">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => fileInputRef.current?.click()} disabled={isSending || isUploading}>
              {isUploading ? <Loader2 className="animate-spin h-5 w-5" /> : <Paperclip className="h-5 w-5" />}
            </Button>
            
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => {setNewMessage(e.target.value); setMessageError("");}}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                placeholder={t("input.placeholder")}
                className={cn("rounded-2xl pr-10", messageError && "border-red-500")}
              />
              <Smile className="absolute right-3 top-2.5 h-5 w-5 text-slate-400 cursor-pointer" />
              {messageError && <p className="text-[10px] text-red-500 mt-1 absolute">{messageError}</p>}
            </div>

            <Button onClick={handleSendMessage} disabled={(!newMessage.trim() && !selectedFile) || isSending} className="rounded-full bg-[var(--color-primary)]">
              {isSending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          
          {newMessage.length > 0 && (
             <div className="flex justify-between text-[10px] text-slate-400 px-2">
                <span>{t("input.charactersCount", { count: newMessage.length, max: 500 })}</span>
                <span>{t("input.pressEnter")}</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}