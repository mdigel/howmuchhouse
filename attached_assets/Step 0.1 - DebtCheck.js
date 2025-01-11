function debtCheck(annualIncome, monthlyDebt) {
  console.log(annualIncome, monthlyDebt);
  // Validate inputs
  if (typeof annualIncome !== 'number' || typeof monthlyDebt !== 'number') {
    throw new Error('Both annualIncome and monthlyDebt must be numbers.');
  }
  if (annualIncome <= 0) {
    throw new Error('Annual income must be a positive number.');
  }
  if (monthlyDebt < 0) {
    throw new Error('Monthly debt cannot be negative.');
  }

  // Calculate debt percentage
  const monthlyIncome = annualIncome / 12;
  const debtPercentage = monthlyDebt / monthlyIncome;

  // Determine if debt percentage is below 8%
  const below6 = debtPercentage <= 0.08;

  console.log('Step 0.1 Complete');

  return {
    below6,
    debtPercentage: Math.round(debtPercentage * 100) / 100, // Round to two decimal places for readability
  };
}

module.exports = { debtCheck };

// Test the function
// console.log(debtCheck(120000, 500)); // Example 1
// console.log(debtCheck(50000, 200)); // Example 2
// console.log(debtCheck(80000, 1000)); // Example 3
