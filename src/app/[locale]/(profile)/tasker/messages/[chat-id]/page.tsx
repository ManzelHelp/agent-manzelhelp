"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  is_read: boolean;
  attachment_url?: string;
  attachment_type?: "image" | "file";
}

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Mock customer data - replace with real data fetching
  const customerInfo: CustomerInfo = {
    id: "customer-1",
    name: "Sarah M.",
    phone: "+1 (555) 123-4567",
    email: "sarah.m@example.com",
    location: "Downtown, City",
    service: "House Cleaning",
    booking_date: "2024-12-20",
    price: 150,
  };

  // Mock messages - replace with real data fetching
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender_id: "customer-1",
      content:
        "Hi! I'm interested in your house cleaning service. What cleaning supplies do you need me to provide?",
      timestamp: "2024-12-19T10:30:00Z",
      is_read: true,
    },
    {
      id: "2",
      sender_id: "tasker-1",
      content:
        "Hello Sarah! I'll bring all the necessary cleaning supplies. I have professional-grade products that are safe for all surfaces.",
      timestamp: "2024-12-19T10:35:00Z",
      is_read: true,
    },
    {
      id: "3",
      sender_id: "customer-1",
      content:
        "That's great! I have a 3-bedroom apartment. How long do you think it will take?",
      timestamp: "2024-12-19T11:00:00Z",
      is_read: true,
    },
    {
      id: "4",
      sender_id: "tasker-1",
      content:
        "For a 3-bedroom apartment, I typically need 3-4 hours for a thorough cleaning. I'll make sure everything is spotless!",
      timestamp: "2024-12-19T11:05:00Z",
      is_read: false,
    },
    {
      id: "5",
      sender_id: "customer-1",
      content: "Perfect! I'll be home around 2 PM. See you then!",
      timestamp: "2024-12-19T11:10:00Z",
      is_read: false,
    },
  ]);

  const isCustomer = (senderId: string) => senderId === "customer-1";
  const currentUserId = "tasker-1";

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp: string) => {
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
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      is_read: false,
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-[var(--color-text-secondary)]">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="flex flex-col h-screen max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2 hover:bg-[var(--color-accent-light)]"
            >
              <ArrowLeft className="h-5 w-5 text-[var(--color-text-primary)]" />
            </Button>

            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center border-2 border-[var(--color-primary)]/20">
                {customerInfo.avatar ? (
                  <img
                    src={customerInfo.avatar}
                    alt={customerInfo.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-[var(--color-primary)]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-[var(--color-text-primary)] truncate">
                  {customerInfo.name}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] truncate">
                  {customerInfo.service}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-[var(--color-accent-light)]"
            >
              <MoreVertical className="h-5 w-5 text-[var(--color-text-primary)]" />
            </Button>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
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
                      } rounded-2xl px-4 py-2 shadow-sm`}
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
                        <span>{formatTime(message.timestamp)}</span>
                        {!isCustomer(message.sender_id) && (
                          <span>
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
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full pr-12 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] resize-none rounded-md px-3 py-2 text-sm min-h-[40px] max-h-[120px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                rows={1}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 hover:bg-[var(--color-accent-light)]"
                >
                  <Paperclip className="h-4 w-4 text-[var(--color-text-secondary)]" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 hover:bg-[var(--color-accent-light)]"
                >
                  <ImageIcon className="h-4 w-4 text-[var(--color-text-secondary)]" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 hover:bg-[var(--color-accent-light)]"
                >
                  <Smile className="h-4 w-4 text-[var(--color-text-secondary)]" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
