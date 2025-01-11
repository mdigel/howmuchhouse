import type { Express, Request, Response } from "express";
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

console.log('Starting server initialization...');

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: true
});

console.log('Stripe initialized successfully');

type FilingStatus = "single" | "married" | "head";
type StateCode = "CA" | "NY" | "TX" | string;

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
  console.log('Registering routes...');

  app.post("/api/calculate", async (req: Request<{}, {}, CalculatorInput>, res: Response) => {
    console.log('Received calculator request:', req.body);
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
        hoaFees = 0,
        homeownersInsurance = 1915,
        pmiInput = null,
        propertyTaxInput = null,
        pretaxContributions = 0,
        dependents = 0
      } = req.body;

      console.log('Processing calculator inputs:', {
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
        dependents
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
        dependents: Number(dependents)
      };

      // Calculate adjusted gross income considering pre-tax contributions
      const adjustedGrossIncome = numericInputs.householdIncome - numericInputs.pretaxContributions;

      // Calculate tax rates based on filing status and state
      const taxRates: Record<FilingStatus, number> = {
        single: 0.22,
        married: 0.18,
        head: 0.20
      };

      const stateTaxRates: Record<string, number> = {
        CA: 0.093,
        NY: 0.085,
        TX: 0
      };

      const federalTaxRate = taxRates[filingStatus] || 0.22;
      const stateTaxRate = stateTaxRates[state as StateCode] || 0.05;

      // Calculate child tax credit based on dependents
      const childTaxCredit = numericInputs.dependents * 2000;

      const mockResults = {
        incomeSummary: {
          grossIncome: numericInputs.householdIncome,
          adjustedGrossIncome,
          federalTax: adjustedGrossIncome * federalTaxRate,
          stateTax: adjustedGrossIncome * stateTaxRate,
          socialSecurityTax: Math.min(adjustedGrossIncome * 0.062, 9932.4),
          medicareTax: adjustedGrossIncome * 0.0145,
          additionalMedicareTax: adjustedGrossIncome > 200000 ? (adjustedGrossIncome - 200000) * 0.009 : 0,
          childTaxCredit,
          get totalTax() {
            return this.federalTax + this.stateTax + this.socialSecurityTax +
                   this.medicareTax + this.additionalMedicareTax - this.childTaxCredit;
          },
          get netIncome() {
            return this.grossIncome - this.totalTax;
          }
        },
        monthlyDebt: numericInputs.monthlyDebt,
        maxHomePrice: {
          description: "Max Mortgage Scenario with as close to 50/30/20 budget as possible",
          mortgagePaymentStats: {
            purchasePrice: adjustedGrossIncome * 3.5,
            loanAmount: (adjustedGrossIncome * 3.5) - numericInputs.downPayment,
            downpayment: numericInputs.downPayment,
            totalPayment: ((adjustedGrossIncome * 3.5 - numericInputs.downPayment) * (numericInputs.annualInterestRate/1200) * Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12)) / (Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12) - 1),
            mortgagePayment: ((adjustedGrossIncome * 3.5 - numericInputs.downPayment) * (numericInputs.annualInterestRate/1200) * Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12)) / (Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12) - 1),
            propertyTax: numericInputs.propertyTaxInput || ((adjustedGrossIncome * 3.5) * 0.01) / 12,
            pmi: numericInputs.pmiInput || (numericInputs.downPayment < (adjustedGrossIncome * 3.5) * 0.2 ? 100 : 0),
            homeownersInsurance: numericInputs.homeownersInsurance / 12,
            hoa: numericInputs.hoaFees
          },
          scenario: {
            monthlyNetIncome: (adjustedGrossIncome - (adjustedGrossIncome * federalTaxRate)) / 12,
            mortgage: {
              amount: ((adjustedGrossIncome * 3.5) * (numericInputs.annualInterestRate/100)) / 12,
              percentage: 0.42
            },
            wants: { amount: (adjustedGrossIncome * 0.3) / 12, percentage: 0.3 },
            remainingNeeds: { amount: (adjustedGrossIncome * 0.15) / 12, percentage: 0.15 },
            savings: { amount: (adjustedGrossIncome * 0.13) / 12, percentage: 0.13 }
          }
        },
        savingScenarios: [
          {
            description: "15% Saving Scenario",
            mortgagePaymentStats: {
              purchasePrice: adjustedGrossIncome * 2.7,
              loanAmount: (adjustedGrossIncome * 2.7) - numericInputs.downPayment,
              downpayment: numericInputs.downPayment,
              totalPayment: ((adjustedGrossIncome * 2.7 - numericInputs.downPayment) * (numericInputs.annualInterestRate/1200) * Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12)) / (Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12) - 1),
              mortgagePayment: ((adjustedGrossIncome * 2.7 - numericInputs.downPayment) * (numericInputs.annualInterestRate/1200) * Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12)) / (Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12) - 1),
              propertyTax: numericInputs.propertyTaxInput || ((adjustedGrossIncome * 2.7) * 0.01) / 12,
              pmi: numericInputs.pmiInput || (numericInputs.downPayment < (adjustedGrossIncome * 2.7) * 0.2 ? 75 : 0),
              homeownersInsurance: numericInputs.homeownersInsurance / 12,
              hoa: numericInputs.hoaFees
            },
            scenario: {
              mortgage: { amount: ((adjustedGrossIncome * 2.7) * (numericInputs.annualInterestRate/100)) / 12, percentage: 0.35 },
              wants: { amount: (adjustedGrossIncome * 0.3) / 12, percentage: 0.3 },
              remainingNeeds: { amount: (adjustedGrossIncome * 0.2) / 12, percentage: 0.2 },
              savings: { amount: (adjustedGrossIncome * 0.15) / 12, percentage: 0.15 }
            }
          },
          {
            description: "20% Saving Scenario",
            mortgagePaymentStats: {
              purchasePrice: adjustedGrossIncome * 2.4,
              loanAmount: (adjustedGrossIncome * 2.4) - numericInputs.downPayment,
              downpayment: numericInputs.downPayment,
              totalPayment: ((adjustedGrossIncome * 2.4 - numericInputs.downPayment) * (numericInputs.annualInterestRate/1200) * Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12)) / (Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12) - 1),
              mortgagePayment: ((adjustedGrossIncome * 2.4 - numericInputs.downPayment) * (numericInputs.annualInterestRate/1200) * Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12)) / (Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12) - 1),
              propertyTax: numericInputs.propertyTaxInput || ((adjustedGrossIncome * 2.4) * 0.01) / 12,
              pmi: numericInputs.pmiInput || (numericInputs.downPayment < (adjustedGrossIncome * 2.4) * 0.2 ? 50 : 0),
              homeownersInsurance: numericInputs.homeownersInsurance / 12,
              hoa: numericInputs.hoaFees
            },
            scenario: {
              mortgage: { amount: ((adjustedGrossIncome * 2.4) * (numericInputs.annualInterestRate/100)) / 12, percentage: 0.3 },
              wants: { amount: (adjustedGrossIncome * 0.3) / 12, percentage: 0.3 },
              remainingNeeds: { amount: (adjustedGrossIncome * 0.2) / 12, percentage: 0.2 },
              savings: { amount: (adjustedGrossIncome * 0.2) / 12, percentage: 0.2 }
            }
          },
          {
            description: "25% Saving Scenario",
            mortgagePaymentStats: {
              purchasePrice: adjustedGrossIncome * 2.1,
              loanAmount: (adjustedGrossIncome * 2.1) - numericInputs.downPayment,
              downpayment: numericInputs.downPayment,
              totalPayment: ((adjustedGrossIncome * 2.1 - numericInputs.downPayment) * (numericInputs.annualInterestRate/1200) * Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12)) / (Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12) - 1),
              mortgagePayment: ((adjustedGrossIncome * 2.1 - numericInputs.downPayment) * (numericInputs.annualInterestRate/1200) * Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12)) / (Math.pow(1 + numericInputs.annualInterestRate/1200, numericInputs.loanTermYears * 12) - 1),
              propertyTax: numericInputs.propertyTaxInput || ((adjustedGrossIncome * 2.1) * 0.01) / 12,
              pmi: numericInputs.pmiInput || (numericInputs.downPayment < (adjustedGrossIncome * 2.1) * 0.2 ? 0 : 0),
              homeownersInsurance: numericInputs.homeownersInsurance / 12,
              hoa: numericInputs.hoaFees
            },
            scenario: {
              mortgage: { amount: ((adjustedGrossIncome * 2.1) * (numericInputs.annualInterestRate/100)) / 12, percentage: 0.25 },
              wants: { amount: (adjustedGrossIncome * 0.3) / 12, percentage: 0.3 },
              remainingNeeds: { amount: (adjustedGrossIncome * 0.2) / 12, percentage: 0.2 },
              savings: { amount: (adjustedGrossIncome * 0.25) / 12, percentage: 0.25 }
            }
          }
        ]
      };

      console.log('Calculation completed successfully');
      res.json(mockResults);
    } catch (error) {
      console.error('Calculator error details:', error);
      res.status(500).json({ 
        error: "Calculation failed", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/chat", async (req, res) => {
    const { message, calculatorData, isPaid } = req.body;
    console.log('Received chat request:', {message, calculatorData, isPaid})
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
    console.log('Received feedback request:', {isHelpful, response})
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

  console.log('Routes registered successfully');
  const httpServer = createServer(app);
  console.log('HTTP server created');
  return httpServer;
}