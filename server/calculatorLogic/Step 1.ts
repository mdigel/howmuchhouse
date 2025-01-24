interface DebtCheckOutput {
  below6: boolean;
  debtPercentage: number;
}

interface savingScenarioError {
  scenarioDescription: string;
  message: string;
  details: string;
};

interface calculationError {
  maxScenario: {
    exists: boolean;
    message: string;
    details: string;
  };
  savingsScenario:savingScenarioError[];
  inputError: {
    exists: boolean;
    message: string;
    details: string;
  };
}

function debtCheck(annualIncome: number, monthlyDebt: number): DebtCheckOutput {
  console.log(annualIncome, monthlyDebt);

  // Validate inputs
  if (typeof annualIncome !== "number" || typeof monthlyDebt !== "number") {
    throw new Error("Both annualIncome and monthlyDebt must be numbers.");
  }
  if (annualIncome <= 0) {
    throw new Error("Annual income must be a positive number.");
  }
  if (monthlyDebt < 0) {
    throw new Error("Monthly debt cannot be negative.");
  }

  // Calculate debt percentage
  const monthlyIncome = annualIncome / 12;
  const debtPercentage = monthlyDebt / monthlyIncome;

  // Determine if debt percentage is below 8%
  const below6 = debtPercentage <= 0.08;

  console.log("Step 1 Complete");

  return {
    below6,
    debtPercentage: Math.round(debtPercentage * 100) / 100, // Round to two decimal places for readability
  };
}

export { debtCheck, DebtCheckOutput, calculationError };
