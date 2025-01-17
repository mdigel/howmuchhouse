import { BudgetOutput } from './Step 5';

type BudgetInput = {
  annualNetIncome: number;
  savingsPercentage: number;
  remainingNeedsPercentage?: number; // chatGPT says remaining Needs should be 5-15%
  wantsPercentage?: number;
  monthlyDebt: number;
};


function calculateComplexBudgetMortgagePayment({
  annualNetIncome,
  savingsPercentage,
  remainingNeedsPercentage = 0.15, // Default: 15%
  wantsPercentage = 0.3, // Default: 30%
  monthlyDebt,
}: BudgetInput): BudgetOutput {
  // Input validation
  if (
    annualNetIncome <= 0 ||
    savingsPercentage < 0 ||
    savingsPercentage > 1 ||
    monthlyDebt < 0
  ) {
    throw new Error(
      'Inputs must be positive numbers, and savings percentage must be between 0 and 1'
    );
  }

  // Calculate monthly income values
  const monthlyNetIncome = annualNetIncome / 12;

  // Calculate baseline needs and wants amounts
  const remainingNeeds = remainingNeedsPercentage * monthlyNetIncome;
  const wants = wantsPercentage * monthlyNetIncome;

  // Calculate savings amount based on savings percentage
  const savingsAmount = savingsPercentage * monthlyNetIncome;

  // Calculate available budget and mortgage payment
  const availableBudget = monthlyNetIncome - wants - savingsAmount;
  let mortgagePayment = availableBudget - remainingNeeds - monthlyDebt;

  // Ensure mortgage payment is not zero or negative
  if (mortgagePayment <= 0) {
    throw new Error(
      'Savings percentage not possible with given income and expenses'
    );
  }

  // Ensure all amounts add up to net income
  const totalAllocated =
    remainingNeeds + wants + savingsAmount + mortgagePayment + monthlyDebt;
  if (Math.abs(totalAllocated - monthlyNetIncome) > 1) {
    // Allowing a small tolerance for floating-point precision
    throw new Error('The allocated amounts do not add up to the net income');
  }

  console.log('Step 6 Complete');
  // Return the monthly mortgage payment amount & associated stats
  return {
    monthlyNetIncome,
    mortgage: {
      mortgagePayment: Math.round(mortgagePayment * 100) / 100,
      mortgagePercentage:
        Math.round((mortgagePayment / monthlyNetIncome) * 100) / 100,
    },
    debt: {
      amount: monthlyDebt,
      percentage: Math.round((monthlyDebt / monthlyNetIncome) * 100) / 100,
    },
    remainingNeeds: {
      amount: Math.round(remainingNeeds * 100) / 100,
      percentage: remainingNeedsPercentage,
    },
    wants: {
      amount: Math.round(wants * 100) / 100,
      percentage: wantsPercentage,
    },
    savings: {
      amount: Math.round(savingsAmount * 100) / 100,
      percentage: savingsPercentage,
    },
  };
}

export { calculateComplexBudgetMortgagePayment };