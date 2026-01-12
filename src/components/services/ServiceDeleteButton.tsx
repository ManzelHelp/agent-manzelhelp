"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteTaskerService } from "@/actions/services";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ServiceDeleteButton({ serviceId, taskerId }: any) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteTaskerService(serviceId, taskerId);
      if (result.success) {
        toast({ variant: "success", title: "Supprimé", description: "Le service a été retiré avec succès." });
        setShowConfirmDialog(false);
      } else {
        toast({ variant: "destructive", description: result.error });
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
          <DialogHeader><DialogTitle>Supprimer ce service ?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Suppression..." : "Confirmer la suppression"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}