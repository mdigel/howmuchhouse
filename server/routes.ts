import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import OpenAI from "openai";
import { db } from "../db";
import { aiChats } from "../db/schema";
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
console.log("Environment variables check:", {
  hasReplitUrl: !!process.env.REPLIT_URL,
  hasReplitSlug: !!process.env.REPLIT_SLUG,
  nodeEnv: process.env.NODE_ENV
});

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: true,
});

console.log("Stripe initialized successfully");

interface CalculatorInput {
  // Basic inputs
  householdIncome: string | number;
  downPayment: string | number;
  monthlyDebt: string | number;
  annualInterestRate: string | number;
  loanTermYears: string | number;
  state: string;
  filingStatus: "single" | "married" | "head";
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
          householdIncome,
          downPayment,
          monthlyDebt,
          annualInterestRate,
          loanTermYears,
          state,
          filingStatus,
          hoaFees,
          homeownersInsurance,
          pmiInput = null,
          propertyTaxInput = null,
          pretaxContributions,
          dependents,
        } = req.body;

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
      if (message.length > 3000) {
        return res.status(400).json({
          error: "Message too long",
          message:
            "Please keep your input under 3000 characters to prevent excessive API usage.",
        });
      }

      const sessionId =
        (req.headers["x-session-id"] as string) || crypto.randomUUID();

      const chat = await db
        .insert(aiChats)
        .values({
          sessionId,
          message,
          response: "",
          characterCount: message.length,
          hasPaid: isPaid,
        })
        .returning();

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful real estate and financial advisor assistant. You help users understand their home affordability calculations and provide advice based on their financial situation.",
          },
          {
            role: "user",
            content: `Here is the user's financial data:\n${JSON.stringify(
              calculatorData,
              null,
              2,
            )}\n\nUser's question: ${message}`,
          },
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 500,
        temperature: 0.7,
      });

      const response =
        completion.choices[0]?.message?.content ||
        "I apologize, but I couldn't generate a response. Please try asking your question differently.";

      await db
        .update(aiChats)
        .set({ response })
        .where(eq(aiChats.id, chat[0].id));

      res.setHeader("X-Session-Id", sessionId);
      res.json({ response });
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
      // Get the Replit URL from environment variables, with fallbacks
      const replitUrl = process.env.REPLIT_SLUG || process.env.REPLIT_URL;
      let origin;

      if (replitUrl) {
        // Ensure HTTPS for Replit URLs and remove any protocol prefix if present
        const cleanUrl = replitUrl.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
        origin = `https://${cleanUrl}`;
      } else {
        // Fallback to request origin for local development
        const host = req.get("host")?.split(":")[0]; // Remove port if present
        origin = process.env.NODE_ENV === 'production'
          ? `https://${host}`
          : `${req.protocol}://${host}`;
      }

      console.log("Creating checkout session with:", {
        origin,
        replitUrl,
        host: req.get("host"),
        protocol: req.protocol,
        nodeEnv: process.env.NODE_ENV
      });

      const successUrl = `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/?canceled=true`;

      console.log("Using redirect URLs:", { successUrl, cancelUrl });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "AI Chat Access",
                description: "5 questions with our AI home buying assistant",
              },
              unit_amount: 299,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
      });

      console.log("Stripe session created:", {
        sessionId: session.id,
        hasUrl: !!session.url,
        success_url: session.success_url,
        cancel_url: session.cancel_url
      });

      if (!session.url) {
        throw new Error("Checkout session URL was not generated");
      }

      res.json({ url: session.url });
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