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
  app.post("/api/calculate", async (req, res) => {
    try {
      // This would call your existing calculator function
      const { householdIncome, downPayment, monthlyDebt } = req.body;

      // Mock calculation based on input
      const mockResults = {
        incomeSummary: {
          grossIncome: Number(householdIncome),
          adjustedGrossIncome: Number(householdIncome),
          federalTax: Number(householdIncome) * 0.22,
          stateTax: Number(householdIncome) * 0.08,
          socialSecurityTax: Math.min(Number(householdIncome) * 0.062, 9932.4),
          medicareTax: Number(householdIncome) * 0.0145,
          additionalMedicareTax: Number(householdIncome) > 200000 ? (Number(householdIncome) - 200000) * 0.009 : 0,
          childTaxCredit: 0,
          get totalTax() {
            return this.federalTax + this.stateTax + this.socialSecurityTax + 
                   this.medicareTax + this.additionalMedicareTax - this.childTaxCredit;
          },
          get netIncome() {
            return this.grossIncome - this.totalTax;
          }
        },
        monthlyDebt: Number(monthlyDebt),
        maxHomePrice: {
          description: "Max Mortgage Scenario with as close to 50/30/20 budget as possible",
          mortgagePaymentStats: {
            purchasePrice: Number(householdIncome) * 3.5,
            loanAmount: (Number(householdIncome) * 3.5) - Number(downPayment),
            downpayment: Number(downPayment),
            totalPayment: ((Number(householdIncome) * 3.5) * 0.06) / 12,
            mortgagePayment: ((Number(householdIncome) * 3.5) * 0.048) / 12,
            propertyTax: ((Number(householdIncome) * 3.5) * 0.01) / 12,
            pmi: Number(downPayment) < (Number(householdIncome) * 3.5) * 0.2 ? 100 : 0,
            homeownersInsurance: 159.58,
            hoa: 0
          },
          scenario: {
            monthlyNetIncome: (Number(householdIncome) - (Number(householdIncome) * 0.3)) / 12,
            mortgage: { 
              amount: ((Number(householdIncome) * 3.5) * 0.06) / 12,
              percentage: 0.42 
            },
            wants: { amount: (Number(householdIncome) * 0.3) / 12, percentage: 0.3 },
            remainingNeeds: { amount: (Number(householdIncome) * 0.15) / 12, percentage: 0.15 },
            savings: { amount: (Number(householdIncome) * 0.13) / 12, percentage: 0.13 }
          }
        },
        savingScenarios: [
          {
            description: "15% Saving Scenario",
            mortgagePaymentStats: {
              purchasePrice: Number(householdIncome) * 2.7,
              loanAmount: (Number(householdIncome) * 2.7) - Number(downPayment),
              downpayment: Number(downPayment),
              totalPayment: ((Number(householdIncome) * 2.7) * 0.06) / 12,
              mortgagePayment: ((Number(householdIncome) * 2.7) * 0.048) / 12,
              propertyTax: ((Number(householdIncome) * 2.7) * 0.01) / 12,
              pmi: Number(downPayment) < (Number(householdIncome) * 2.7) * 0.2 ? 75 : 0,
              homeownersInsurance: 159.58,
              hoa: 0
            },
            scenario: {
              mortgage: { amount: ((Number(householdIncome) * 2.7) * 0.06) / 12, percentage: 0.35 },
              wants: { amount: (Number(householdIncome) * 0.3) / 12, percentage: 0.3 },
              remainingNeeds: { amount: (Number(householdIncome) * 0.2) / 12, percentage: 0.2 },
              savings: { amount: (Number(householdIncome) * 0.15) / 12, percentage: 0.15 }
            }
          },
          {
            description: "20% Saving Scenario",
            mortgagePaymentStats: {
              purchasePrice: Number(householdIncome) * 2.4,
              loanAmount: (Number(householdIncome) * 2.4) - Number(downPayment),
              downpayment: Number(downPayment),
              totalPayment: ((Number(householdIncome) * 2.4) * 0.06) / 12,
              mortgagePayment: ((Number(householdIncome) * 2.4) * 0.048) / 12,
              propertyTax: ((Number(householdIncome) * 2.4) * 0.01) / 12,
              pmi: Number(downPayment) < (Number(householdIncome) * 2.4) * 0.2 ? 50 : 0,
              homeownersInsurance: 159.58,
              hoa: 0
            },
            scenario: {
              mortgage: { amount: ((Number(householdIncome) * 2.4) * 0.06) / 12, percentage: 0.3 },
              wants: { amount: (Number(householdIncome) * 0.3) / 12, percentage: 0.3 },
              remainingNeeds: { amount: (Number(householdIncome) * 0.2) / 12, percentage: 0.2 },
              savings: { amount: (Number(householdIncome) * 0.2) / 12, percentage: 0.2 }
            }
          },
          {
            description: "25% Saving Scenario",
            mortgagePaymentStats: {
              purchasePrice: Number(householdIncome) * 2.1,
              loanAmount: (Number(householdIncome) * 2.1) - Number(downPayment),
              downpayment: Number(downPayment),
              totalPayment: ((Number(householdIncome) * 2.1) * 0.06) / 12,
              mortgagePayment: ((Number(householdIncome) * 2.1) * 0.048) / 12,
              propertyTax: ((Number(householdIncome) * 2.1) * 0.01) / 12,
              pmi: Number(downPayment) < (Number(householdIncome) * 2.1) * 0.2 ? 0 : 0,
              homeownersInsurance: 159.58,
              hoa: 0
            },
            scenario: {
              mortgage: { amount: ((Number(householdIncome) * 2.1) * 0.06) / 12, percentage: 0.25 },
              wants: { amount: (Number(householdIncome) * 0.3) / 12, percentage: 0.3 },
              remainingNeeds: { amount: (Number(householdIncome) * 0.2) / 12, percentage: 0.2 },
              savings: { amount: (Number(householdIncome) * 0.25) / 12, percentage: 0.25 }
            }
          }
        ]
      };

      res.json(mockResults);
    } catch (error) {
      res.status(500).json({ error: "Calculation failed" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    const { message, calculatorData, isPaid } = req.body;

    try {
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
  return httpServer;
}