import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      <DialogContent className="sm:max-w-md overflow-hidden">
        <AnimatePresence>
          {isOpen && (
            <>
              <DialogHeader>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="mx-auto"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </motion.div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <DialogTitle className="text-center text-xl font-semibold">
                    Payment Successful!
                  </DialogTitle>
                  <DialogDescription className="text-center mt-2">
                    Thank you for your purchase! You now have unlimited access to our AI assistant for this session.
                    Make the most of your access to get detailed insights about your home affordability calculation.
                  </DialogDescription>
                </motion.div>
              </DialogHeader>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="flex justify-center"
              >
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:scale-105 transition-transform duration-200"
                >
                  Start Asking Questions
                </Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
