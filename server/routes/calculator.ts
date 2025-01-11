import { Router } from 'express';
import { debtCheck } from '../calculator/debtCheck';
import type { CalculatorInput } from '../calculator/types';

const router = Router();

// Calculator endpoint with TypeScript validation
router.post("/calculate", async (req, res) => {
  try {
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
    } = req.body as CalculatorInput;

    // Input validation
    if (!householdIncome || !downPayment || monthlyDebt === undefined) {
      return res.status(400).json({ 
        error: "Missing required fields",
        message: "Please provide householdIncome, downPayment, and monthlyDebt"
      });
    }

    // Test the debt check function
    const debtCheckResult = debtCheck(householdIncome, monthlyDebt);
    
    // For now, return just the debt check result while we implement the rest
    res.json({
      debtCheck: {
        debCheckOutcome: debtCheckResult.below6,
        debtCheckPercent: debtCheckResult.debtPercentage
      }
    });

  } catch (error) {
    console.error("Calculate endpoint error:", error);
    res.status(500).json({ 
      error: "Calculation failed",
      message: error instanceof Error ? error.message : "An unexpected error occurred"
    });
  }
});

export default router;
