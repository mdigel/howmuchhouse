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
  "I want a house around my 'Max House Price', why is this a bad idea?",
  "Create a detailed monthly budget for the save 15% scenario.",
  "How did you calculate my property taxes?",
  "How do I know what my homeowners insurance will actually be?",
  "Should I consider a shorter loan term?",
];

const FREE_QUESTIONS = 1;
const PAID_QUESTIONS = 5;

export function AiChat({ calculatorData }: AiChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const { toast } = useToast();
  const [userInputs, setUserInputs] = useState<Record<string, any> | null>(
    null,
  );
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Check URL params for successful payment
  useEffect(() => {
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
            console.log("Restoring chat state:", chat);
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
            console.log("Restoring calculator data");
            Object.assign(calculatorData, calculator);
          }

          // Finally restore user inputs and trigger calculation
          if (userInputs) {
            console.log("Restoring user inputs:", userInputs);
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
  }, [calculatorData, toast]);

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleSubmit = async () => {
    if (message.length > 3000) {
      toast({
        title: "Message too long",
        description:
          "Please keep your input under 3000 characters so you don't bankrupt us.",
        variant: "destructive",
      });
      return;
    }

    const maxQuestions = isPaid ? PAID_QUESTIONS : FREE_QUESTIONS;
    if (questionsAsked >= maxQuestions) {
      toast({
        title: "Question limit reached",
        description: isPaid
          ? "You've used all 5 questions in this session. To continue asking questions, you'll need to make another payment."
          : "You've used your free question. To continue asking questions, please make a payment.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (sessionId) {
        headers["X-Session-Id"] = sessionId;
      }

      // Add user message to chat and clear input
      const userMessage: Message = {
        role: "user",
        content: message,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setMessage(""); // Clear input immediately

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
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to get response" }));
        throw new Error(errorData.message || "An unexpected error occurred");
      }

      const newSessionId = response.headers.get("X-Session-Id");
      if (newSessionId) {
        setSessionId(newSessionId);
      }

      const data = await response.json();

      // Add assistant message to chat
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      setHasAskedQuestion(true);
      setMessage("");
      setFeedbackGiven(false);

      if (isPaid) {
        setQuestionsAsked((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Something went wrong",
        description:
          error instanceof Error
            ? error.message
            : "Please try again. If the problem persists, the service might be temporarily unavailable.",
        variant: "destructive",
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
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">Follow Up Questions? Ask Homi.</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Homi is an Ai Advisor that analyzes your inputs and leverages insights from trusted sources across the internet to deliver personalized answers tailored to your unique financial situation.
        </p>
        <div className="flex items-center justify-center gap-12 py-4">
          <div className="flex flex-col items-center">
            <img src="/assets/Reddit.png" alt="r/personal-finance" className="h-12 object-contain" />
            <div className="text-xs text-muted-foreground mt-1">
              <p>r/personal-finance</p>
              <p>r/FirstTimeHomeBuyer</p>
            </div>
          </div>
          <img src="/assets/Nerdwallet.png" alt="Nerdwallet" className="h-16 object-contain" />
          <img src="/assets/moneyunder30.png" alt="Money Under 30" className="h-12 object-contain" />
        </div>
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
                className="cursor-pointer hover:text-foreground transition-colors flex items-start gap-2"
                onClick={() => setMessage(q)}
              >
                <span className="leading-6">•</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
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

          {isPaid && questionsAsked < PAID_QUESTIONS && (
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
                    "Ask Question"
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Questions Remaining: {PAID_QUESTIONS - questionsAsked}
              </p>
            </div>
          )}
        </div>
      )}

      {!hasAskedQuestion && (
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
              disabled={
                isLoading ||
                message.trim().length === 0 ||
                questionsAsked >= FREE_QUESTIONS
              }
              className="bg-gradient-to-r from-primary to-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                "Ask Question"
              )}
            </Button>
          </div>
          {questionsAsked < FREE_QUESTIONS && (
            <p className="text-sm text-muted-foreground">
              Questions Remaining: {FREE_QUESTIONS - questionsAsked}
            </p>
          )}
        </div>
      )}
      {isPaid && questionsAsked >= PAID_QUESTIONS && (
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
        {hasAskedQuestion && !isPaid && (
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
        )}
      </AnimatePresence>
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
      />
    </Card>
  );
}