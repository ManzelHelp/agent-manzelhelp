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
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        messageFilter === status
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {status === "unread" ? (
        <Mail className="h-4 w-4" />
      ) : status === "read" ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <span className="capitalize">{status}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`text-xs rounded-full px-2 py-0.5 ${
            messageFilter === status
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted-foreground/20"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Manage your communications with clients
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>
                {unreadCount} unread message{unreadCount !== 1 && "s"}
              </CardDescription>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message Filters */}
          <div className="flex flex-wrap gap-2">
            <FilterButton status="all" />
            <FilterButton status="unread" count={unreadCount} />
            <FilterButton status="read" />
          </div>

          {/* Messages List */}
          <div className="space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <Mail className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No messages found</h3>
                <p className="text-sm text-muted-foreground">
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
                  className={`p-4 rounded-lg border transition-colors ${
                    message.unread
                      ? "bg-blue-50 border-blue-200"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted-foreground/10 flex items-center justify-center flex-shrink-0">
                      {message.avatar ? (
                        <img
                          src={message.avatar}
                          alt={message.client}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">
                              {message.client}
                            </h3>
                            {message.unread && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          {message.service && (
                            <p className="text-xs text-muted-foreground">
                              Re: {message.service}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            <Clock className="inline-block h-3 w-3 mr-1" />
                            {message.time}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm mt-1 line-clamp-2">
                        {message.message}
                      </p>
                      <div className="flex justify-end mt-3">
                        <Button
                          size="sm"
                          variant={message.unread ? "default" : "outline"}
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
  );
}
