import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomButton } from "@/components/CustomButton";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirmDelete
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Menu Item</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this menu item? This action cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <Button variant="destructive" onClick={onConfirmDelete}>
            Delete
          </Button>
          <CustomButton onClick={onClose}>Cancel</CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;