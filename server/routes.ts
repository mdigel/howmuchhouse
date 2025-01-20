
import { config } from "./config";

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
  type CalculateAllScenariosInput,
} from "./calculatorLogic/Orchestrator";

// Initialize Stripe
const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';
const stripeSecretKey = isProduction 
  ? process.env.STRIPE_SECRET_KEY 
  : process.env.STRIPE_TEST_SECRET_KEY;

console.log('Stripe Mode:', isProduction ? 'Production' : 'Test');

if (!stripeSecretKey) {
  throw new Error(`Missing Stripe ${isProduction ? 'production' : 'test'} secret key - Please check Replit Secrets`);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-12-18.acacia",

  app.get("/api/config", async (_req: Request, res: Response) => {
    res.json({ AI_CHARGE_MODE: config.aiChargeMode });
  });


  typescript: true,
});

export function registerRoutes(app: Express): Server {
  console.log("Registering core API routes...");
  const httpServer = createServer(app);

  // API Routes
  app.post("/api/calculate", async (req: Request, res: Response) => {
    console.log("Received calculator request:", req.body);
    try {
      const input: CalculateAllScenariosInput = {
        householdIncome: Number(req.body.householdIncome),
        downPayment: Number(req.body.downPayment),
        monthlyDebt: Number(req.body.monthlyDebt),
        annualInterestRate: Number(req.body.annualInterestRate),
        loanTermYears: Number(req.body.loanTermYears),
        state: req.body.state,
        filingStatus: req.body.filingStatus,
        hoaFees: req.body.hoaFees ? Number(req.body.hoaFees) : undefined,
        homeownersInsurance: req.body.homeownersInsurance ? Number(req.body.homeownersInsurance) : undefined,
        pmiInput: req.body.pmiInput ? Number(req.body.pmiInput) : null,
        propertyTaxInput: req.body.propertyTaxInput ? Number(req.body.propertyTaxInput) : null,
        pretaxContributions: req.body.pretaxContributions ? Number(req.body.pretaxContributions) : undefined,
        dependents: req.body.dependents ? Number(req.body.dependents) : undefined
      };

      // Validate numbers
      const requiredNumbers = {
        'Household Income': input.householdIncome,
        'Down Payment': input.downPayment,
        'Monthly Debt': input.monthlyDebt,
        'Annual Interest Rate': input.annualInterestRate,
        'Loan Term Years': input.loanTermYears
      };

      for (const [field, value] of Object.entries(requiredNumbers)) {
        if (isNaN(value) || value === undefined) {
          throw new Error(`Invalid ${field}: must be a valid number`);
        }
      }

      const results = calculateAllScenarios(input);
      console.log("Calculation completed successfully");
      res.json(results);
    } catch (error) {
      console.error("Calculator error:", error);
      res.status(500).json({
        error: "Calculation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

app.post("/api/chat", async (req: Request, res: Response) => {
    const { message, calculatorData, isPaid } = req.body;
    console.log("Received chat request");
    const effectiveIsPaid = config.aiChargeMode ? isPaid : true; // Always treat as paid if charge mode is off

    try {
      if (message.length > 3000) {
        return res.status(400).json({
          error: "Message too long",
          message: "Please keep your input under 3000 characters",
        });
      }

      const sessionId = (req.headers["x-session-id"] as string) || crypto.randomUUID();

      const chat = await db
        .insert(aiChats)
        .values({
          sessionId,
          message,
          response: "",
          characterCount: message.length,
          hasPaid: effectiveIsPaid,
        })
        .returning();

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful real estate and financial advisor assistant.",
          },
          {
            role: "user",
            content: `Financial data:\n${JSON.stringify(calculatorData, null, 2)}\n\nQuestion: ${message}`,
          },
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 500,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || 
        "I apologize, but I couldn't generate a response. Please try again.";

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
        message: "Our AI service is temporarily unavailable. Please try again later.",
      });
    }
  });

  app.post("/api/create-checkout", async (req: Request, res: Response) => {
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
              unit_amount: 129,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?canceled=true`,
        allow_promotion_codes: true,
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

  app.post("/api/feedback", async (req: Request, res: Response) => {
    const { isHelpful, response } = req.body;
    console.log("Received feedback:", { isHelpful, response });
    try {
      // Store feedback in database (implement as needed)
      res.json({ success: true });
    } catch (error) {
      console.error("Feedback Error:", error);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  return httpServer;
}