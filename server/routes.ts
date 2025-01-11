import type { Express, Request, Response } from "express";
import { Router } from "express";
import Stripe from "stripe";
import OpenAI from "openai";
import { db } from "../db";
import { aiChats } from "../db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// Type definitions
interface CalculatorInput {
  householdIncome: number;
  downPayment: number;
  monthlyDebt: number;
  annualInterestRate: number;
  loanTermYears: number;
  state: string;
  filingStatus: string;
  hoaFees?: number;
  homeownersInsurance?: number;
  pmiInput?: number | null;
  propertyTaxInput?: number | null;
  pretaxContributions?: number;
  dependents?: number;
}

// Initialize external services
function initializeServices() {
  if (!process.env.STRIPE_TEST_SECRET_KEY) {
    throw new Error("Missing Stripe test secret key - Please check environment variables");
  }

  const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY, {
    apiVersion: "2023-10-16",
    typescript: true
  });

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return { stripe, openai };
}

// Helper functions
function calculateMonthlyMortgage(principal: number, annualRate: number, years: number): number {
  const monthlyRate = (annualRate / 100) / 12;
  const numberOfPayments = years * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
}

function calculateMortgageScenario(
  householdIncome: number,
  downPayment: number,
  multiplier: number,
  options: {
    annualInterestRate: number,
    loanTermYears: number,
    hoaFees?: number,
    homeownersInsurance?: number,
    pmiInput?: number | null,
    propertyTaxInput?: number | null,
  }
) {
  const purchasePrice = householdIncome * multiplier;
  const loanAmount = purchasePrice - downPayment;
  const hoaFees = options.hoaFees || 0;
  const homeownersInsurance = options.homeownersInsurance || 1915;

  return {
    purchasePrice,
    loanAmount,
    downpayment: downPayment,
    totalPayment: calculateMonthlyMortgage(loanAmount, options.annualInterestRate, options.loanTermYears)
      + hoaFees
      + (options.propertyTaxInput || (purchasePrice * 0.01) / 12)
      + (options.pmiInput || (downPayment < purchasePrice * 0.2 ? 75 : 0))
      + homeownersInsurance / 12,
    mortgagePayment: calculateMonthlyMortgage(loanAmount, options.annualInterestRate, options.loanTermYears),
    propertyTax: options.propertyTaxInput || (purchasePrice * 0.01) / 12,
    pmi: options.pmiInput || (downPayment < purchasePrice * 0.2 ? 75 : 0),
    homeownersInsurance: homeownersInsurance / 12,
    hoa: hoaFees
  };
}

export function registerRoutes(app: Express) {
  const router = Router();
  const { stripe, openai } = initializeServices();

  // Calculator endpoint
  router.post("/calculate", async (req: Request<{}, {}, CalculatorInput>, res: Response) => {
    try {
      const { 
        householdIncome,
        downPayment,
        monthlyDebt,
        annualInterestRate,
        loanTermYears,
        state,
        filingStatus,
        hoaFees = 0,
        homeownersInsurance = 1915,
        pmiInput = null,
        propertyTaxInput = null,
        pretaxContributions = 0,
        dependents = 0
      } = req.body;

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
        maxHomePrice: {
          description: "Max Mortgage Scenario with as close to 50/30/20 budget as possible",
          mortgagePaymentStats: calculateMortgageScenario(
            Number(householdIncome),
            Number(downPayment),
            3.5,
            {
              annualInterestRate: Number(annualInterestRate),
              loanTermYears: Number(loanTermYears),
              hoaFees,
              homeownersInsurance,
              pmiInput,
              propertyTaxInput
            }
          ),
          scenario: {
            monthlyNetIncome: (Number(householdIncome) - (Number(householdIncome) * 0.3)) / 12,
            mortgage: { amount: ((Number(householdIncome) * 3.5) * 0.06) / 12, percentage: 0.42 },
            wants: { amount: (Number(householdIncome) * 0.3) / 12, percentage: 0.3 },
            remainingNeeds: { amount: (Number(householdIncome) * 0.15) / 12, percentage: 0.15 },
            savings: { amount: (Number(householdIncome) * 0.13) / 12, percentage: 0.13 }
          }
        },
        savingScenarios: [
          {
            description: "15% Saving Scenario",
            mortgagePaymentStats: calculateMortgageScenario(
              Number(householdIncome),
              Number(downPayment),
              2.7,
              {
                annualInterestRate: Number(annualInterestRate),
                loanTermYears: Number(loanTermYears),
                hoaFees,
                homeownersInsurance,
                pmiInput,
                propertyTaxInput
              }
            ),
            scenario: {
              mortgage: { amount: ((Number(householdIncome) * 2.7) * 0.06) / 12, percentage: 0.35 },
              wants: { amount: (Number(householdIncome) * 0.3) / 12, percentage: 0.3 },
              remainingNeeds: { amount: (Number(householdIncome) * 0.2) / 12, percentage: 0.2 },
              savings: { amount: (Number(householdIncome) * 0.15) / 12, percentage: 0.15 }
            }
          },
          {
            description: "20% Saving Scenario",
            mortgagePaymentStats: calculateMortgageScenario(
              Number(householdIncome),
              Number(downPayment),
              2.4,
              {
                annualInterestRate: Number(annualInterestRate),
                loanTermYears: Number(loanTermYears),
                hoaFees,
                homeownersInsurance,
                pmiInput,
                propertyTaxInput
              }
            ),
            scenario: {
              mortgage: { amount: ((Number(householdIncome) * 2.4) * 0.06) / 12, percentage: 0.3 },
              wants: { amount: (Number(householdIncome) * 0.3) / 12, percentage: 0.3 },
              remainingNeeds: { amount: (Number(householdIncome) * 0.2) / 12, percentage: 0.2 },
              savings: { amount: (Number(householdIncome) * 0.2) / 12, percentage: 0.2 }
            }
          },
          {
            description: "25% Saving Scenario",
            mortgagePaymentStats: calculateMortgageScenario(
              Number(householdIncome),
              Number(downPayment),
              2.1,
              {
                annualInterestRate: Number(annualInterestRate),
                loanTermYears: Number(loanTermYears),
                hoaFees,
                homeownersInsurance,
                pmiInput,
                propertyTaxInput
              }
            ),
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
      console.error('Calculation error:', error);
      res.status(500).json({ 
        error: "Calculation failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  router.post("/chat", async (req, res) => {
    const { message, calculatorData, isPaid } = req.body;

    try {
      if (message.length > 3000) {
        return res.status(400).json({ 
          error: "Message too long",
          message: "Please keep your input under 3000 characters."
        });
      }

      const sessionId = req.headers['x-session-id'] as string || crypto.randomUUID();

      const chat = await db.insert(aiChats).values({
        sessionId,
        message,
        response: '', 
        characterCount: message.length,
        hasPaid: isPaid,
      }).returning();

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful real estate and financial advisor assistant."
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

      const response = completion.choices[0]?.message?.content || 
                      "I apologize, but I couldn't generate a response. Please try again.";

      await db.update(aiChats)
        .set({ response })
        .where(eq(aiChats.id, chat[0].id));

      res.setHeader('X-Session-Id', sessionId);
      res.json({ response });
    } catch (error) {
      console.error("Chat API Error:", error);
      res.status(500).json({ 
        error: "Failed to get AI response",
        message: "Our AI service is temporarily unavailable. Please try again later."
      });
    }
  });

  router.post("/create-checkout", async (req, res) => {
    try {
      const origin = `${req.protocol}://${req.get('host')}`;

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

  router.post("/feedback", (req, res) => {
    const { isHelpful, response } = req.body;
    try {
      console.log("AI Response Feedback:", { isHelpful, response });
      res.json({ success: true });
    } catch (error) {
      console.error("Feedback Error:", error);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  app.use('/api', router);
}