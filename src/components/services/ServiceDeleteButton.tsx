"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteTaskerService } from "@/actions/services";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ServiceDeleteButton({ serviceId, taskerId }: any) {
  const { toast } = useToast();
  const t = useTranslations("toasts");
  const tCommon = useTranslations("common");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteTaskerService(serviceId, taskerId);
      if (result.success) {
        toast({ 
          variant: "success", 
          title: t("deleted"), 
          description: t("serviceRemoved") 
        });
        setShowConfirmDialog(false);
      } else {
        toast({ 
          variant: "destructive", 
          title: t("error"),
          description: result.error 
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirmDialog(true)} className="p-2 bg-red-500 text-white rounded-lg"><Trash2 className="h-4 w-4" /></button>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{tCommon("delete")} ?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? tCommon("saving") : tCommon("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}