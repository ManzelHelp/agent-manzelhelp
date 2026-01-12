"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { refundRequestSchema } from "@/lib/schemas/wallet";
import type { RefundRequestFormData } from "@/lib/schemas/wallet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign, Copy, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createWalletRefundRequest,
  type WalletRefundRequest,
} from "@/actions/wallet-refunds";
import { getWalletBalance } from "@/actions/finance";

interface RefundRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (request: WalletRefundRequest) => void;
}

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000];

export function RefundRequestDialog({
  isOpen,
  onClose,
  onSuccess,
}: RefundRequestDialogProps) {
  const t = useTranslations("finance.walletRefund");
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdRequest, setCreatedRequest] =
    useState<WalletRefundRequest | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);

  const form = useForm<RefundRequestFormData>({
    resolver: zodResolver(refundRequestSchema),
    defaultValues: {
      amount: 0,
    },
  });

  // Load wallet balance when dialog opens
  useEffect(() => {
    if (isOpen && walletBalance === null) {
      getWalletBalance()
        .then((balance) => {
          setWalletBalance(balance.available);
        })
        .catch((error) => {
          console.error("Error loading wallet balance:", error);
        });
    }
  }, [isOpen, walletBalance]);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
    setAmountError(null);
    // Validate on change
    const numValue = parseFloat(value);
    if (value && !isNaN(numValue)) {
      const validation = refundRequestSchema.safeParse({ amount: numValue });
      if (!validation.success) {
        setAmountError(validation.error.errors[0]?.message || null);
      } else if (walletBalance !== null && numValue > walletBalance) {
        setAmountError(t("errors.insufficientBalance"));
      } else {
        setAmountError(null);
      }
    } else {
      setAmountError(null);
    }
  };

  const handleCreateRequest = async () => {
    const amount = selectedAmount || parseFloat(customAmount);

    // Validate with Zod
    const validation = refundRequestSchema.safeParse({ amount });
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || t("errors.invalidAmount");
      setAmountError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: errorMessage,
      });
      return;
    }

    if (walletBalance !== null && amount > walletBalance) {
      const errorMessage = t("errors.insufficientBalance");
      setAmountError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
      return;
    }

    setIsCreating(true);
    setAmountError(null);

    try {
      const result = await createWalletRefundRequest(amount);

      if (result.success && result.request) {
        setCreatedRequest(result.request);
        toast({
          variant: "success",
          title: "Succès",
          description: t("success.requestCreated"),
        });
        if (onSuccess) {
          onSuccess(result.request);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error || t("errors.createFailed"),
        });
      }
    } catch (error) {
      console.error("Error creating refund request:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: t("errors.createFailed"),
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyCode = () => {
    if (createdRequest?.reference_code) {
      navigator.clipboard.writeText(createdRequest.reference_code);
      setCodeCopied(true);
      toast({
        variant: "success",
        title: "Succès",
        description: t("codeCopied"),
      });
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setSelectedAmount(null);
    setCustomAmount("");
    setCreatedRequest(null);
    setCodeCopied(false);
    setAmountError(null);
    form.reset();
    onClose();
  };

  const currentAmount = selectedAmount || parseFloat(customAmount) || 0;
  const isAmountValid =
    currentAmount > 0 &&
    (walletBalance === null || currentAmount <= walletBalance);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[var(--color-text-primary)]">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="text-[var(--color-text-secondary)]">
                {t("description")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!createdRequest ? (
          <div className="space-y-6 mt-4">
            {/* Wallet Balance */}
            {walletBalance !== null && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-[var(--color-text-secondary)] mb-1">
                  {t("availableBalance")}
                </div>
                <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {walletBalance.toFixed(2)} MAD
                </div>
              </div>
            )}

            {/* Preset Amounts */}
            <div>
              <Label className="text-sm font-medium text-[var(--color-text-primary)] mb-3 block">
                {t("selectAmount")}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={
                      selectedAmount === amount ? "default" : "outline"
                    }
                    onClick={() => handleAmountSelect(amount)}
                    disabled={
                      isCreating ||
                      (walletBalance !== null && amount > walletBalance)
                    }
                    className="h-12"
                  >
                    {amount} MAD
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <Label
                htmlFor="customAmount"
                className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block"
              >
                {t("customAmount")}
              </Label>
              <Input
                id="customAmount"
                type="number"
                placeholder={t("enterAmount")}
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                disabled={isCreating}
                min="1"
                max={walletBalance || undefined}
                className={cn(
                  "h-12",
                  amountError ? "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50" : ""
                )}
                aria-invalid={!!amountError}
              />
              {amountError && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {amountError}
                </p>
              )}
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateRequest}
              disabled={!isAmountValid || isCreating}
              className="w-full h-12 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("createRequest")}...
                </>
              ) : (
                t("createRequest")
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Success Message */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="text-green-800 dark:text-green-400 font-medium mb-2">
                {t("referenceCodeGenerated")}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                {t("instructionsText")}
              </div>
            </div>

            {/* Reference Code */}
            <div>
              <Label className="text-sm font-medium text-[var(--color-text-primary)] mb-2 block">
                {t("referenceCode")}
              </Label>
              <div className="flex gap-2">
                <Input
                  value={createdRequest.reference_code}
                  readOnly
                  className="h-12 font-mono text-lg font-bold"
                />
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  className="h-12 px-4"
                >
                  {codeCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Amount Info */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {t("amount")}
                </span>
                <span className="text-xl font-bold text-[var(--color-text-primary)]">
                  {createdRequest.amount} MAD
                </span>
              </div>
            </div>

            {/* Close Button */}
            <Button
              onClick={handleClose}
              className="w-full h-12"
              variant="outline"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
