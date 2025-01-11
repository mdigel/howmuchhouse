import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import OpenAI from "openai";
import { db } from "../db";
import { aiChats } from "../db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export function registerRoutes(app: Express): Server {
  // Basic health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/calculate", async (req, res) => {
    try {
      const { 
        householdIncome,
        downPayment,
        monthlyDebt,
        annualInterestRate = 7.5,
        loanTermYears = 30,
        state = "CA",
        filingStatus = "single",
        hoaFees = 0,
        homeownersInsurance = 1200,
        pmiInput = null,
        propertyTaxInput = null,
        pretaxContributions = 0,
        dependents = 0
      } = req.body;

      // Mock calculation based on input
      const mockResults = {
        incomeSummary: {
          grossIncome: Number(householdIncome),
          adjustedGrossIncome: Number(householdIncome) - Number(pretaxContributions),
          federalTax: Number(householdIncome) * 0.22,
          stateTax: Number(householdIncome) * 0.08,
          socialSecurityTax: Math.min(Number(householdIncome) * 0.062, 9932.4),
          medicareTax: Number(householdIncome) * 0.0145,
          additionalMedicareTax: Number(householdIncome) > 200000 ? (Number(householdIncome) - 200000) * 0.009 : 0,
          childTaxCredit: Number(dependents) * 2000,
          get totalTax() {
            return this.federalTax + this.stateTax + this.socialSecurityTax + 
                   this.medicareTax + this.additionalMedicareTax - this.childTaxCredit;
          },
          get netIncome() {
            return this.grossIncome - this.totalTax;
          }
        },
        monthlyDebt: Number(monthlyDebt),
        maxHomePrice: calculateMaxHomePrice(householdIncome, downPayment, monthlyDebt, {
          annualInterestRate,
          loanTermYears,
          hoaFees,
          homeownersInsurance,
          pmiInput,
          propertyTaxInput
        })
      };

      res.json(mockResults);
    } catch (error: any) {
      console.error('Calculation error:', error);
      res.status(500).json({ error: "Calculation failed", details: error.message });
    }
  });

  // Helper function to calculate monthly mortgage payment
  function calculateMonthlyMortgage(principal: number, annualRate: number, years: number): number {
    const monthlyRate = (annualRate / 100) / 12;
    const numberOfPayments = years * 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  // Helper function to calculate max home price and scenarios
  function calculateMaxHomePrice(
    householdIncome: number | string,
    downPayment: number | string,
    monthlyDebt: number | string,
    options: {
      annualInterestRate: number | string,
      loanTermYears: number | string,
      hoaFees: number | string,
      homeownersInsurance: number | string,
      pmiInput: number | null | string,
      propertyTaxInput: number | null | string
    }
  ) {
    const purchasePrice = Number(householdIncome) * 3.5;
    const loanAmount = purchasePrice - Number(downPayment);

    return {
      description: "Max Mortgage Scenario",
      mortgagePaymentStats: {
        purchasePrice,
        loanAmount,
        downpayment: Number(downPayment),
        totalPayment: calculateMonthlyMortgage(
          loanAmount,
          Number(options.annualInterestRate),
          Number(options.loanTermYears)
        ),
        propertyTax: Number(options.propertyTaxInput) || (purchasePrice * 0.01) / 12,
        pmi: Number(options.pmiInput) || (Number(downPayment) < purchasePrice * 0.2 ? 75 : 0),
        homeownersInsurance: Number(options.homeownersInsurance) / 12,
        hoa: Number(options.hoaFees)
      }
    };
  }

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
    } catch (error:any) {
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