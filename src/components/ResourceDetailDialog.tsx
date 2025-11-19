// src/components/ResourceDetailDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ResourceDetailDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | null;
  url: string;
}

export function ResourceDetailDialog({
  open,
  onClose,
  title,
  description,
  url,
}: ResourceDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-2">Resource Link:</p>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full">
              Go to Resource
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
