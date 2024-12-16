import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageCircle, LightbulbIcon, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { loadStripe } from "@/lib/stripeClient";
import type { CalculatorResults } from "@/lib/calculatorTypes";

interface AiChatProps {
  calculatorData: CalculatorResults;
}

const EXAMPLE_QUESTIONS = [
  "What's a good down payment amount for this house price?",
  "How does my mortgage payment compare to recommended guidelines?",
  "What are the pros and cons of this budget allocation?",
  "Should I consider a shorter loan term?"
];

export function AiChat({ calculatorData }: AiChatProps) {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  // Check URL params for successful payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutSessionId = params.get('session_id');
    
    if (checkoutSessionId) {
      setIsPaid(true);
      // Remove the session_id from URL without refreshing
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSubmit = async () => {
    if (message.length > 3000) {
      toast({
        title: "Message too long",
        description: "Please keep your input under 3000 characters so you don't bankrupt us.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      // Add session ID if we have one
      if (sessionId) {
        headers["X-Session-Id"] = sessionId;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message,
          calculatorData,
          isPaid
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to get response" }));
        throw new Error(errorData.message || "An unexpected error occurred");
      }
      
      // Get and store session ID from response headers
      const newSessionId = response.headers.get("X-Session-Id");
      if (newSessionId) {
        setSessionId(newSessionId);
      }
      
      const data = await response.json();
      setResponse(data.response);
      setHasAskedQuestion(true);
      setMessage("");
      setFeedbackGiven(false);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again. If the problem persists, the service might be temporarily unavailable.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      const stripe = await loadStripe();
      if (!stripe) {
        throw new Error("Payment system unavailable. Please try again later.");
      }

      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create checkout session");
      }

      const { sessionId } = await response.json();
      if (!sessionId) {
        throw new Error("Invalid checkout session");
      }

      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment System Error",
        description: error instanceof Error 
          ? error.message 
          : "Unable to process payment. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleFeedback = async (isHelpful: boolean) => {
    if (!response) return;
    
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(sessionId && { "X-Session-Id": sessionId })
        },
        body: JSON.stringify({ isHelpful, response })
      });
      setFeedbackGiven(true);
      toast({
        title: "Thank you for your feedback!",
        description: "Your input helps us improve our responses.",
      });
    } catch (error) {
      console.error('Feedback error:', error);
      toast({
        title: "Feedback Error",
        description: "Unable to save your feedback. Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-6 w-6" />
        <h2 className="text-2xl font-semibold">Ask AI Assistant</h2>
      </div>
      
      {!hasAskedQuestion && (
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <LightbulbIcon className="h-4 w-4" />
            <p className="font-medium">Example questions you can ask:</p>
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {EXAMPLE_QUESTIONS.map((q, i) => (
              <li 
                key={i} 
                className="cursor-pointer hover:text-foreground transition-colors flex items-center gap-2" 
                onClick={() => setMessage(q)}
              >
                <span>•</span>
                <span className="flex-1">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {response && (
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="whitespace-pre-wrap">{response}</p>
          </div>
          
          {!feedbackGiven && (
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-muted-foreground">Was this response helpful?</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleFeedback(true)}
                className="flex items-center gap-2"
              >
                <ThumbsUp className="h-4 w-4" /> Yes
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleFeedback(false)}
                className="flex items-center gap-2"
              >
                <ThumbsDown className="h-4 w-4" /> No
              </Button>
            </div>
          )}
        </div>
      )}

      {(!hasAskedQuestion || isPaid) && (
        <div className="space-y-4">
          <Textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your home affordability calculation..."
            className="min-h-[100px]"
            maxLength={3000}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {message.length}/3000 characters
            </span>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || message.trim().length === 0}
              className="bg-gradient-to-r from-primary to-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                'Ask Question'
              )}
            </Button>
          </div>
        </div>
      )}

      {hasAskedQuestion && !isPaid && (
        <div className="text-center space-y-4 bg-muted p-6 rounded-lg">
          <h3 className="font-semibold text-lg">Want More Insights?</h3>
          <p className="text-muted-foreground">
            You've used your free question! Continue the conversation with unlimited follow-up questions 
            to make the most informed decision about your home purchase.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={handlePayment} 
              className="w-full max-w-xs bg-gradient-to-r from-primary to-primary/90 hover:to-primary"
            >
              Unlock Unlimited Questions for $2.99
            </Button>
            <p className="text-xs text-muted-foreground">
              Secure payment powered by Stripe
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
