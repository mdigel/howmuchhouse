interface DebtCheckResult {
  below6: boolean;
  debtPercentage: number;
}

export function debtCheck(annualIncome: number, monthlyDebt: number): DebtCheckResult {
  // Input validation with specific error messages
  if (typeof annualIncome !== 'number' || isNaN(annualIncome)) {
    throw new Error('Annual income must be a valid number');
  }
  if (typeof monthlyDebt !== 'number' || isNaN(monthlyDebt)) {
    throw new Error('Monthly debt must be a valid number');
  }
  if (annualIncome <= 0) {
    throw new Error('Annual income must be a positive number');
  }
  if (monthlyDebt < 0) {
    throw new Error('Monthly debt cannot be negative');
  }

  // Calculate debt percentage with proper rounding
  const monthlyIncome = annualIncome / 12;
  const debtPercentage = monthlyDebt / monthlyIncome;

  // Round to 2 decimal places for readability and consistency
  return {
    below6: debtPercentage <= 0.08,
    debtPercentage: Math.round(debtPercentage * 100) / 100
  };
}
