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
  // Validate inputs
  if (annualNetIncome <= 0 || monthlyMortgagePayment < 0) {
    return {
      error:
        "Annual net income must be greater than 0, and monthly mortgage payment cannot be negative.",
      monthlyNetIncome: 0,
      mortgage: {
        mortgagePayment: Math.round(monthlyMortgagePayment),
        mortgagePercentage: 0,
      },
      debt: {
        amount: Math.round(monthlyDebt),
        percentage: 0,
      },
      remainingNeeds: {
        amount: 0,
        percentage: 0,
      },
      wants: {
        amount: 0,
        percentage: 0,
      },
      savings: {
        amount: 0,
        percentage: 0,
      },
    };
  }

  // Convert annual net income to monthly
  const monthlyNetIncome = annualNetIncome / 12;

  // Calculate budget allocations
  const totalNeeds = monthlyNetIncome * 0.5; // 50% for needs
  const wants = monthlyNetIncome * 0.3; // 30% for wants
  let savings = monthlyNetIncome * 0.2; // 20% for savings

  // Calculate total fixed costs (mortgage + debt)
  const totalFixedCosts = monthlyMortgagePayment + monthlyDebt;

  // Determine if the mortgage exceeds 35% of monthly net income
  const maxFixedCostPercentage = 0.35;
  const maxFixedCost = monthlyNetIncome * maxFixedCostPercentage;

  let remainingNeeds: number;

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
      error: "Fixed costs exceed the total allocation for needs.",
      monthlyNetIncome: Math.round(monthlyNetIncome),
      mortgage: {
        mortgagePayment: Math.round(monthlyMortgagePayment),
        mortgagePercentage:
          Math.round((monthlyMortgagePayment / monthlyNetIncome) * 100) / 100,
      },
      debt: {
        amount: Math.round(monthlyDebt),
        percentage: Math.round((monthlyDebt / monthlyNetIncome) * 100) / 100,
      },
      remainingNeeds: {
        amount: 0,
        percentage: 0,
      },
      wants: {
        amount: Math.round(wants),
        percentage: Math.round((wants / monthlyNetIncome) * 100) / 100,
      },
      savings: {
        amount: Math.round(savings),
        percentage: Math.round((savings / monthlyNetIncome) * 100) / 100,
      },
    };
  }

  // Handle cases where the mortgage exceeds the needs budget
  if (
    monthlyNetIncome <
    monthlyMortgagePayment + monthlyDebt + wants + savings + remainingNeeds
  ) {
    return {
      error: "Too high a mortgage for Monthly Income.",
      monthlyNetIncome: Math.round(monthlyNetIncome),
      mortgage: {
        mortgagePayment: Math.round(monthlyMortgagePayment),
        mortgagePercentage:
          Math.round((monthlyMortgagePayment / monthlyNetIncome) * 100) / 100,
      },
      debt: {
        amount: Math.round(monthlyDebt),
        percentage: Math.round((monthlyDebt / monthlyNetIncome) * 100) / 100,
      },
      remainingNeeds: {
        amount: 0,
        percentage: 0,
      },
      wants: {
        amount: Math.round(wants),
        percentage: Math.round((wants / monthlyNetIncome) * 100) / 100,
      },
      savings: {
        amount: Math.round(savings),
        percentage: Math.round((savings / monthlyNetIncome) * 100) / 100,
      },
    };
  }

  console.log("Step 5 Complete");

  return {
    monthlyNetIncome: Math.round(monthlyNetIncome),
    mortgage: {
      mortgagePayment: Math.round(monthlyMortgagePayment),
      mortgagePercentage:
        Math.round((monthlyMortgagePayment / monthlyNetIncome) * 100) / 100,
    },
    debt: {
      amount: Math.round(monthlyDebt),
      percentage: Math.round((monthlyDebt / monthlyNetIncome) * 100) / 100,
    },
    remainingNeeds: {
      amount: Math.round(remainingNeeds),
      percentage: Math.round((remainingNeeds / monthlyNetIncome) * 100) / 100,
    },
    wants: {
      amount: Math.round(wants),
      percentage: Math.round((wants / monthlyNetIncome) * 100) / 100,
    },
    savings: {
      amount: Math.round(savings),
      percentage: Math.round((savings / monthlyNetIncome) * 100) / 100,
    },
  };
}

export { calculateSimpleMonthlyBudget, BudgetOutput };
