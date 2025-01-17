import { BudgetOutput } from './Step 5';
import { calculateComplexBudgetMortgagePayment } from './Step 6';

type ComplexBudgetBreakdown = BudgetOutput & {
  savingsPercentage: number; // Adding the savings percentage to match the expected structure
};

function calculateComplexBudgetsForSavingsPercentages(
  annualNetIncome: number,
  monthlyDebt: number
): (ComplexBudgetBreakdown | { savingsPercentage: number; error: string })[] {
  const savingsPercentagesArray: number[] = [0.15, 0.2, 0.25];

  const results: (
    | ComplexBudgetBreakdown
    | { savingsPercentage: number; error: string }
  )[] = [];

  for (let savingsPercentage of savingsPercentagesArray) {
    try {
      const budgetOutput = calculateComplexBudgetMortgagePayment({
        annualNetIncome,
        savingsPercentage,
        monthlyDebt,
      });

      // Include the savingsPercentage in the output object
      results.push({
        ...budgetOutput,
        savingsPercentage,
      });
    } catch (error: any) {
      results.push({
        savingsPercentage: savingsPercentage,
        error: error.message,
      });
    }
  }

  console.log('Step 7 Complete');

  return results;
}

export { calculateComplexBudgetsForSavingsPercentages, ComplexBudgetBreakdown };