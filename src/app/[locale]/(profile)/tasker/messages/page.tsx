"use client";

import React, { useState } from "react";
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
} from "lucide-react";

type MessageStatus = "all" | "unread" | "read";

interface Message {
  id: number;
  client: string;
  message: string;
  time: string;
  unread: boolean;
  avatar?: string;
  service?: string;
}

export default function MessagesPage() {
  const [messageFilter, setMessageFilter] = useState<MessageStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with real data fetching
  const messages: Message[] = [
    {
      id: 1,
      client: "Sarah M.",
      message: "What cleaning supplies do you need me to provide?",
      time: "2 hours ago",
      unread: true,
      service: "House Cleaning",
    },
    {
      id: 2,
      client: "Tech Corp",
      message: "Can we reschedule for tomorrow?",
      time: "5 hours ago",
      unread: true,
      service: "Office Cleaning",
    },
    {
      id: 3,
      client: "Emma T.",
      message: "Thank you for the great service!",
      time: "1 day ago",
      unread: false,
      service: "Pet Sitting",
    },
    {
      id: 4,
      client: "John D.",
      message: "I've sent the payment for today's service.",
      time: "2 days ago",
      unread: false,
      service: "Furniture Assembly",
    },
    {
      id: 5,
      client: "Mike R.",
      message: "Looking forward to our appointment next week.",
      time: "3 days ago",
      unread: false,
      service: "Moving Help",
    },
  ];

  const filteredMessages = messages
    .filter((message) => {
      if (messageFilter === "unread") return message.unread;
      if (messageFilter === "read") return !message.unread;
      return true;
    })
    .filter(
      (message) =>
        searchQuery === "" ||
        message.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.service?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const unreadCount = messages.filter((m) => m.unread).length;

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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] mobile-focus touch-target"
                />
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
              {filteredMessages.length === 0 ? (
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
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      message.unread
                        ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20"
                        : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]/30"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0 border-2 border-[var(--color-primary)]/20">
                        {message.avatar ? (
                          <img
                            src={message.avatar}
                            alt={message.client}
                            className="h-12 w-12 rounded-full object-cover"
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
                                {message.client}
                              </h3>
                              {message.unread && (
                                <span className="w-3 h-3 bg-[var(--color-primary)] rounded-full flex-shrink-0 animate-pulse"></span>
                              )}
                            </div>
                            {message.service && (
                              <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                                Re: {message.service}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <p className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap flex items-center">
                              <Clock className="inline-block h-3 w-3 mr-1" />
                              {message.time}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm mt-2 line-clamp-2 text-[var(--color-text-secondary)] mobile-leading">
                          {message.message}
                        </p>
                        <div className="flex justify-end mt-4">
                          <Button
                            size="sm"
                            className={`touch-target transition-all duration-200 ${
                              message.unread
                                ? "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
                                : "bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                            }`}
                          >
                            Reply
                          </Button>
                        </div>
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
