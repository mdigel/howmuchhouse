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

// Define income levels and states
const incomes = [
  "30k", "50k", "70k", "90k", "110k",
  "130k", "150k", "170k", "190k",
  "210k", "250k", "300k", "400k"
];

const states = [
  "california", "texas", "new-york", "florida",
  "illinois", "pennsylvania", "ohio", "georgia",
  "michigan", "north-carolina"
];

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
  typescript: true,
});

// HTML template function for SSR pages
function generatePageHTML(title: string, content: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link rel="stylesheet" href="/index.css">
      </head>
      <body>
        <div id="root">
          ${content}
        </div>
        <script type="module" src="/src/main.tsx"></script>
      </body>
    </html>
  `;
}

export function registerRoutes(app: Express): Server {
  console.log("Registering core API routes...");
  const httpServer = createServer(app);

  // SSR Routes - Only handle non-API requests
  app.get("/affordability-by-income-level", (req: Request, res: Response) => {
    // Check if this is an API request
    const isApiRequest = req.headers.accept?.includes('application/json');
    if (isApiRequest) {
      return res.json({ message: 'API endpoint not available' });
    }

    let content = `
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-6">Home Affordability by Income Level</h1>
        <p class="mb-6">Select your income level to see how much house you can afford in different states:</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    `;

    incomes.forEach((income) => {
      content += `
        <div class="border rounded-lg p-4 hover:shadow-lg transition-shadow">
          <h2 class="text-xl font-semibold mb-3">$${income} Annual Income</h2>
          <ul class="space-y-2">
            ${states.slice(0, 5).map(state => 
              `<li><a href="/${income}/${state}" class="text-blue-600 hover:underline">
                ${state.charAt(0).toUpperCase() + state.slice(1)}
              </a></li>`
            ).join('')}
          </ul>
        </div>
      `;
    });

    content += `</div></div>`;
    res.send(generatePageHTML("Home Affordability by Income Level", content));
  });

  // Dynamic income/state route
  app.get("/:income/:state", async (req: Request, res: Response) => {
    const { income, state } = req.params;
    const isApiRequest = req.headers.accept?.includes('application/json');

    // Validate parameters
    if (!incomes.includes(income) || !states.includes(state.toLowerCase())) {
      if (isApiRequest) {
        return res.status(404).json({ error: 'Invalid income or state' });
      }
      return res.status(404).send(generatePageHTML("Page Not Found", `
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold mb-6">Page Not Found</h1>
          <p>The requested income level or state combination is not supported.</p>
          <a href="/affordability-by-income-level" class="text-blue-600 hover:underline">
            Return to Income Levels
          </a>
        </div>
      `));
    }

    try {
      const incomeValue = parseInt(income.replace('k', '000'));
      const calculatorInput: CalculateAllScenariosInput = {
        householdIncome: incomeValue,
        downPayment: incomeValue * 0.2,
        monthlyDebt: 500,
        annualInterestRate: 7.5,
        loanTermYears: 30,
        state: state,
        filingStatus: "single"
      };

      const results = calculateAllScenarios(calculatorInput);

      if ('error' in results) {
        throw new Error(results.error);
      }

      if (isApiRequest) {
        return res.json(results);
      }

      const content = `
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold mb-6">
            How much house can I afford with ${income} salary in ${state.charAt(0).toUpperCase() + state.slice(1)}?
          </h1>
          <div class="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h2 class="text-2xl font-semibold mb-4">Summary</h2>
            <div class="space-y-4">
              <p><strong>Maximum Home Price:</strong> $${new Intl.NumberFormat().format(results.maxMortgageStats?.mortgagePaymentStats?.purchasePrice || 0)}</p>
              <p><strong>Monthly Payment:</strong> $${new Intl.NumberFormat().format(results.maxMortgageStats?.mortgagePaymentStats?.monthlyMortgagePayment || 0)}</p>
              <p><strong>Down Payment:</strong> $${new Intl.NumberFormat().format(calculatorInput.downPayment)}</p>
            </div>
          </div>
          <a href="/affordability-by-income-level" class="text-blue-600 hover:underline">
            View Other Income Levels
          </a>
        </div>
      `;

      res.send(generatePageHTML(
        `${income} Salary Home Affordability in ${state.charAt(0).toUpperCase() + state.slice(1)}`,
        content
      ));
    } catch (error) {
      console.error("Error generating affordability page:", error);
      if (isApiRequest) {
        return res.status(500).json({ error: 'Failed to calculate affordability' });
      }
      res.status(500).send(generatePageHTML("Error", `
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-3xl font-bold mb-6">Error</h1>
          <p>Sorry, we couldn't calculate the affordability for this scenario.</p>
          <a href="/affordability-by-income-level" class="text-blue-600 hover:underline">
            Return to Income Levels
          </a>
        </div>
      `));
    }
  });

  // API Routes
  app.get("/api/current-rate", async (_req: Request, res: Response) => {
    try {
      const response = await fetch('https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&api_key=5e20a3e5e3f4547a87e7f935602f4504&file_type=json&limit=1&sort_order=desc');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("FRED API Error:", error);
      res.status(500).json({ error: "Failed to fetch interest rate" });
    }
  });
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