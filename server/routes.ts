import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16"
});

export function registerRoutes(app: Express): Server {
  app.post("/api/calculate", async (req, res) => {
    try {
      // This would call your existing calculator function
      // For now, we'll just echo back some mock data
      const mockResults = {
        incomeSummary: {
          grossIncome: 358000,
          adjustedGrossIncome: 358000,
          federalTax: 66072,
          stateTax: 38485,
          socialSecurityTax: 9932.4,
          medicareTax: 5191,
          additionalMedicareTax: 972,
          totalTax: 120652.4,
          childTaxCredit: 0,
          netIncome: 237347.6
        },
        maxHomePrice: {
          description: "Max Mortgage Scenario",
          mortgagePaymentStats: {
            purchasePrice: 1232666.5,
            loanAmount: 1082666.5,
            downpayment: 150000,
            totalPayment: 8356.26,
            mortgagePayment: 6754.43,
            propertyTax: 1027.22,
            pmi: 415.02,
            homeownersInsurance: 159.58,
            hoa: 0
          },
          scenario: {
            monthlyNetIncome: 19778.97,
            mortgage: { mortgagePayment: 8353.33, mortgagePercentage: 0.42 },
            wants: { amount: 5933.69, percentage: 0.3 },
            remainingNeeds: { amount: 2966.84, percentage: 0.15 },
            savings: { amount: 2525.1, percentage: 0.13 }
          }
        },
        savingScenarios: [/* ... your saving scenarios ... */]
      };

      res.json(mockResults);
    } catch (error) {
      res.status(500).json({ error: "Calculation failed" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    const { message, calculatorData, isPaid } = req.body;

    try {
      // Here you would integrate with your AI service
      const mockResponse = "Based on your income and current market conditions, " +
        "I can help you understand your home affordability better. " +
        "Would you like me to explain any specific aspects of the calculation?";

      res.json({ response: mockResponse });
    } catch (error) {
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  app.post("/api/create-checkout", async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "AI Chat Access",
                description: "Unlimited access to AI home buying assistant"
              },
              unit_amount: 299 // $2.99
            },
            quantity: 1
          }
        ],
        mode: "payment",
        success_url: `${process.env.REPLIT_DOMAINS?.split(",")[0]}/success`,
        cancel_url: `${process.env.REPLIT_DOMAINS?.split(",")[0]}/cancel`
      });

      res.json({ sessionId: session.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
