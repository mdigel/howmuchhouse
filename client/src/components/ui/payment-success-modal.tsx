import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentSuccessModal({ isOpen, onClose }: PaymentSuccessModalProps) {
  useEffect(() => {
    // Remove URL parameters when modal is opened
    if (isOpen) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            Payment Successful!
          </DialogTitle>
          <DialogDescription className="text-center">
            Thank you for your purchase! You now have unlimited access to our AI assistant.
            Feel free to ask as many questions as you'd like about your home affordability calculation.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
          <Button onClick={onClose} className="bg-gradient-to-r from-primary to-primary/90">
            Start Asking Questions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
