"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteJob } from "@/actions/jobs";
import { useRouter } from "next/navigation";
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
  jobTitle = "this job",
}: JobDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteJob(jobId, customerId);

      if (result.success) {
        setIsDialogOpen(false);
        router.refresh();
      } else {
        console.error("Failed to delete job:", result.error);
        // You could add a toast notification here
        alert(result.error || "Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("An unexpected error occurred while deleting the job");
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
          title="Delete job"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[var(--color-text-primary)]">
            Delete Job Post
          </DialogTitle>
          <DialogDescription className="text-[var(--color-text-secondary)]">
            Are you sure you want to delete "{jobTitle}"? This action cannot be
            undone. If there are any applications or if a tasker has been
            assigned, you won't be able to delete this job.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isDeleting}
            className="border-[var(--color-border)]"
          >
            Cancel
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
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Job
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
