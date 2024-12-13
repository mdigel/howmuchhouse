import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { loadStripe } from "@/lib/stripeClient";
import type { CalculatorResults } from "@/lib/calculatorTypes";

interface AiChatProps {
  calculatorData: CalculatorResults;
}

export function AiChat({ calculatorData }: AiChatProps) {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (message.length > 3000) {
      toast({
        title: "Message too long",
        description: "Please limit your question to 3000 characters",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          calculatorData,
          isPaid
        })
      });

      if (!response.ok) throw new Error("Failed to get response");
      
      const data = await response.json();
      setResponse(data.response);
      setHasAskedQuestion(true);
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive"
      });
    }
  };

  const handlePayment = async () => {
    try {
      const stripe = await loadStripe();
      if (!stripe) throw new Error("Stripe failed to load");

      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const { sessionId } = await response.json();
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to process payment",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Ask AI Assistant</h2>
      
      {response && (
        <div className="bg-muted p-4 rounded-lg">
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}

      {(!hasAskedQuestion || isPaid) && (
        <div className="space-y-4">
          <Textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your home affordability calculation..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmit}>
              Ask Question
            </Button>
          </div>
        </div>
      )}

      {hasAskedQuestion && !isPaid && (
        <div className="text-center space-y-4">
          <p>Continue the conversation for $2.99</p>
          <Button onClick={handlePayment}>
            Unlock Unlimited Questions
          </Button>
        </div>
      )}
    </Card>
  );
}
