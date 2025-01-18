type BudgetInput = {
  annualNetIncome: number;
  monthlyMortgagePayment: number;
  monthlyDebt: number;
};

type BudgetOutput = {
  monthlyNetIncome: number;
  mortgage: {
    mortgagePayment: number;
    mortgagePercentage: number;
  };
  debt: {
    amount: number;
    percentage: number;
  };
  remainingNeeds: {
    amount: number;
    percentage: number;
  };
  wants: {
    amount: number;
    percentage: number;
  };
  savings: {
    amount: number;
    percentage: number;
  };
  error?: string;
};

function calculateSimpleMonthlyBudget({
  annualNetIncome,
  monthlyMortgagePayment,
  monthlyDebt,
}: BudgetInput): BudgetOutput {
  // Basic input validation
  if (annualNetIncome <= 0) {
    return {
      error: "Annual net income must be greater than 0",
      monthlyNetIncome: 0,
      mortgage: { mortgagePayment: 0, mortgagePercentage: 0 },
      debt: { amount: 0, percentage: 0 },
      remainingNeeds: { amount: 0, percentage: 0 },
      wants: { amount: 0, percentage: 0 },
      savings: { amount: 0, percentage: 0 },
    };
  }

  const monthlyNetIncome = annualNetIncome / 12;

  // Calculate total fixed costs (mortgage + debt)
  const totalFixedCosts = monthlyMortgagePayment + monthlyDebt;
  const fixedCostRatio = totalFixedCosts / monthlyNetIncome;
  const remainingIncomeRatio = 1 - fixedCostRatio;

  // More lenient maximum ratio of 60% for fixed costs
  const maxFixedCostRatio = 0.60;

  // Calculate budget allocations
  const remainingNeeds: { amount: number; percentage: number } = {
    amount: Math.round(monthlyNetIncome * Math.max(0.15, remainingIncomeRatio * 0.3)),
    percentage: Math.max(0.15, remainingIncomeRatio * 0.3),
  };

  const wants = {
    amount: Math.round(monthlyNetIncome * Math.max(0.15, remainingIncomeRatio * 0.3)),
    percentage: Math.max(0.15, remainingIncomeRatio * 0.3),
  };

  const savings = {
    amount: Math.round(monthlyNetIncome * Math.max(0.1, remainingIncomeRatio * 0.2)),
    percentage: Math.max(0.1, remainingIncomeRatio * 0.2),
  };

  return {
    monthlyNetIncome: Math.round(monthlyNetIncome),
    mortgage: {
      mortgagePayment: Math.round(monthlyMortgagePayment),
      mortgagePercentage: Math.round((monthlyMortgagePayment / monthlyNetIncome) * 100) / 100,
    },
    debt: {
      amount: Math.round(monthlyDebt),
      percentage: Math.round((monthlyDebt / monthlyNetIncome) * 100) / 100,
    },
    remainingNeeds,
    wants,
    savings,
    ...(fixedCostRatio > maxFixedCostRatio
      ? {
          error: `Warning: Fixed costs (${Math.round(fixedCostRatio * 100)}%) exceed recommended maximum (${Math.round(maxFixedCostRatio * 100)}%)`,
        }
      : {}),
  };
}

export { calculateSimpleMonthlyBudget, BudgetOutput };