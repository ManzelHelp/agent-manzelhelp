"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteTaskerService } from "@/actions/services";
import { toast } from "sonner";

interface ServiceDeleteButtonProps {
  serviceId: string;
  taskerId: string;
  onDeleted?: () => void;
}

export function ServiceDeleteButton({
  serviceId,
  taskerId,
  onDeleted,
}: ServiceDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteTaskerService(serviceId, taskerId);

      if (result.success) {
        toast.success("Service deleted successfully");
        onDeleted?.();
      } else {
        toast.error(result.error || "Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={`p-2 rounded-lg border transition-all ${
          showConfirm
            ? "border-red-600 bg-red-600 text-white"
            : "border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white"
        } ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
        title={
          showConfirm ? "Click again to confirm deletion" : "Delete service"
        }
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {showConfirm && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
          Click again to confirm
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}
