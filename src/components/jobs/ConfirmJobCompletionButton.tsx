"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { confirmJobCompletion } from "@/actions/jobs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ConfirmJobCompletionButtonProps {
  jobId: string;
  completedAt: string | null;
}

export default function ConfirmJobCompletionButton({
  jobId,
  completedAt,
}: ConfirmJobCompletionButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    if (!completedAt) return;

    setIsConfirming(true);
    try {
      const result = await confirmJobCompletion(jobId);
      if (result.success) {
        toast.success("Job completion confirmed successfully!");
        // Refresh the page to show updated status
        router.refresh();
      } else {
        toast.error(result.error || "Failed to confirm job completion");
      }
    } catch (err) {
      console.error("Error confirming job:", err);
      toast.error("Failed to confirm job completion");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Button
      onClick={handleConfirm}
      disabled={isConfirming}
      className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm"
      size="sm"
    >
      {isConfirming ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Confirming...
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Confirm Completion
        </>
      )}
    </Button>
  );
}

