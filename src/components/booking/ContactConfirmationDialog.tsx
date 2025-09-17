"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MessageSquare, User, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createConversationAction } from "@/actions/messages";

interface ContactConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (conversationId: string) => void;
  serviceData: {
    id: string;
    title: string;
    tasker: {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
  };
}

interface ContactFormData {
  initial_message: string;
}

const initialFormData: ContactFormData = {
  initial_message: "",
};

export function ContactConfirmationDialog({
  isOpen,
  onClose,
  onSuccess,
  serviceData,
}: ContactConfirmationDialogProps) {
  const t = useTranslations("taskerOffer.contactDialog");
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.initial_message.trim()) {
      newErrors.initial_message = t("errors.enterMessage");
    }

    if (formData.initial_message.trim().length < 10) {
      newErrors.initial_message = t("errors.messageTooShort");
    }

    if (formData.initial_message.trim().length > 500) {
      newErrors.initial_message = t("errors.messageTooLong");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await createConversationAction(
        serviceData.tasker.id,
        undefined, // jobId
        serviceData.id, // serviceId
        undefined, // bookingId
        formData.initial_message.trim() // initialMessage
      );

      if (result.conversation) {
        toast.success(t("toasts.conversationStartedSuccess"));
        onSuccess(result.conversation.id);
        onClose();
      } else {
        toast.error(
          result.errorMessage || t("toasts.failedToStartConversation")
        );
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error(t("toasts.failedToStartConversation"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                {t("description", {
                  taskerName: serviceData.tasker.first_name,
                })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service & Tasker Info */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {t("serviceDetails")}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("service")}
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {serviceData.title}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("tasker")}
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {serviceData.tasker.first_name} {serviceData.tasker.last_name}
                </p>
              </div>
            </div>
          </div>

          {/* Initial Message */}
          <div className="space-y-3">
            <Label
              htmlFor="initial_message"
              className="text-base font-semibold text-slate-900 dark:text-white"
            >
              {t("yourMessage")}
            </Label>
            <div className="space-y-2">
              <textarea
                id="initial_message"
                value={formData.initial_message}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    initial_message: e.target.value,
                  }))
                }
                placeholder={t("messagePlaceholder")}
                className={`w-full min-h-[120px] p-4 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.initial_message
                    ? "border-red-500"
                    : "border-slate-200 dark:border-slate-600"
                }`}
              />
              <div className="flex justify-between items-center">
                <div>
                  {errors.initial_message && (
                    <p className="text-sm text-red-500">
                      {errors.initial_message}
                    </p>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("charactersCount", {
                    count: formData.initial_message.length,
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  {t("tipsTitle")}
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• {t("tips.tip1")}</li>
                  <li>• {t("tips.tip3")}</li>
                  <li>• {t("tips.tip4")}</li>
                  <li>
                    • <strong>Warning:</strong> {t("tips.warning")}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("startingConversation")}
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                {t("sendMessage")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
