"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Filter, Eye, Archive, Reply, X } from "lucide-react";
import {
  getContactMessages,
  updateContactMessageStatus,
} from "@/actions/contact";
import type { ContactMessage, ContactMessageStatus } from "@/types/supabase";
import { formatDistanceToNow } from "date-fns";

export default function AdminContactMessagesPage() {
  const t = useTranslations("admin.contactMessages");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<ContactMessageStatus | undefined>();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const result = await getContactMessages(selectedStatus, 100, 0);
      if (result.success && result.messages) {
        setMessages(result.messages);
      } else {
        toast.error(result.errorMessage || t("errors.loadFailed"));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(t("errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedStatus]);

  const handleStatusChange = async (
    messageId: string,
    newStatus: ContactMessageStatus
  ) => {
    setUpdating(messageId);
    try {
      const result = await updateContactMessageStatus(messageId, {
        status: newStatus,
      });
      if (result.success) {
        toast.success(t("statusUpdated"));
        fetchMessages();
        if (selectedMessage?.id === messageId) {
          setSelectedMessage({ ...selectedMessage, status: newStatus });
        }
      } else {
        toast.error(result.errorMessage || t("errors.updateFailed"));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(t("errors.updateFailed"));
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadgeColor = (status: ContactMessageStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "read":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "replied":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "archived":
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-500";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: ContactMessageStatus) => {
    return t(`status.${status}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            {t("title")}
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            {t("description")}
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--color-text-secondary)]" />
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {t("filters.status")}:
              </span>
            </div>
            <Button
              variant={selectedStatus === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(undefined)}
            >
              {t("filters.all")}
            </Button>
            <Button
              variant={selectedStatus === "new" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("new")}
            >
              {t("filters.new")}
            </Button>
            <Button
              variant={selectedStatus === "read" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("read")}
            >
              {t("filters.read")}
            </Button>
            <Button
              variant={selectedStatus === "replied" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("replied")}
            >
              {t("filters.replied")}
            </Button>
            <Button
              variant={selectedStatus === "archived" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus("archived")}
            >
              {t("filters.archived")}
            </Button>
          </div>
        </Card>

        {/* Messages List */}
        {loading ? (
          <Card className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[var(--color-primary)]" />
            <p className="text-[var(--color-text-secondary)]">{t("loading")}</p>
          </Card>
        ) : messages.length === 0 ? (
          <Card className="p-12 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-[var(--color-text-secondary)]" />
            <p className="text-[var(--color-text-secondary)]">{t("noMessages")}</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedMessage?.id === message.id ? "ring-2 ring-[var(--color-primary)]" : ""
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[var(--color-text-primary)]">
                            {message.first_name} {message.last_name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              message.status || "new"
                            )}`}
                          >
                            {getStatusLabel(message.status || "new")}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                          {message.email}
                        </p>
                        <p className="font-medium text-[var(--color-text-primary)] mb-2">
                          {message.subject}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                          {message.message}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                      {message.created_at
                        ? formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                          })
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 sm:flex-col">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMessage(message);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t("actions.view")}
                    </Button>
                    {message.status !== "replied" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(message.id, "replied");
                        }}
                        disabled={updating === message.id}
                      >
                        {updating === message.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Reply className="h-4 w-4 mr-1" />
                            {t("actions.markReplied")}
                          </>
                        )}
                      </Button>
                    )}
                    {message.status !== "archived" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(message.id, "archived");
                        }}
                        disabled={updating === message.id}
                      >
                        {updating === message.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Archive className="h-4 w-4 mr-1" />
                            {t("actions.archive")}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedMessage(null)}
          >
            <Card
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                      {selectedMessage.first_name} {selectedMessage.last_name}
                    </h2>
                    <p className="text-[var(--color-text-secondary)] mb-1">
                      {selectedMessage.email}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {selectedMessage.created_at
                        ? new Date(selectedMessage.created_at).toLocaleString()
                        : ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMessage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                      selectedMessage.status || "new"
                    )}`}
                  >
                    {getStatusLabel(selectedMessage.status || "new")}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
                    {t("detail.subject")}:
                  </h3>
                  <p className="text-[var(--color-text-primary)]">{selectedMessage.subject}</p>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
                    {t("detail.message")}:
                  </h3>
                  <p className="text-[var(--color-text-primary)] whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                {selectedMessage.admin_notes && (
                  <div className="mb-4 p-4 bg-[var(--color-surface)] rounded-lg">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
                      {t("detail.adminNotes")}:
                    </h3>
                    <p className="text-[var(--color-text-secondary)] whitespace-pre-wrap">
                      {selectedMessage.admin_notes}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  {selectedMessage.status !== "read" && (
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange(selectedMessage.id, "read")}
                      disabled={updating === selectedMessage.id}
                    >
                      {updating === selectedMessage.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {t("actions.markRead")}
                    </Button>
                  )}
                  {selectedMessage.status !== "replied" && (
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange(selectedMessage.id, "replied")}
                      disabled={updating === selectedMessage.id}
                    >
                      {updating === selectedMessage.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Reply className="h-4 w-4 mr-2" />
                      )}
                      {t("actions.markReplied")}
                    </Button>
                  )}
                  {selectedMessage.status !== "archived" && (
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange(selectedMessage.id, "archived")}
                      disabled={updating === selectedMessage.id}
                    >
                      {updating === selectedMessage.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Archive className="h-4 w-4 mr-2" />
                      )}
                      {t("actions.archive")}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

