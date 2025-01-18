import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Success() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Store paid status in sessionStorage
    sessionStorage.setItem("isPaidUser", "true");
    
    // Show success toast
    toast({
      title: "Payment Successful!",
      description: "Thank you for your purchase. You can now continue asking questions.",
    });

    // Redirect to home after a short delay
    const timer = setTimeout(() => {
      setLocation("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Payment Successful!</h1>
        <p className="text-muted-foreground">Redirecting you back to continue your conversation...</p>
      </div>
    </div>
  );
}
