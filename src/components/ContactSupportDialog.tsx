"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { ContactFormClient } from "./ContactFormClient";
import { Mail } from "lucide-react";

interface ContactSupportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactSupportDialog({
  isOpen,
  onClose,
}: ContactSupportDialogProps) {
  const t = useTranslations("contact.form");

  const handleSuccess = () => {
    // Le formulaire gère déjà le succès avec toast
    // On peut fermer le dialog après un délai
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[var(--color-text-primary)]">
                Contact Support
              </DialogTitle>
              <DialogDescription className="text-[var(--color-text-secondary)]">
                Send us a message and we'll get back to you as soon as possible.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          <ContactFormClient onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

