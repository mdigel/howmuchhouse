import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageCircle, LightbulbIcon, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { loadStripe } from "@/lib/stripeClient";
import { PaymentSuccessModal } from "@/components/ui/payment-success-modal";
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
  const [userInputs, setUserInputs] = useState<Record<string, any> | null>(null); // Added state for user inputs
  const [calculationComplete, setCalculationComplete] = useState(false); // Added state for calculation completion

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Check URL params for successful payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get('success') === 'true';
    const sessionId = params.get('session_id');
    
    if (isSuccess && sessionId) {
      setIsPaid(true);
      setShowSuccessModal(true);
      
      // Restore all state after successful payment
      const savedState = localStorage.getItem('calculatorState');
      if (savedState) {
        try {
          const { calculator, chat, userInputs } = JSON.parse(savedState);
          
          // Update calculator data in parent component
          if (calculator) {
            Object.assign(calculatorData, calculator);
          }
          
          // Restore chat state
          if (chat) {
            setMessage(chat.message || '');
            setResponse(chat.response);
            setHasAskedQuestion(chat.hasAsked);
            sessionStorage.setItem('chatHistory', JSON.stringify({
              firstQuestion: chat.message,
              firstResponse: chat.response
            }));
          }
          
          // Store user inputs in session storage for persistence
          if (userInputs) {
            sessionStorage.setItem('userInputs', JSON.stringify(userInputs));
            sessionStorage.setItem('calculationComplete', 'true');
          }
          
          // Clean up localStorage state since we've moved it to sessionStorage
          localStorage.removeItem('calculatorState');
        } catch (error) {
          console.error('Failed to restore application state:', error);
        }
      }
    }
  }, []);

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

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
      setIsLoading(true);
      
      // Save all necessary state before initiating checkout
      if (calculatorData) {
        // Get form inputs from session storage if they exist
        const userInputs = sessionStorage.getItem('userInputs') 
          ? JSON.parse(sessionStorage.getItem('userInputs')!)
          : null;

        localStorage.setItem('calculatorState', JSON.stringify({
          calculator: calculatorData,
          chat: {
            message,
            response,
            hasAsked: hasAskedQuestion
          },
          userInputs: userInputs
        }));

        // Save initial chat interaction to session storage
        if (message && response) {
          sessionStorage.setItem('chatHistory', JSON.stringify({
            firstQuestion: message,
            firstResponse: response
          }));
        }
      }
      
      const checkoutResponse = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        throw new Error(errorData.message || "Failed to create checkout session");
      }

      const data = await checkoutResponse.json();
      if (!data.url) {
        throw new Error("Checkout URL not received");
      }

      // Navigate to Stripe checkout
      window.location.assign(data.url);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to start checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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

      <AnimatePresence>
        {hasAskedQuestion && !isPaid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-4 bg-muted p-6 rounded-lg"
          >
            <motion.h3
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="font-semibold text-lg"
            >
              Want More Insights?
            </motion.h3>
            <p className="text-muted-foreground">
              You've used your free question! Continue the conversation with unlimited follow-up questions 
              to make the most informed decision about your home purchase.
            </p>
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-xs mx-auto"
              >
                <Button 
                  onClick={handlePayment} 
                  disabled={isLoading}
                  className={`
                    w-full bg-gradient-to-r from-primary to-primary/90 
                    hover:to-primary hover:scale-105 transition-all duration-200
                    ${isLoading ? 'animate-pulse' : ''}
                  `}
                >
                  {isLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      Unlock Unlimited Questions for $2.99
                    </motion.span>
                  )}
                </Button>
              </motion.div>
              <p className="text-xs text-muted-foreground">
                Secure payment powered by Stripe
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <PaymentSuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleSuccessModalClose} 
      />
    </Card>
  );
}