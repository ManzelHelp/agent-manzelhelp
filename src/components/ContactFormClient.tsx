"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2 } from "lucide-react";
import { submitContactMessage } from "@/actions/contact";
import { useUserStore } from "@/stores/userStore";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

const initialFormData: ContactFormData = {
  firstName: "",
  lastName: "",
  email: "",
  subject: "",
  message: "",
};

interface ContactFormClientProps {
  onSuccess?: () => void;
}

export function ContactFormClient({ onSuccess }: ContactFormClientProps = {} as ContactFormClientProps) {
  const t = useTranslations("contact.form");
  const { user } = useUserStore();
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  // Pré-remplir les champs si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("errors.firstNameRequired");
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t("errors.lastNameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("errors.emailRequired");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t("errors.emailInvalid");
      }
    }

    if (!formData.subject) {
      newErrors.subject = t("errors.subjectRequired");
    }

    if (!formData.message.trim()) {
      newErrors.message = t("errors.messageRequired");
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t("errors.messageTooShort");
    } else if (formData.message.trim().length > 5000) {
      newErrors.message = t("errors.messageTooLong");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitContactMessage({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim(),
          subject: formData.subject,
          message: formData.message.trim(),
        });

        if (result.success) {
          toast.success(t("success.title"), {
            description: t("success.description"),
          });
          // Reset form
          if (user) {
            setFormData({
              firstName: user.first_name || "",
              lastName: user.last_name || "",
              email: user.email || "",
              subject: "",
              message: "",
            });
          } else {
            setFormData(initialFormData);
          }
          setErrors({});
          // Appeler onSuccess si fourni
          if (onSuccess) {
            onSuccess();
          }
        } else {
          toast.error(result.errorMessage || t("errors.submitFailed"));
        }
      } catch (error) {
        console.error("Error submitting contact form:", error);
        toast.error(t("errors.submitFailed"));
      }
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full ${
              errors.firstName ? "border-red-500" : ""
            }`}
            disabled={isPending}
            required
          />
          {errors.firstName && (
            <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
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
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full ${
              errors.lastName ? "border-red-500" : ""
            }`}
            disabled={isPending}
            required
          />
          {errors.lastName && (
            <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
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
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full ${errors.email ? "border-red-500" : ""}`}
          disabled={isPending}
          required
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="subject" className="block text-sm font-medium mb-2">
          {t("fields.subject")}
        </Label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={`w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
            errors.subject ? "border-red-500" : ""
          }`}
          disabled={isPending}
          required
        >
          <option value="">{t("fields.subjectPlaceholder")}</option>
          <option value="general">{t("subjects.general")}</option>
          <option value="support">{t("subjects.support")}</option>
          <option value="billing">{t("subjects.billing")}</option>
          <option value="feedback">{t("subjects.feedback")}</option>
          <option value="partnership">{t("subjects.partnership")}</option>
        </select>
        {errors.subject && (
          <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
        )}
      </div>

      <div>
        <Label htmlFor="message" className="block text-sm font-medium mb-2">
          {t("fields.message")}
        </Label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className={`w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
            errors.message ? "border-red-500" : ""
          }`}
          placeholder={t("fields.messagePlaceholder")}
          disabled={isPending}
          required
        />
        {errors.message && (
          <p className="text-sm text-red-500 mt-1">{errors.message}</p>
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

