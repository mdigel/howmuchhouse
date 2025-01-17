// Import interfaces from other backend files
import { LoanCalculationResult } from './Step 3';
import { NetIncomeAnnualStats } from './Step 4';
import { BudgetOutput } from './Step 5';
import { ComplexBudgetBreakdown } from './Step 7';
import { MortgageAndBudgetStatsPerScenario } from './Step 8';

// Matt's function output
interface CalculateAllScenariosOutput {
  incomeSummary: NetIncomeAnnualStats;
  debtCheck: {
    debCheckOutcome: boolean;
    debtCheckPercent: number;
  };
  maxMortgageStats: {
    description: string;
    mortgagePaymentStats: LoanCalculationResult;
    scenario: BudgetOutput | string;
  };
  allSavingsScenarios: MortgageAndBudgetStatsPerScenario[];
}

// Frontend's Interfaces
interface CalculatorResults {
  incomeSummary: IncomeSummary;
  maxHomePrice: HomePrice;
  savingScenarios: HomePrice[];
  monthlyDebt: number; // <- also part of what the frontend wants
}

interface IncomeSummary {
  grossIncome: number;
  adjustedGrossIncome: number;
  federalTax: number;
  stateTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  additionalMedicareTax: number;
  totalTax: number;
  childTaxCredit: number;
  netIncome: number;
}

interface HomePrice {
  description: string;
  mortgagePaymentStats: MortgagePaymentStats;
  scenario: Scenario;
}

interface MortgagePaymentStats {
  purchasePrice: number;
  loanAmount: number;
  downpayment: number;
  totalPayment: number;
  mortgagePayment: number;
  propertyTax: number;
  pmi: number;
  homeownersInsurance: number;
  hoa: number;
}

interface Scenario {
  monthlyNetIncome?: number;
  mortgage: ScenarioBreakdown;
  wants: ScenarioBreakdown;
  remainingNeeds: ScenarioBreakdown;
  savings: ScenarioBreakdown;
}

interface ScenarioBreakdown {
  amount: number;
  percentage: number;
}

/**
 * Transform your custom CalculateAllScenariosOutput into the
 * CalculatorResults type used by the frontend.
 */
function transformCalculateAllScenariosOutput(
  calcOutput: CalculateAllScenariosOutput,
  monthlyDebtValue: number // pass monthlyDebt or derive from your numericInputs
): CalculatorResults {
  const { incomeSummary, maxMortgageStats, allSavingsScenarios } = calcOutput;

  // 1. Transform `incomeSummary` directly
  const frontendIncomeSummary: IncomeSummary = {
    ...incomeSummary, // both have the same field names
  };

  // 2. Transform `maxMortgageStats`
  //    The frontend expects { description, mortgagePaymentStats, scenario }
  const maxHomePrice: HomePrice = {
    description: maxMortgageStats.description,
    mortgagePaymentStats: {
      ...maxMortgageStats.mortgagePaymentStats,
    },
    scenario:
      typeof maxMortgageStats.scenario === 'string'
        ? transformStringScenario(maxMortgageStats.scenario) // handle edge case if needed
        : transformBudgetOutputToScenario(maxMortgageStats.scenario),
  };

  // 3. Transform `allSavingsScenarios` → `savingScenarios`
  const savingScenarios: HomePrice[] = allSavingsScenarios.map(
    (scenarioItem) => ({
      description: scenarioItem.description,
      mortgagePaymentStats: {
        ...scenarioItem.mortgagePaymentStats,
      },
      scenario: transformBudgetOutputToScenario(scenarioItem.scenarioBudget),
    })
  );

  // 4. Combine into the final `CalculatorResults` structure
  const finalResults: CalculatorResults = {
    incomeSummary: frontendIncomeSummary,
    maxHomePrice,
    savingScenarios,
    monthlyDebt: monthlyDebtValue, // from your logic or numericInputs
  };

  return finalResults;
}

/**
 * Helper to transform your `BudgetOutput` or `ComplexBudgetBreakdown`
 * into the `Scenario` type that the frontend expects.
 */
function transformBudgetOutputToScenario(
  budget: BudgetOutput | ComplexBudgetBreakdown
): Scenario {
  // Because BudgetOutput & ComplexBudgetBreakdown have the same base fields:
  return {
    monthlyNetIncome: budget.monthlyNetIncome,
    mortgage: {
      amount: budget.mortgage.mortgagePayment,
      percentage: budget.mortgage.mortgagePercentage,
    },
    wants: {
      amount: budget.wants.amount,
      percentage: budget.wants.percentage,
    },
    remainingNeeds: {
      amount: budget.remainingNeeds.amount,
      percentage: budget.remainingNeeds.percentage,
    },
    savings: {
      amount: budget.savings.amount,
      percentage: budget.savings.percentage,
    },
  };
}

/**
 * Optionally handle the case where the scenario
 * was returned as a string.
 */
function transformStringScenario(scenario: string): Scenario {
  // Fallback if needed, or parse if you store scenario data in the string
  return {
    monthlyNetIncome: 0,
    mortgage: { amount: 0, percentage: 0 },
    wants: { amount: 0, percentage: 0 },
    remainingNeeds: { amount: 0, percentage: 0 },
    savings: { amount: 0, percentage: 0 },
  };
}

export {
  transformCalculateAllScenariosOutput,
  CalculateAllScenariosOutput,
  CalculatorResults,
};
