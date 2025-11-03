import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Send,
  Sparkles,
} from "lucide-react";
import { loadStripe } from "@/lib/stripeClient";
import { PaymentSuccessModal } from "@/components/ui/payment-success-modal";
import type { CalculatorResults } from "@/lib/calculatorTypes";
import { ErrorBoundary } from "./ErrorBoundary";
import { CONFIG } from "../config";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  feedback?: boolean;
  isStreaming?: boolean;
}

interface AiChatProps {
  calculatorData: CalculatorResults;
}

const EXAMPLE_QUESTIONS = [
  "What if I want to spend my 'Max House Price'?",
  "Create a detailed monthly budget for the save 15% scenario. Include things like groceries and gym membership.",
  "How did you calculate my property taxes?",
];

const { FREE_QUESTIONS, PAID_QUESTIONS, AI_CHARGE_MODE } = CONFIG;

const isBrowserCompatible = () => {
  try {
    const features = [
      typeof window !== "undefined",
      typeof fetch === "function",
      typeof Promise === "function",
      typeof WebSocket === "function",
      "CSS" in window && "supports" in CSS,
    ];
    return features.every(Boolean);
  } catch (e) {
    console.warn("Browser compatibility check failed:", e);
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

export function AiChat({ calculatorData }: AiChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedState = localStorage.getItem("calculatorState");
      if (savedState) {
        const { chat } = JSON.parse(savedState);
        if (chat?.messages?.length > 0) {
          return chat.messages;
        }
      }

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
  const isEffectivelyPaid = !AI_CHARGE_MODE || isPaid;
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [isCompatible, setIsCompatible] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { toast } = useToast();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textBufferRef = useRef("");
  const animationFrameId = useRef<number | null>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [toast]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const isSuccess = params.get("success") === "true";
      const sessionId = params.get("session_id");

      if (isSuccess && sessionId) {
        setIsPaid(true);
        setShowSuccessModal(true);
        const savedState = localStorage.getItem("calculatorState");

        if (savedState) {
          const { calculator, chat, userInputs } = JSON.parse(savedState);
          if (chat) {
            if (chat.message) setMessage(chat.message);
            if (chat.messages) setMessages(chat.messages);
            setHasAskedQuestion(true);
            sessionStorage.setItem("chatHistory", JSON.stringify({ messages: chat.messages }));
          }
          if (calculator) {
            Object.assign(calculatorData, calculator);
          }
          if (userInputs) {
            sessionStorage.setItem("userInputs", JSON.stringify(userInputs));
            const restoreEvent = new CustomEvent("restoreUserInputs", {
              detail: { inputs: userInputs },
            });
            window.dispatchEvent(restoreEvent);
          }
          localStorage.removeItem("calculatorState");
        }
      }
    } catch (error) {
      console.error("Error in payment success handler:", error);
    }
  }, [calculatorData]);

  const startTypewriterEffect = (messageIndex: number) => {
    if (!textBufferRef.current) {
      console.error('No text buffer available');
      return;
    }

    const messageId = generateMessageId();
    const fullText = textBufferRef.current;
    let visibleText = "";

    // Create initial message with empty content
    setMessages(prev => [
      ...prev.slice(0, -1),
      { 
        id: messageId,
        role: 'assistant',
        content: "", // Start with empty content
        timestamp: Date.now(),
        isStreaming: true
      }
    ]);

    const CHARS_PER_FRAME = 8;
    const FRAME_DURATION = 1000 / 60;
    let lastRenderTime = 0;

    const updateMessageContent = (newContent: string) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, content: newContent } : msg
        )
      );
    };

    const renderFrame = (timestamp: number) => {
      if (!lastRenderTime) lastRenderTime = timestamp;

      const delta = timestamp - lastRenderTime;
      if (delta >= FRAME_DURATION) {
        if (visibleText.length < fullText.length) {
          visibleText = fullText.slice(0, visibleText.length + CHARS_PER_FRAME);
          updateMessageContent(visibleText);
          lastRenderTime = timestamp;
          animationFrameId.current = requestAnimationFrame(renderFrame);
        } else {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId ? { ...msg, isStreaming: false } : msg
            )
          );
          setIsLoading(false);
        }
      } else {
        animationFrameId.current = requestAnimationFrame(renderFrame);
      }
    };

      animationFrameId.current = requestAnimationFrame(renderFrame);
  };

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

    // For free users, limit to 1 question. For paid users, use PAID_QUESTIONS
    const maxQuestions = isPaid ? PAID_QUESTIONS : 1;
    if (questionsAsked >= maxQuestions) {
      toast({
        title: "Question limit reached",
        description: isPaid
          ? "You've used all 5 questions in this session."
          : "You've used your free question. Please upgrade to ask more.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userMessage: Message = {
        id: generateMessageId(),
        role: "user",
        content: message,
        timestamp: Date.now(),
      };

      const assistantMessage: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: "", // Start with empty content
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages(prev => {
        const newMessages = [...prev, userMessage, assistantMessage];
        scrollToBottom(); // Scroll immediately after updating messages
        return newMessages;
      });
      setMessage("");

      const messageIndex = messages.length -1;


      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (sessionId) {
        headers["X-Session-Id"] = sessionId;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          ...headers,
          "Accept": "text/event-stream",
        },
        body: JSON.stringify({
          message,
          calculatorData: {
            ...calculatorData,
            savingScenarios: calculatorData.savingScenarios.filter(
              (scenario) =>
                scenario.mortgagePaymentStats.purchasePrice <=
                calculatorData.maxHomePrice.mortgagePaymentStats.purchasePrice,
            ),
          },
          isPaid,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status} ${response.statusText}`);
      }

      const newSessionId = response.headers.get("X-Session-Id");
      if (newSessionId) {
        setSessionId(newSessionId);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body reader");

      const decoder = new TextDecoder();
      textBufferRef.current = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const { content } = JSON.parse(data);
              if (content) {
                textBufferRef.current += content;
              }
            } catch (e) {
              console.error("Error parsing streaming data:", e);
            }
          }
        }
      }

      startTypewriterEffect(messageIndex);

      const firstQuestion = !hasAskedQuestion;
      setHasAskedQuestion(true);
      if (firstQuestion) {
        localStorage.setItem("hasAskedFirstQuestion", "true");
      }
      setFeedbackGiven(false);
      setQuestionsAsked(prev => prev + 1);

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
      setMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      if (calculatorData) {
        const savedInputs = sessionStorage.getItem("userInputs");
        const currentInputs = savedInputs ? JSON.parse(savedInputs) : null;

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

        if (message && messages.length > 0) {
          const chatHistory = {
            firstQuestion: message,
            messages: messages,
          };
          sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
        }
      }

      const checkoutResponse = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        throw new Error(errorData.message || "Failed to create checkout session");
      }

      const data = await checkoutResponse.json();
      if (!data.url) {
        throw new Error("Checkout URL not received");
      }

      window.location.assign(data.url);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to start checkout. Please try again.",
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

      setMessages(messages.map((msg) =>
        msg.role === "assistant" ? { ...msg, feedback: isHelpful } : msg
      ));

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
    <div className="AiChat flex flex-col h-[70vh] max-h-[800px] min-h-[600px] md:h-[75vh] bg-white rounded-lg overflow-hidden border border-[#e5e5e6] shadow-2xl">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[#d1d1d2] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-white hover:[&::-webkit-scrollbar-thumb]:bg-[#b3b3b3]">
        {!messages.length ? (
          <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#f7f7f8] flex items-center justify-center border border-[#e5e5e6]">
                  <Sparkles className="h-8 w-8 text-[#10a37f]" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-[#2d2d2d] text-center mb-2">
                Follow Up Questions? Ask Homi.
              </h2>
              <p className="text-[#565869] text-sm text-center max-w-md mx-auto">
                Homi is an AI Advisor that analyzes your inputs and leverages trusted sources (r/FirstTimeBuyer, NerdWallet, MoneyUnder30) to deliver personalized answers tailored to your unique financial situation.
              </p>
            </div>
            <div className="w-full max-w-3xl space-y-3">
              <p className="text-[#565869] text-xs font-medium mb-2">Example questions:</p>
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(q)}
                  className="w-full text-left px-4 py-3 bg-white hover:bg-[#f7f7f8] text-[#2d2d2d] rounded-lg border border-[#e5e5e6] transition-colors duration-200 cursor-pointer group shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-[#10a37f] group-hover:text-[#12b886] transition-colors">→</span>
                    <span className="text-sm leading-relaxed">{q}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === "user" 
                    ? "bg-[#10a37f]" 
                    : "bg-[#f7f7f8] border border-[#e5e5e6]"
                }`}>
                  {msg.role === "user" ? (
                    <span className="text-white text-sm font-medium">U</span>
                  ) : (
                    <Sparkles className="h-4 w-4 text-[#10a37f]" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 ${msg.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-[#10a37f] text-white"
                        : "bg-[#f7f7f8] text-[#2d2d2d] border border-[#e5e5e6]"
                    } rounded-2xl px-4 py-3 ${
                      msg.role === "user" ? "rounded-br-md" : "rounded-bl-md"
                    }`}
                  >
                    {msg.isStreaming && msg.content === "" ? (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-[#10a37f]" />
                        <span className="text-[#565869] text-sm">Thinking...</span>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed text-sm" data-message-id={msg.id}>
                        {msg.content}
                      </p>
                    )}
                  </div>

                  {/* Feedback buttons for assistant messages */}
                  {msg.role === "assistant" && !msg.isStreaming && !msg.feedback && (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleFeedback(true)}
                        className="p-1.5 rounded-md hover:bg-[#f7f7f8] transition-colors group"
                        title="Good response"
                      >
                        <ThumbsUp className="h-4 w-4 text-[#565869] group-hover:text-[#10a37f]" />
                      </button>
                      <button
                        onClick={() => handleFeedback(false)}
                        className="p-1.5 rounded-md hover:bg-[#f7f7f8] transition-colors group"
                        title="Bad response"
                      >
                        <ThumbsDown className="h-4 w-4 text-[#565869] group-hover:text-[#ef4444]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      {(questionsAsked < 1 || !AI_CHARGE_MODE || isPaid) && (
        <div className="border-t border-[#e5e5e6] bg-white">
          <div className="max-w-3xl mx-auto p-4">
            <div className="relative flex items-end">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isLoading && message.trim().length > 0) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Message Homi..."
                className="min-h-[52px] max-h-[200px] bg-white text-[#2d2d2d] placeholder:text-[#8e8ea0] border border-[#e5e5e6] rounded-2xl px-4 py-3.5 pr-14 resize-none focus:ring-2 focus:ring-[#10a37f] focus-visible:ring-2 focus-visible:ring-[#10a37f] focus:border-[#10a37f] text-sm leading-relaxed shadow-sm"
                maxLength={3000}
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading || message.trim().length === 0}
                className="absolute right-2 bottom-2 p-2 rounded-lg bg-[#10a37f] hover:bg-[#12b886] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#10a37f] transition-all duration-200 text-white shadow-lg"
                title="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
              <div className="flex items-center gap-4">
                <span className="text-xs text-[#565869]">
                  {message.length}/3000
                </span>
                {AI_CHARGE_MODE && isPaid && (
                  <span className="text-xs text-[#565869]">
                    Questions remaining: {PAID_QUESTIONS - questionsAsked}
                  </span>
                )}
              </div>
              <span className="text-xs text-[#8e8ea0]">
                Press Enter to send, Shift+Enter for new line
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Question limit reached */}
      {AI_CHARGE_MODE && isPaid && questionsAsked >= PAID_QUESTIONS && (
        <div className="border-t border-[#e5e5e6] bg-white p-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3 bg-[#f7f7f8] rounded-lg border border-[#e5e5e6]">
            <span className="text-sm text-[#565869]">
              You've used all your questions
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePayment}
              className="bg-[#10a37f] hover:bg-[#12b886] text-white border-[#10a37f]"
            >
              Buy More Questions
            </Button>
          </div>
        </div>
      )}

      {/* Payment Prompt */}
      <AnimatePresence>
        {AI_CHARGE_MODE &&
          questionsAsked >= 1 &&
          !isPaid &&
          !isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-[#e5e5e6] bg-[#f7f7f8] p-6"
            >
              <div className="max-w-3xl mx-auto text-center space-y-4">
                <h3 className="text-lg font-semibold text-[#2d2d2d]">
                  Have More Questions?
                </h3>
                <p className="text-[#565869] text-sm">
                  You've used your free question. Continue the conversation with unlimited follow-up questions to make the most informed decision about your home purchase.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="w-full max-w-xs mx-auto bg-[#10a37f] hover:bg-[#12b886] text-white"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      "Unlock Unlimited Questions for $1.29"
                    )}
                  </Button>
                  <p className="text-xs text-[#8e8ea0]">
                    Secure payment powered by Stripe
                  </p>
                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}