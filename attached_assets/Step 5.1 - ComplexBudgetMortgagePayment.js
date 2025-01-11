function calculateComplexBudgetMortgagePayment({
  annualNetIncome,
  savingsPercentage,
  remainingNeedsPercentage = 0.15, // chatGPT says remaining Needs should be 5-15%
  wantsPercentage = 0.3,
  monthlyDebt,
} = {}) {
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

  // Return the monthly mortgage payment amount & assoicated stats
  return {
    mortgage: {
      mortgagePayment: +mortgagePayment.toFixed(2),
      mortgagePercentage: +(mortgagePayment / monthlyNetIncome).toFixed(2),
    },
    debt: {
      debtPayment: monthlyDebt,
      debtPercentage: +(monthlyDebt / monthlyNetIncome).toFixed(2),
    },

    remainingNeeds: {
      amount: +remainingNeeds.toFixed(2),
      percentage: remainingNeedsPercentage,
    },
    wants: {
      amount: +wants.toFixed(2),
      percentage: wantsPercentage,
    },
    savings: {
      amount: +savingsAmount.toFixed(2),
      percentage: savingsPercentage,
    },
  };
}

// Example usage:
// const annualNetIncome = 242_000; // annual net income
// const savingsPercentage = 0.15; // desired saving percentage (e.g., 10%)
// const mortgagePayment = calculateComplexBudgetMortgagePayment(
//   annualNetIncome,
//   savingsPercentage
// );
// console.log(mortgagePayment);

module.exports = { calculateComplexBudgetMortgagePayment };
