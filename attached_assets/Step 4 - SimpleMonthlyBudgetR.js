function calculateSimpleMonthlyBudget({
  annualNetIncome,
  monthlyMortgagePayment,
  monthlyDebt,
} = {}) {
  // Validate inputs
  if (annualNetIncome <= 0 || monthlyMortgagePayment < 0) {
    return 'Annual net income must be greater than 0, and monthly mortgage payment cannot be negative.';
  }

  // Convert annual net income to monthly
  const monthlyNetIncome = annualNetIncome / 12;

  // Calculate budget allocations
  const totalNeeds = monthlyNetIncome * 0.5; // 50% for needs
  const wants = monthlyNetIncome * 0.3; // 30% for wants
  let savings = monthlyNetIncome * 0.2; // 20% for savings

  // Calculate total fixed costs (mortage + debt)
  const totalFixedCosts = monthlyMortgagePayment + monthlyDebt;

  // Determine if the mortgage exceeds 35% of monthly net income
  const maxFixedCostPercentage = 0.35;
  const maxFixedCost = monthlyNetIncome * maxFixedCostPercentage;

  let remainingNeeds;

  if (totalFixedCosts > maxFixedCost) {
    // If total fixed costs exceed 35%, adjust savings and remaining needs
    const excessFixedCosts = totalFixedCosts - maxFixedCost;
    savings = Math.max(0, savings - excessFixedCosts);
    remainingNeeds = monthlyNetIncome * 0.15; // Set remaining needs to 15% of monthly net income
  } else {
    // Standard remaining needs calculation
    remainingNeeds = totalNeeds - totalFixedCosts;
  }

  // Handle cases where fixed costs exceed the needs budget
  if (remainingNeeds < 0) {
    return {
      error: 'Fixed costs exceed the total allocation for needs.',
      monthlyNetIncome: monthlyNetIncome.toFixed(2),
      totalNeeds: totalNeeds.toFixed(2),
      totalFixedCosts: totalFixedCosts.toFixed(2),
      remainingNeeds: '0.00',
      wants: wants.toFixed(2),
      savings: savings.toFixed(2),
    };
  }

  // Handle cases where the mortgage exceeds the needs budget
  if (
    monthlyNetIncome <
    monthlyMortgagePayment + monthlyDebt + wants + savings + remainingNeeds
  ) {
    return {
      error: 'Too high a mortgage for Monthly Income.',
      monthlyNetIncome: monthlyNetIncome.toFixed(2),
      totalNeeds: totalNeeds.toFixed(2),
      mortgagePayment: monthlyMortgagePayment.toFixed(2),
      remainingNeeds: '0.00',
      wants: wants.toFixed(2),
      savings: savings.toFixed(2),
    };
  }

  console.log('Step 4 Complete');

  return {
    monthlyNetIncome: +monthlyNetIncome.toFixed(2),
    mortgage: {
      mortgagePayment: +monthlyMortgagePayment.toFixed(2),
      mortgagePercentage: +(monthlyMortgagePayment / monthlyNetIncome).toFixed(
        2
      ),
    },
    debt: {
      amount: +monthlyDebt.toFixed(2),
      percentage: +(monthlyDebt / monthlyNetIncome).toFixed(2),
    },
    remainingNeeds: {
      amount: +remainingNeeds.toFixed(2),
      percentage: +(remainingNeeds / monthlyNetIncome).toFixed(2),
    },
    wants: {
      amount: +wants.toFixed(2),
      percentage: +(wants / monthlyNetIncome).toFixed(2),
    },
    savings: {
      amount: +savings.toFixed(2),
      percentage: +(savings / monthlyNetIncome).toFixed(2),
    },
  };
}

// Example usage
// const budget = calculateSimpleMonthlyBudget(241_000, 20000); // $60,000 annual income, $1500 monthly mortgage payment
// console.log(budget);

module.exports = { calculateSimpleMonthlyBudget };
