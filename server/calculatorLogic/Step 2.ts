function calculateMaxMortgagePayment(
  householdIncome: number,
  debtToIncomeRatio: number = 0.28
): number {
  // Validate inputs
  if (householdIncome <= 0) {
    throw new Error('Household income must be a positive number');
  }

  // Calculate maximum monthly mortgage payment
  const monthlyIncome = householdIncome / 12;
  const maxMortgagePayment = monthlyIncome * debtToIncomeRatio;

  console.log('Step 2 Complete');

  return Math.round(maxMortgagePayment * 100) / 100;
}

export { calculateMaxMortgagePayment };