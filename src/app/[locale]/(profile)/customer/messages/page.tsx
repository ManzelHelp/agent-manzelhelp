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
  MessageSquare,
} from "lucide-react";
import Image from "next/image";

type MessageStatus = "all" | "unread" | "read";

interface Message {
  id: number;
  tasker: string;
  message: string;
  time: string;
  unread: boolean;
  avatar?: string;
  service?: string;
  jobTitle?: string;
}

export default function CustomerMessagesPage() {
  const [messageFilter, setMessageFilter] = useState<MessageStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with real data fetching
  const messages: Message[] = [
    {
      id: 1,
      tasker: "Maria S.",
      message: "I'll arrive 10 minutes early to set up my equipment.",
      time: "1 hour ago",
      unread: true,
      service: "House Deep Clean",
      jobTitle: "House Deep Clean",
    },
    {
      id: 2,
      tasker: "John D.",
      message: "Could you confirm the furniture pieces that need assembly?",
      time: "3 hours ago",
      unread: true,
      service: "Furniture Assembly",
      jobTitle: "Furniture Assembly",
    },
    {
      id: 3,
      tasker: "Lisa K.",
      message: "Thanks for booking! I'll bring all necessary tools.",
      time: "1 day ago",
      unread: false,
      service: "Garden Maintenance",
      jobTitle: "Garden Maintenance",
    },
    {
      id: 4,
      tasker: "Robert S.",
      message: "The kitchen cleaning is complete. Please review the work.",
      time: "2 days ago",
      unread: false,
      service: "Kitchen Deep Clean",
      jobTitle: "Kitchen Deep Clean",
    },
    {
      id: 5,
      tasker: "Anna L.",
      message: "I've fixed the plumbing issue. Everything should work now.",
      time: "3 days ago",
      unread: false,
      service: "Plumbing Repair",
      jobTitle: "Plumbing Repair",
    },
    {
      id: 6,
      tasker: "Mike R.",
      message: "All items have been moved safely. The job is complete.",
      time: "1 week ago",
      unread: false,
      service: "Moving Help",
      jobTitle: "Moving Help",
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
        message.tasker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
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
          Communicate with your taskers and manage your conversations
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
                placeholder="Search messages, taskers, or services..."
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
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <MessageSquare className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  No messages found
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : messageFilter === "unread"
                    ? "You have no unread messages"
                    : messageFilter === "read"
                    ? "You have no read messages"
                    : "Your inbox is empty. Start a conversation with your taskers!"}
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border transition-colors hover:shadow-sm ${
                    message.unread
                      ? "bg-blue-50 border-blue-200"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted-foreground/10 flex items-center justify-center flex-shrink-0">
                      {message.avatar ? (
                        <Image
                          src={message.avatar}
                          alt={message.tasker}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold truncate">
                              {message.tasker}
                            </h3>
                            {message.unread && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          {message.jobTitle && (
                            <p className="text-xs text-muted-foreground truncate">
                              Re: {message.jobTitle}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            <Clock className="inline-block h-3 w-3 mr-1" />
                            {message.time}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm mt-2 line-clamp-2">
                        {message.message}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        {message.service && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {message.service}
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant={message.unread ? "default" : "outline"}
                          className="flex items-center gap-1"
                        >
                          <MessageSquare className="h-3 w-3" />
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

      {/* Quick Stats */}
      {filteredMessages.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{messages.length}</p>
                <p className="text-xs text-muted-foreground">Total Messages</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-xs text-muted-foreground">Unread</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {messages.filter((m) => !m.unread).length}
                </p>
                <p className="text-xs text-muted-foreground">Read</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(messages.map((m) => m.tasker)).size}
                </p>
                <p className="text-xs text-muted-foreground">Taskers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
