import {
  calculateLoanAmountFromMonthlyPayment,
  LoanCalculationResult,
} from './Step 3';
import { BudgetOutput } from './Step 5';
import { ComplexBudgetBreakdown } from './Step 7';

type MortgageAndBudgetStatsPerScenario = {
  description: string;
  mortgagePaymentStats: LoanCalculationResult;
  scenarioBudget: ComplexBudgetBreakdown;
};

function calculateMortgageForEachSavingScenario(
  allSavingScenarios: ComplexBudgetBreakdown[],
  downPayment: number,
  annualInterestRate: number,
  loanTermYears: number,
  hoaFees: number = 0, // Default HOA fees to $0
  homeownersInsurance: number = 1915, // Default Homeowners Insurance to $1,915/year
  pmiInput: number | null = null, // Optional PMI as input (annual), default to null
  propertyTaxInput: number | null = null // Optional property tax as input (annual dollar amount), default to null
): MortgageAndBudgetStatsPerScenario[] {
  if (!allSavingScenarios[0]?.savings?.percentage) {
    throw new Error('Input does not have the correct object');
  }

  if (!allSavingScenarios[0]?.mortgage?.mortgagePayment) {
    throw new Error('Input does not have the correct object');
  }

  const results: MortgageAndBudgetStatsPerScenario[] = [];

  for (const scenario of allSavingScenarios) {
    try {
      const mortgagePaymentStats = calculateLoanAmountFromMonthlyPayment({
        desiredMonthlyPayment: scenario.mortgage.mortgagePayment,
        downPayment,
        annualInterestRate,
        loanTermYears,
        hoaFees,
        homeownersInsurance,
        pmiInput,
        propertyTaxInput,
      });

      results.push({
        description: `${(scenario.savings.percentage * 100).toFixed(
          2
        )}% Saving Scenario`,
        mortgagePaymentStats,
        scenarioBudget: scenario,
      });
    } catch (error: any) {
      results.push({
        description: `${(scenario.savings.percentage * 100).toFixed(
          2
        )}% Saving Scenario`,
        mortgagePaymentStats: error.message,
        scenarioBudget: scenario,
      });
    }
  }

  console.log('Step 8 Complete');
  return results;
}

export {
  calculateMortgageForEachSavingScenario,
  MortgageAndBudgetStatsPerScenario,
};
