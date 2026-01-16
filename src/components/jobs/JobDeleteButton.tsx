"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteJob } from "@/actions/jobs";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface JobDeleteButtonProps {
  jobId: string;
  customerId: string;
  jobTitle?: string;
}

export default function JobDeleteButton({
  jobId,
  customerId,
  jobTitle,
}: JobDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("jobDetails");
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteJob(jobId, customerId);

      if (result.success) {
        setIsDialogOpen(false);
        toast({
          variant: "success",
          description: t("success.jobDeleted"),
        });
        router.refresh();
      } else {
        console.error("Failed to delete job:", result.error);
        toast({
          variant: "destructive",
          description: result.error || t("deleteDialog.error"),
        });
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        variant: "destructive",
        description: t("deleteDialog.error"),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white transition-all duration-200 min-h-[44px] min-w-[44px] p-2"
          title={t("jobCard.deleteJobBtn")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[var(--color-text-primary)]">
            {t("deleteDialog.title")}
          </DialogTitle>
          <DialogDescription className="text-[var(--color-text-secondary)]">
            {t("deleteDialog.description", { title: jobTitle || t("thisJob") })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isDeleting}
            className="border-[var(--color-border)]"
          >
            {t("deleteDialog.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-[var(--color-error)] hover:bg-[var(--color-error-dark)] text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("deleteDialog.deleting")}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {t("deleteDialog.delete")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
