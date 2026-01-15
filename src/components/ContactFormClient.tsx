"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2 } from "lucide-react";
import { submitContactMessage } from "@/actions/contact";
import { useUserStore } from "@/stores/userStore";
import { contactFormSchema, type ContactFormData } from "@/lib/schemas/contact";
import { cn } from "@/lib/utils";

interface ContactFormClientProps {
  onSuccess?: () => void;
}

export function ContactFormClient({ onSuccess }: ContactFormClientProps = {} as ContactFormClientProps) {
  const t = useTranslations("contact.form");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const { user } = useUserStore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  // Pré-remplir les champs si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        subject: "",
        message: "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ContactFormData) => {
    startTransition(async () => {
      try {
        const result = await submitContactMessage({
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          email: data.email.trim(),
          subject: data.subject,
          message: data.message.trim(),
        });

        if (result.success) {
          toast({
            variant: "success",
            title: t("success.title"),
            description: t("success.description"),
          });
          // Reset form
          if (user) {
            reset({
              firstName: user.first_name || "",
              lastName: user.last_name || "",
              email: user.email || "",
              subject: "",
              message: "",
            });
          } else {
            reset({
              firstName: "",
              lastName: "",
              email: "",
              subject: "",
              message: "",
            });
          }
          // Appeler onSuccess si fourni
          if (onSuccess) {
            onSuccess();
          }
        } else {
          const errorMessage = result.errorMessage;
          toast({
            variant: "destructive",
            title: tCommon("error"),
            description: errorMessage?.startsWith("errors.") ? tErrors(errorMessage as any) : (errorMessage || t("errors.submitFailed")),
          });
        }
      } catch (error) {
        console.error("Error submitting contact form:", error);
        toast({
          variant: "destructive",
          title: tCommon("error"),
          description: t("errors.submitFailed"),
        });
      }
    });
  };

  const messageValue = watch("message");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="firstName"
            className="block text-sm font-medium mb-2"
          >
            {t("fields.firstName")}
          </Label>
          <Input
            type="text"
            id="firstName"
            {...register("firstName")}
            placeholder={t("fields.firstName")}
            className={cn(
              "w-full",
              errors.firstName && "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
            )}
            disabled={isPending}
          />
          {errors.firstName && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <Label
            htmlFor="lastName"
            className="block text-sm font-medium mb-2"
          >
            {t("fields.lastName")}
          </Label>
          <Input
            type="text"
            id="lastName"
            {...register("lastName")}
            placeholder={t("fields.lastName")}
            className={cn(
              "w-full",
              errors.lastName && "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
            )}
            disabled={isPending}
          />
          {errors.lastName && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="block text-sm font-medium mb-2">
          {t("fields.email")}
        </Label>
        <Input
          type="email"
          id="email"
          {...register("email")}
          placeholder={t("fields.email")}
          className={cn(
            "w-full",
            errors.email && "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
          )}
          disabled={isPending}
        />
        {errors.email && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="subject" className="block text-sm font-medium mb-2">
          {t("fields.subject")}
        </Label>
        <select
          id="subject"
          {...register("subject")}
          className={cn(
            "w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
            errors.subject && "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
          )}
          disabled={isPending}
        >
          <option value="">{t("fields.subjectPlaceholder")}</option>
          <option value="general">{t("subjects.general")}</option>
          <option value="support">{t("subjects.support")}</option>
          <option value="billing">{t("subjects.billing")}</option>
          <option value="feedback">{t("subjects.feedback")}</option>
          <option value="partnership">{t("subjects.partnership")}</option>
        </select>
        {errors.subject && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.subject.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="message" className="block text-sm font-medium mb-2">
          {t("fields.message")}
        </Label>
        <textarea
          id="message"
          rows={5}
          {...register("message")}
          className={cn(
            "w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
            errors.message && "!border-red-500 !border-2 focus-visible:!border-red-500 focus-visible:!ring-red-500/50"
          )}
          placeholder={t("fields.messagePlaceholder")}
          disabled={isPending}
        />
        {errors.message && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.message.message}
          </p>
        )}
        {!errors.message && messageValue && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {messageValue.length} / 5000 {t("fields.characters")}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("submitting")}
          </>
        ) : (
          t("submit")
        )}
      </Button>
    </form>
  );
}

