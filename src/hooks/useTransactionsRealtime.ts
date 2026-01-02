"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/supabase/client";

interface UseTransactionsRealtimeOptions {
  userId: string | null;
  enabled?: boolean;
  onNewTransaction?: (transaction: any) => void;
  onWalletUpdate?: (newBalance: number) => void;
}

interface UseTransactionsRealtimeReturn {
  isConnected: boolean;
}

/**
 * Hook to manage realtime subscriptions for transactions
 * Updates wallet balance when new transactions are created
 */
export function useTransactionsRealtime(
  options: UseTransactionsRealtimeOptions
): UseTransactionsRealtimeReturn {
  const { userId, enabled = true, onNewTransaction, onWalletUpdate } = options;
  const [isConnected, setIsConnected] = useState(false);

  // Store callbacks in refs to avoid reconnection loops
  const onNewTransactionRef = useRef(onNewTransaction);
  const onWalletUpdateRef = useRef(onWalletUpdate);

  // Update refs when callbacks change
  useEffect(() => {
    onNewTransactionRef.current = onNewTransaction;
    onWalletUpdateRef.current = onWalletUpdate;
  }, [onNewTransaction, onWalletUpdate]);

  useEffect(() => {
    if (!userId || !enabled) {
      setIsConnected(false);
      return;
    }

    const supabase = createClient();
    const channelName = `transactions:${userId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
          filter: `payer_id=eq.${userId}`,
        },
        (payload) => {
          console.log("New transaction (as payer):", payload.new);
          if (onNewTransactionRef.current) {
            onNewTransactionRef.current(payload.new);
          }
          // Trigger wallet balance refresh
          window.dispatchEvent(new CustomEvent('transactionCreated', { detail: payload.new }));
          if (onWalletUpdateRef.current) {
            // Note: Actual wallet balance should be fetched from users table
            // This just triggers a refresh
            window.dispatchEvent(new CustomEvent('walletBalanceChanged'));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          console.log("New transaction (as recipient):", payload.new);
          if (onNewTransactionRef.current) {
            onNewTransactionRef.current(payload.new);
          }
          window.dispatchEvent(new CustomEvent('transactionCreated', { detail: payload.new }));
          if (onWalletUpdateRef.current) {
            window.dispatchEvent(new CustomEvent('walletBalanceChanged'));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          // Listen to wallet_balance updates
          if (payload.new.wallet_balance !== undefined) {
            console.log("Wallet balance updated:", payload.new.wallet_balance);
            if (onWalletUpdateRef.current) {
              onWalletUpdateRef.current(Number(payload.new.wallet_balance));
            }
            window.dispatchEvent(new CustomEvent('walletBalanceChanged', { 
              detail: { balance: payload.new.wallet_balance } 
            }));
          }
        }
      )
      .subscribe((status) => {
        console.log("Transactions channel status:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      console.log("Cleaning up transactions channel:", channelName);
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [userId, enabled]); // Removed callbacks from dependencies to prevent reconnection loops

  return {
    isConnected,
  };
}

