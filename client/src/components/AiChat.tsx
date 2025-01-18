import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  MessageCircle,
  LightbulbIcon,
  Loader2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { loadStripe } from "@/lib/stripeClient";
import { PaymentSuccessModal } from "@/components/ui/payment-success-modal";
import type { CalculatorResults } from "@/lib/calculatorTypes";
import { ErrorBoundary } from "./ErrorBoundary";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  feedback?: boolean;
}

interface AiChatProps {
  calculatorData: CalculatorResults;
}

const EXAMPLE_QUESTIONS = [
  "What I want to spend my 'Max House Price'?",
  "Create a detailed monthly budget for the save 15% scenario.",
  "How did you calculate my property taxes?",
];

const FREE_QUESTIONS = 1;
const PAID_QUESTIONS = 5;

// Browser compatibility check
const isBrowserCompatible = () => {
  try {
    // Check for necessary browser features
    const features = [
      typeof window !== 'undefined',
      typeof fetch === 'function',
      typeof Promise === 'function',
      typeof WebSocket === 'function',
      'CSS' in window && 'supports' in CSS,
    ];
    return features.every(Boolean);
  } catch (e) {
    console.warn('Browser compatibility check failed:', e);
    return false;
  }
};

export function AiChatWithErrorBoundary(props: AiChatProps) {
  return (
    <ErrorBoundary>
      <AiChat {...props} />
    </ErrorBoundary>
  );
}

interface AiChatProps {
  calculatorData: CalculatorResults;
}

// Using AI_CHARGE_MODE from server config via environment
const AI_CHARGE_MODE = import.meta.env.VITE_AI_CHARGE_MODE === "true";

export function AiChat({ calculatorData }: AiChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      // First check localStorage for pending chat state
      const savedState = localStorage.getItem("calculatorState");
      if (savedState) {
        const { chat } = JSON.parse(savedState);
        if (chat?.messages?.length > 0) {
          return chat.messages;
        }
      }

      // Fallback to sessionStorage
      const chatHistory = sessionStorage.getItem("chatHistory");
      if (chatHistory) {
        const { messages: savedMessages } = JSON.parse(chatHistory);
        return savedMessages;
      }
    } catch (error) {
      console.error("Error restoring chat history:", error);
    }
    return [];
  });
  const [hasAskedQuestion, setHasAskedQuestion] = useState(() => {
    const stored = localStorage.getItem("hasAskedFirstQuestion");
    return stored === "true";
  });
  const [isPaid, setIsPaid] = useState(false);
  const isEffectivelyPaid = !AI_CHARGE_MODE || isPaid; // Always treat as paid if charge mode is off
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [isCompatible, setIsCompatible] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { toast } = useToast();

  // Check browser compatibility on mount
  useEffect(() => {
    const compatible = isBrowserCompatible();
    setIsCompatible(compatible);

    if (!compatible) {
      toast({
        title: "Browser Compatibility Notice",
        description: "Some features might not work correctly in your browser. For the best experience, please use Chrome, Firefox, or Safari.",
        variant: "warning",
      });
    }
  }, [toast]);

  // Check URL params for successful payment
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const isSuccess = params.get("success") === "true";
      const sessionId = params.get("session_id");

      if (isSuccess && sessionId) {
        console.log("Payment successful, attempting to restore state");
        setIsPaid(true);
        setShowSuccessModal(true);

        // Restore all state after successful payment
        const savedState = localStorage.getItem("calculatorState");
        console.log("Retrieved saved state:", savedState);

        if (savedState) {
          try {
            const { calculator, chat, userInputs } = JSON.parse(savedState);
            console.log("Parsed state:", { calculator, chat, userInputs });

            // First restore chat state
            if (chat) {
              if (chat.message) setMessage(chat.message);
              if (chat.messages) setMessages(chat.messages);
              setHasAskedQuestion(true);

              // Save chat history
              sessionStorage.setItem(
                "chatHistory",
                JSON.stringify({
                  messages: chat.messages,
                }),
              );
            }

            // Then restore calculator data
            if (calculator) {
              Object.assign(calculatorData, calculator);
            }

            // Finally restore user inputs and trigger calculation
            if (userInputs) {
              sessionStorage.setItem("userInputs", JSON.stringify(userInputs));

              // Dispatch event to restore form inputs
              const restoreEvent = new CustomEvent("restoreUserInputs", {
                detail: { inputs: userInputs },
              });
              window.dispatchEvent(restoreEvent);
            }

            // Clean up localStorage after successful restoration
            localStorage.removeItem("calculatorState");
            console.log("State restoration complete");
          } catch (error) {
            console.error("Failed to restore application state:", error);
            toast({
              title: "State Restoration Error",
              description:
                "There was an issue restoring your previous session. Please try refreshing the page.",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error in payment success handler:", error);
    }
  }, [calculatorData, toast]);

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleSubmit = async () => {
    if (!calculatorData) {
      toast({
        title: "Missing Data",
        description: "Please complete the calculator form first.",
        variant: "destructive",
      });
      return;
    }

    if (!isCompatible) {
      toast({
        title: "Browser Compatibility Issue",
        description: "Please use a different browser for full functionality.",
        variant: "warning",
      });
      return;
    }

    if (message.length > 3000) {
      toast({
        title: "Message too long",
        description: "Please keep your input under 3000 characters.",
        variant: "destructive",
      });
      return;
    }

    const maxQuestions = isPaid ? PAID_QUESTIONS : FREE_QUESTIONS;
    if (questionsAsked >= maxQuestions) {
      toast({
        title: "Question limit reached",
        description: isPaid
          ? "You've used all 5 questions in this session."
          : "You've used your free question.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Add user message to chat and clear input
      const userMessage: Message = {
        role: "user",
        content: message,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setMessage(""); // Clear input immediately

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (sessionId) {
        headers["X-Session-Id"] = sessionId;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message,
          calculatorData,
          isPaid,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to get response: ${response.status} ${response.statusText}`,
        );
      }

      const newSessionId = response.headers.get("X-Session-Id");
      if (newSessionId) {
        setSessionId(newSessionId);
      }

      const data = await response.json();

      if (!data || !data.response) {
        throw new Error("Invalid response from server");
      }

      // Add assistant message to chat
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      const firstQuestion = !hasAskedQuestion;
      setHasAskedQuestion(true);
      if (firstQuestion) {
        localStorage.setItem("hasAskedFirstQuestion", "true");
      }
      setFeedbackGiven(false);

      if (isPaid) {
        setQuestionsAsked((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });

      // Restore the message if it failed
      setMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      // Save all necessary state before initiating checkout
      if (calculatorData) {
        // Get current form inputs and calculation state
        const savedInputs = sessionStorage.getItem("userInputs");
        const currentInputs = savedInputs ? JSON.parse(savedInputs) : null;

        console.log("Saving state before payment:", {
          calculatorData,
          message,
          messages,
          currentInputs,
        });

        // Save complete state to localStorage
        const stateToSave = {
          calculator: calculatorData,
          chat: {
            message,
            messages,
            hasAsked: true,
          },
          userInputs: currentInputs,
        };

        localStorage.setItem("calculatorState", JSON.stringify(stateToSave));
        console.log("Saved state to localStorage:", stateToSave);

        // Save initial chat interaction to session storage for backup
        if (message && messages.length > 0) {
          const chatHistory = {
            firstQuestion: message,
            messages: messages,
          };
          sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
          console.log("Saved chat history to sessionStorage:", chatHistory);
        }
      }

      const checkoutResponse = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        throw new Error(
          errorData.message || "Failed to create checkout session",
        );
      }

      const data = await checkoutResponse.json();
      if (!data.url) {
        throw new Error("Checkout URL not received");
      }

      // Navigate to Stripe checkout
      window.location.assign(data.url);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (isHelpful: boolean) => {
    if (!messages || messages.length === 0) return;

    try {
      const lastMessage = messages[messages.length - 1];
      await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionId && { "X-Session-Id": sessionId }),
        },
        body: JSON.stringify({ isHelpful, response: lastMessage.content }),
      });
      setMessages(
        messages.map((msg) =>
          msg.role === "assistant" ? { ...msg, feedback: isHelpful } : msg,
        ),
      );
      setFeedbackGiven(true);
      toast({
        title: "Thank you for your feedback!",
        description: "Your input helps us improve our responses.",
      });
    } catch (error) {
      console.error("Feedback error:", error);
      toast({
        title: "Feedback Error",
        description: "Unable to save your feedback. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            <h2 className="text-lg md:text-2xl font-semibold">Follow Up Questions? Ask Homi.</h2>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          Homi is an Ai Advisor that analyzes your inputs and leverages trusted sources (r/FirstTimeBuyer, NerdWallet, MoneyUnder30) to deliver personalized answers tailored to your unique financial situation.
        </p>
      </div>

      {!messages.length && (
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <LightbulbIcon className="h-4 w-4" />
            <p className="font-medium">Example questions:</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {EXAMPLE_QUESTIONS.map((q, i) => (
              <div
                key={i}
                className="cursor-pointer bg-background hover:bg-accent transition-colors p-3 rounded-md flex items-start gap-2 border shadow-sm"
                onClick={() => setMessage(q)}
              >
                <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-sm flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">{q}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="space-y-4">
          <div
            className="max-h-[500px] overflow-y-auto mb-6"
            ref={(el) => {
              if (el) {
                el.scrollTop = el.scrollHeight;
              }
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={msg.timestamp}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-4`}
              >
                <div
                  className={`max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground ml-4"
                      : "bg-muted"
                  } p-4 rounded-lg`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {msg.role === "assistant" && !msg.feedback && (
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <span className="text-sm text-muted-foreground">
                        Was this response helpful?
                      </span>
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
              </div>
            ))}
          </div>
        </div>
      )}

      {(questionsAsked < FREE_QUESTIONS || (!AI_CHARGE_MODE || isPaid)) && !isLoading && (
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
              Ask Question
            </Button>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="flex justify-center py-4">
          <Button disabled className="bg-gradient-to-r from-primary to-primary/90">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Thinking...
          </Button>
        </div>
      )}
      {AI_CHARGE_MODE && isPaid && questionsAsked >= PAID_QUESTIONS && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-lg mb-4">
          <span className="text-sm text-muted-foreground">
            You've used all your questions
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePayment}
            className="ml-2"
          >
            Buy More Questions
          </Button>
        </div>
      )}

      <AnimatePresence>
        {AI_CHARGE_MODE && questionsAsked >= FREE_QUESTIONS && !isPaid && !isLoading ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-4 bg-muted p-6 rounded-lg my-6"
          >
            <motion.h3
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-lg"
            >
              Have More Questions?
            </motion.h3>
            <p className="text-muted-foreground">
              You've used up your free question to ChatGPT 4o OpenAI's top tier
              model. Continue the conversation with {PAID_QUESTIONS} follow-up
              questions to make the most informed decision about your home
              purchase.
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
                    ${isLoading ? "animate-pulse" : ""}
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
                      Unlock 5 Questions for $2.99
                    </motion.span>
                  )}
                </Button>
              </motion.div>
              <p className="text-xs text-muted-foreground">
                Secure payment powered by Stripe
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
      />
    </Card>
  );
}