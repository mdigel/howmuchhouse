// Import modules
import { forEachChild } from "typescript";
import { debtCheck, DebtCheckOutput, calculationError } from "./Step 1";
import { calculateMaxMortgagePayment } from "./Step 2";
import {
  calculateLoanAmountFromMonthlyPayment,
  LoanCalculationResult,
} from "./Step 3";
import {
  calculateNetIncome,
  NetIncomeAnnualStats,
  FilingStatus,
} from "./Step 4";
import { calculateSimpleMonthlyBudget, BudgetOutput } from "./Step 5";
import {
  calculateComplexBudgetsForSavingsPercentages,
  ComplexBudgetBreakdown,
} from "./Step 7";
import {
  calculateMortgageForEachSavingScenario,
  MortgageAndBudgetStatsPerScenario,
} from "./Step 8";
import {
  transformCalculateAllScenariosOutput,
  CalculatorResults,
} from "./Step 9";

// Interfaces

interface CalculateAllScenariosInput {
  householdIncome: number;
  downPayment: number;
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
  monthlyDebt: number;
}

// Main Function
function calculateAllScenarios({
  householdIncome,
  downPayment,
  annualInterestRate,
  loanTermYears,
  state,
  filingStatus,
  hoaFees = 0,
  homeownersInsurance = 1915,
  pmiInput = null,
  propertyTaxInput = null,
  pretaxContributions = 0,
  dependents = 0,
  monthlyDebt,
}: CalculateAllScenariosInput): CalculatorResults | { error: string } {
  // Create error object
  let calculationError: calculationError = {
    maxScenario: {
      exists: false,
      message: "",
      details: "",
    },
    savingsScenario: [],
    inputError: {
      exists: false,
      message: "",
      details: "",
    },
  };

  // STEP 1: Debt Check
  const debtOutput: DebtCheckOutput = debtCheck(householdIncome, monthlyDebt);
  let maxMonthlyMortgagePayment = 0;

  // STEP 2: Calculate Max Mortgage Payment
  if (debtOutput.below6) {
    maxMonthlyMortgagePayment = calculateMaxMortgagePayment(householdIncome);
  } else {
    const allowedDIR = 0.36 - debtOutput.debtPercentage;
    maxMonthlyMortgagePayment = calculateMaxMortgagePayment(
      householdIncome,
      allowedDIR,
    );
  }

  // STEP 3: Loan Amount and Purchase Price
  const maxPurchasePriceStats: LoanCalculationResult =
    calculateLoanAmountFromMonthlyPayment({
      desiredMonthlyPayment: maxMonthlyMortgagePayment,
      downPayment,
      annualInterestRate,
      loanTermYears,
    });

  // STEP 4: Net Income Calculation

  const netIncomeAnnualStats: NetIncomeAnnualStats = calculateNetIncome(
    householdIncome,
    state,
    filingStatus as FilingStatus,
  );

  // STEP 5: Simple Monthly Budget
  // Calculate simple monthly budget with max mortgage allowed by bank
  const baselineBudgetDIR28: BudgetOutput = calculateSimpleMonthlyBudget({
    annualNetIncome: netIncomeAnnualStats.netIncome,
    monthlyMortgagePayment: maxMonthlyMortgagePayment,
    monthlyDebt,
  });

  // Check for Errors in Step 5
  if (baselineBudgetDIR28.error) {
    calculationError.maxScenario = {
      exists: true,
      message:
        "A reasonable budget is not possible with the max loan a Bank might give you based on the 28/36 DIR rule.",
      details: `Step 5 - ${baselineBudgetDIR28.error}`,
    };
  }

  // Create Max Mortgage stats & budget output for Step 5
  const maxMortgageWithBaselineBudgetOutput = {
    description:
      "Max Mortgage Scenario with as close to 50/30/20 budget as possible",
    mortgagePaymentStats: maxPurchasePriceStats,
    scenario: baselineBudgetDIR28,
  };

  // STEP 6 & 7: Complex Budgets for Saving Percentages
  const allSavingScenariosStats: (
    | ComplexBudgetBreakdown
    | { savingsPercentage: number; error: string }
  )[] = calculateComplexBudgetsForSavingsPercentages(
    netIncomeAnnualStats.netIncome,
    monthlyDebt,
  );

  // Check for Errors in Step 7
  allSavingScenariosStats.forEach((scenario) => {
    if ("error" in scenario) {
      calcuationError.savingsScenario.push({
        scenarioDescription: scenario.description,
        message:
          "This saving scenario had an error likely because it's not realistic",
        details: `Error within Step 7 specifically with the ${scenario.savingsPercentage} scenario. Error: ${scenario.error}`,
      });
    }
  });

  // STEP 8: Mortgage for Each Saving Scenario
  const savingsScenarioStats: MortgageAndBudgetStatsPerScenario[] =
    calculateMortgageForEachSavingScenario(
      allSavingScenariosStats as ComplexBudgetBreakdown[],
      downPayment,
      annualInterestRate,
      loanTermYears,
      hoaFees,
      homeownersInsurance,
      pmiInput,
      propertyTaxInput,
    );

  // STEP 9: Transfer Output for frontend
  //Prep calcOutput variable for transfer function
  const calcOutput = {
    incomeSummary: netIncomeAnnualStats,
    debtCheck: {
      debCheckOutcome: debtOutput.below6,
      debtCheckPercent: debtOutput.debtPercentage,
    },
    maxMortgageStats: maxMortgageWithBaselineBudgetOutput,
    allSavingsScenarios: savingsScenarioStats,
  };

  // Transform
  const finalOutput = transformCalculateAllScenariosOutput(
    calcOutput,
    monthlyDebt,
    calculationError,
  );

  // Return Final Output
  return finalOutput;
}

export { calculateAllScenarios, CalculateAllScenariosInput };
