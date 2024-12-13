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
      const { householdIncome, downPayment } = req.body;
      
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
            description: "20% Saving Scenario",
            mortgagePaymentStats: {
              purchasePrice: Number(householdIncome) * 2.5,
              loanAmount: (Number(householdIncome) * 2.5) - Number(downPayment),
              downpayment: Number(downPayment),
              totalPayment: ((Number(householdIncome) * 2.5) * 0.06) / 12,
              mortgagePayment: ((Number(householdIncome) * 2.5) * 0.048) / 12,
              propertyTax: ((Number(householdIncome) * 2.5) * 0.01) / 12,
              pmi: Number(downPayment) < (Number(householdIncome) * 2.5) * 0.2 ? 75 : 0,
              homeownersInsurance: 159.58,
              hoa: 0
            },
            scenario: {
              mortgage: { amount: ((Number(householdIncome) * 2.5) * 0.06) / 12, percentage: 0.3 },
              wants: { amount: (Number(householdIncome) * 0.3) / 12, percentage: 0.3 },
              remainingNeeds: { amount: (Number(householdIncome) * 0.2) / 12, percentage: 0.2 },
              savings: { amount: (Number(householdIncome) * 0.2) / 12, percentage: 0.2 }
            }
          },
          {
            description: "25% Saving Scenario",
            mortgagePaymentStats: {
              purchasePrice: Number(householdIncome) * 2.2,
              loanAmount: (Number(householdIncome) * 2.2) - Number(downPayment),
              downpayment: Number(downPayment),
              totalPayment: ((Number(householdIncome) * 2.2) * 0.06) / 12,
              mortgagePayment: ((Number(householdIncome) * 2.2) * 0.048) / 12,
              propertyTax: ((Number(householdIncome) * 2.2) * 0.01) / 12,
              pmi: Number(downPayment) < (Number(householdIncome) * 2.2) * 0.2 ? 50 : 0,
              homeownersInsurance: 159.58,
              hoa: 0
            },
            scenario: {
              mortgage: { amount: ((Number(householdIncome) * 2.2) * 0.06) / 12, percentage: 0.25 },
              wants: { amount: (Number(householdIncome) * 0.3) / 12, percentage: 0.3 },
              remainingNeeds: { amount: (Number(householdIncome) * 0.2) / 12, percentage: 0.2 },
              savings: { amount: (Number(householdIncome) * 0.25) / 12, percentage: 0.25 }
            }
          },
          {
            description: "30% Saving Scenario",
            mortgagePaymentStats: {
              purchasePrice: Number(householdIncome) * 1.9,
              loanAmount: (Number(householdIncome) * 1.9) - Number(downPayment),
              downpayment: Number(downPayment),
              totalPayment: ((Number(householdIncome) * 1.9) * 0.06) / 12,
              mortgagePayment: ((Number(householdIncome) * 1.9) * 0.048) / 12,
              propertyTax: ((Number(householdIncome) * 1.9) * 0.01) / 12,
              pmi: Number(downPayment) < (Number(householdIncome) * 1.9) * 0.2 ? 0 : 0,
              homeownersInsurance: 159.58,
              hoa: 0
            },
            scenario: {
              mortgage: { amount: ((Number(householdIncome) * 1.9) * 0.06) / 12, percentage: 0.2 },
              wants: { amount: (Number(householdIncome) * 0.3) / 12, percentage: 0.3 },
              remainingNeeds: { amount: (Number(householdIncome) * 0.2) / 12, percentage: 0.2 },
              savings: { amount: (Number(householdIncome) * 0.3) / 12, percentage: 0.3 }
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
