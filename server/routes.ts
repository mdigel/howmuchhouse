import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import OpenAI from "openai";
import { db } from "../db";
import { aiChats } from "../db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

if (!process.env.STRIPE_TEST_SECRET_KEY) {
  throw new Error("Missing Stripe test secret key - Please check environment variables");
}

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: true
});

export function registerRoutes(app: Express): Server {
  console.log("Starting to register routes...");

  // Basic health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Convert the JavaScript calculator to TypeScript endpoint
  app.post("/api/calculate", async (req, res) => {
    try {
      console.log("Received calculate request:", req.body);
      const { 
        householdIncome, 
        downPayment, 
        monthlyDebt,
        annualInterestRate = 6.375,
        loanTermYears = 30,
        state = 'NJ',
        filingStatus = 'married',
        hoaFees = 0,
        homeownersInsurance = 1915,
        pretaxContributions = 0,
        dependents = 0
      } = req.body;

      // Input validation
      if (!householdIncome || !downPayment || monthlyDebt === undefined) {
        return res.status(400).json({ 
          error: "Missing required fields",
          message: "Please provide householdIncome, downPayment, and monthlyDebt"
        });
      }

      // Type conversion and validation
      const numericInputs = {
        householdIncome: Number(householdIncome),
        downPayment: Number(downPayment),
        monthlyDebt: Number(monthlyDebt),
        annualInterestRate: Number(annualInterestRate),
        loanTermYears: Number(loanTermYears),
        hoaFees: Number(hoaFees),
        homeownersInsurance: Number(homeownersInsurance),
        pretaxContributions: Number(pretaxContributions),
        dependents: Number(dependents)
      };

      // Validate numeric inputs
      for (const [key, value] of Object.entries(numericInputs)) {
        if (isNaN(value)) {
          return res.status(400).json({
            error: "Invalid input",
            message: `${key} must be a valid number`
          });
        }
      }

      // Import calculator functions
      const { debtCheck } = require('../attached_assets/Step 0.1 - DebtCheck.js');
      const { calculateMaxMortgagePayment } = require('../attached_assets/Step 1 - MaxMortgagePayment.js');
      const { calculateLoanAmountFromMonthlyPayment } = require('../attached_assets/Step 2 - LoanAmountFromMonthlyPayment.js');
      const { calculateNetIncome } = require('../attached_assets/Step 3 - NetIncome');
      const { calculateSimpleMonthlyBudget } = require('../attached_assets/Step 4 - SimpleMonthlyBudgetR.js');
      const { calculateComplexBudgetMortgagePayment } = require('../attached_assets/Step 5.1 - ComplexBudgetMortgagePayment.js');
      const { calculateComplexBudgetsForSavingsPercentages } = require('../attached_assets/Step 5 - ComplexBudgetsForSavingsPercentages.js');
      const { calculateMortgageForEachSavingScenario } = require('../attached_assets/Step 6 - MortgageForEachSavingScenario.js');

      // Calculate results using the orchestrator
      const calculationResult = {
        householdIncome: numericInputs.householdIncome,
        downPayment: numericInputs.downPayment,
        annualInterestRate: numericInputs.annualInterestRate,
        loanTermYears: numericInputs.loanTermYears,
        state,
        filingStatus,
        hoaFees: numericInputs.hoaFees,
        homeownersInsurance: numericInputs.homeownersInsurance,
        pretaxContributions: numericInputs.pretaxContributions,
        dependents: numericInputs.dependents,
        monthlyDebt: numericInputs.monthlyDebt
      };

      console.log("Calculating with inputs:", calculationResult);

      // Round all numeric outputs to integers
      const roundResults = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;

        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => {
            if (typeof value === 'number') {
              return [key, Math.round(value)];
            }
            if (typeof value === 'object') {
              return [key, roundResults(value)];
            }
            return [key, value];
          })
        );
      };

      const results = roundResults(require('../attached_assets/Orchestrator.js').calculateAllScenarios(calculationResult));

      console.log("Sending calculate response");
      res.json(results);
    } catch (error) {
      console.error("Calculate endpoint error:", error);
      res.status(500).json({ 
        error: "Calculation failed",
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
  });

  app.post("/api/chat", async (req, res) => {
    const { message, calculatorData, isPaid } = req.body;

    try {
      console.log("Received chat request:", { message, calculatorData, isPaid }); // Added logging
      // Validate message length
      if (message.length > 3000) {
        return res.status(400).json({ 
          error: "Message too long",
          message: "Please keep your input under 3000 characters to prevent excessive API usage."
        });
      }

      // Create session if it doesn't exist
      const sessionId = req.headers['x-session-id'] as string || crypto.randomUUID();

      // Store chat in database
      const chat = await db.insert(aiChats).values({
        sessionId,
        message,
        response: '', 
        characterCount: message.length,
        hasPaid: isPaid,
      }).returning();

      // Configure OpenAI
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful real estate and financial advisor assistant. You help users understand their home affordability calculations and provide advice based on their financial situation."
          },
          {
            role: "user",
            content: `Here is the user's financial data:\n${JSON.stringify(calculatorData, null, 2)}\n\nUser's question: ${message}`
          }
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 500,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try asking your question differently.";

      // Update chat with AI response
      await db.update(aiChats)
        .set({ response })
        .where(eq(aiChats.id, chat[0].id));

      // Set session ID in response headers
      res.setHeader('X-Session-Id', sessionId);
      res.json({ response });
    } catch (error) {
      console.error("Chat API Error:", error);
      res.status(500).json({ 
        error: "Failed to get AI response",
        message: "Our AI service is temporarily unavailable. Please try again in a few moments."
      });
    }
  });

  app.post("/api/create-checkout", async (req, res) => {
    try {
      console.log("Received create-checkout request"); // Added logging
      const origin = `${req.protocol}://${req.get('host')}`;
      console.log('Creating checkout session with origin:', origin);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'AI Chat Access',
                description: 'Unlimited access to AI home buying assistant'
              },
              unit_amount: 299,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?canceled=true`,
        allow_promotion_codes: true,
      });

      console.log('Created session:', { 
        sessionId: session.id,
        hasUrl: !!session.url 
      });

      if (!session.url) {
        throw new Error('Checkout session URL was not generated');
      }

      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    const { isHelpful, response } = req.body;
    try {
      console.log("Received feedback request:", {isHelpful, response}); //Added logging
      // Here you would store the feedback in your database
      // For now, just log it
      console.log("AI Response Feedback:", { isHelpful, response });
      res.json({ success: true });
    } catch (error) {
      console.error("Feedback Error:", error);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  const httpServer = createServer(app);
  console.log("Routes registered successfully");
  return httpServer;
}