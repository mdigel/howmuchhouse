import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import OpenAI from "openai";
import { db } from "../db";
import { aiChats, featureFlags } from "../db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import {
  calculateAllScenarios,
  CalculateAllScenariosInput,
} from "./calculatorLogic/Orchestrator";

if (!process.env.STRIPE_TEST_SECRET_KEY) {
  throw new Error(
    "Missing Stripe test secret key - Please check environment variables",
  );
}

console.log("Starting server initialization...");

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: true,
});

console.log("Stripe initialized successfully");

// From Replit... I have these in Step 4
// type FilingStatus = "single" | "married" | "head";
// type StateCode = "CA" | "NY" | "TX" | string;

interface CalculatorInput {
  // Basic inputs
  householdIncome: string | number;
  downPayment: string | number;
  monthlyDebt: string | number;
  annualInterestRate: string | number;
  loanTermYears: string | number;
  state: string;
  filingStatus: FilingStatus;
  // Advanced inputs
  hoaFees?: string | number;
  homeownersInsurance?: string | number;
  pmiInput?: string | number | null;
  propertyTaxInput?: string | number | null;
  pretaxContributions?: string | number;
  dependents?: string | number;
}

export function registerRoutes(app: Express): Server {
  console.log("Registering routes...");

  app.post(
    "/api/calculate",
    async (req: Request<{}, {}, CalculatorInput>, res: Response) => {
      console.log("Received calculator request:", req.body);
      try {
        const {
          // Basic inputs
          householdIncome,
          downPayment,
          monthlyDebt,
          annualInterestRate,
          loanTermYears,
          state,
          filingStatus,
          // Advanced inputs
          hoaFees,
          homeownersInsurance,
          pmiInput = null,
          propertyTaxInput = null,
          pretaxContributions,
          dependents,
        } = req.body;

        console.log("Processing calculator inputs:", {
          householdIncome,
          downPayment,
          monthlyDebt,
          annualInterestRate,
          loanTermYears,
          state,
          filingStatus,
          hoaFees,
          homeownersInsurance,
          pmiInput,
          propertyTaxInput,
          pretaxContributions,
          dependents,
        });

        // Convert string inputs to numbers where needed
        const numericInputs = {
          householdIncome: Number(householdIncome),
          downPayment: Number(downPayment),
          monthlyDebt: Number(monthlyDebt),
          annualInterestRate: Number(annualInterestRate),
          loanTermYears: Number(loanTermYears),
          hoaFees: Number(hoaFees),
          homeownersInsurance: Number(homeownersInsurance),
          pmiInput: pmiInput ? Number(pmiInput) : null,
          propertyTaxInput: propertyTaxInput ? Number(propertyTaxInput) : null,
          pretaxContributions: Number(pretaxContributions),
          dependents: Number(dependents),
        };

        const results = calculateAllScenarios({
          ...numericInputs,
          state,
          filingStatus,
        });


        console.log("Calculation completed successfully");
        res.json(results);
      } catch (error) {
        console.error("Calculator error details:", error);
        res.status(500).json({
          error: "Calculation failed",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  app.post("/api/chat", async (req, res) => {
    const { message, calculatorData, isPaid } = req.body;
    console.log("Received chat request:", { message, calculatorData, isPaid });
    try {
      // Check if AI charging is enabled
      const [aiChargingFlag] = await db
        .select()
        .from(featureFlags)
        .where(eq(featureFlags.name, "ai_charging_enabled"));

      const isAiChargingEnabled = aiChargingFlag?.enabled ?? true; // Default to true if not found

      // Validate message length
      if (message.length > 3000) {
        return res.status(400).json({
          error: "Message too long",
          message:
            "Please keep your input under 3000 characters to prevent excessive API usage.",
        });
      }

      // Create session if it doesn't exist
      const sessionId =
        (req.headers["x-session-id"] as string) || crypto.randomUUID();

      // Store chat in database
      const chat = await db
        .insert(aiChats)
        .values({
          sessionId,
          message,
          response: "",
          characterCount: message.length,
          hasPaid: isAiChargingEnabled ? isPaid : true, // If charging is disabled, treat all requests as paid
        })
        .returning();

      // Configure OpenAI
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful real estate and financial advisor assistant. You help users understand their home affordability calculations and provide advice based on their financial situation.",
          },
          {
            role: "user",
            content: `Here is the user's financial data:\n${JSON.stringify(calculatorData, null, 2)}\n\nUser's question: ${message}`,
          },
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 500,
        temperature: 0.7,
      });

      const response =
        completion.choices[0]?.message?.content ||
        "I apologize, but I couldn't generate a response. Please try asking your question differently.";

      // Update chat with AI response
      await db
        .update(aiChats)
        .set({ response })
        .where(eq(aiChats.id, chat[0].id));

      // Set session ID in response headers and include feature flag status
      res.setHeader("X-Session-Id", sessionId);
      res.json({ 
        response,
        isAiChargingEnabled // Send this to the client so it knows whether to show payment UI
      });
    } catch (error) {
      console.error("Chat API Error:", error);
      res.status(500).json({
        error: "Failed to get AI response",
        message:
          "Our AI service is temporarily unavailable. Please try again in a few moments.",
      });
    }
  });

  app.post("/api/create-checkout", async (req, res) => {
    try {
      const origin = `${req.protocol}://${req.get("host")}`;
      console.log("Creating checkout session with origin:", origin);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "AI Chat Access",
                description: "Unlimited access to AI home buying assistant",
              },
              unit_amount: 299,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?canceled=true`,
        allow_promotion_codes: true,
      });

      console.log("Created session:", {
        sessionId: session.id,
        hasUrl: !!session.url,
      });

      if (!session.url) {
        throw new Error("Checkout session URL was not generated");
      }

      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    const { isHelpful, response } = req.body;
    console.log("Received feedback request:", { isHelpful, response });
    try {
      // Here you would store the feedback in your database
      // For now, just log it
      console.log("AI Response Feedback:", { isHelpful, response });
      res.json({ success: true });
    } catch (error) {
      console.error("Feedback Error:", error);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  console.log("Routes registered successfully");
  const httpServer = createServer(app);
  console.log("HTTP server created");
  return httpServer;
}

type FilingStatus = "single" | "married" | "head";
type StateCode = "CA" | "NY" | "TX" | string;