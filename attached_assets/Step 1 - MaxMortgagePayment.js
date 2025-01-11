function calculateMaxMortgagePayment(
  householdIncome,
  debtToIncomeRatio = 0.28
) {
  // Validate inputs
  if (householdIncome <= 0) {
    throw new Error('Household income must be a positive number');
  }

  // Calculate maximum monthly mortgage payment
  const monthlyIncome = householdIncome / 12;
  const maxMortgagePayment = monthlyIncome * debtToIncomeRatio;

  console.log('Step 1 Complete');

  return Math.round(maxMortgagePayment * 100) / 100;
}

// Example usage
// try {
//   const annualIncome = 225000 + 133000;
//   const maxPayment = calculateMaxMortgagePayment(annualIncome);
//   console.log(`Maximum monthly mortgage payment: $${maxPayment}`);
// } catch (error) {
//   console.error(error.message);
// }

module.exports = { calculateMaxMortgagePayment };
